const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");
const Order = require("../Models/Order");
const AvailableStock = require("../Models/AvailableStock");
const XLSX = require("xlsx");

const role = require('../seeds/roles');

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

const EGYPTIAN_GOVERNORATES = [
  "قاهره",
  "جيزة",
  "اسكندريه",
  "قليوبية",
  "البحيرة",
  "مطروح",
  "دمياط",
  "دقهلية",
  "كفر الشيخ",
  "غربيه",
  "المنوفية",
  "شرقيه",
  "بورسعيد",
  "اسماعيلية",
  "سويس",
  "شرم الشيخ",
  "فيوم",
  "بني سويف",
  "منيا",
  "اسيوط",
  "سوهاج",
  "قنا",
  "اقصر",
  "اسوان",
  "بحر الاحمر",
];

const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

function isAdmin(req) {
  const role = req.user?.role?.name;
  return role === "admin" || role === "owner";
}

function sendError(res, status, message) {
  return res.status(status).json({
    success: false,
    message,
  });
}

function getOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `UDN-${timestamp}-${random}`;
}

async function removeUploadedFiles(files = []) {
  await Promise.all(
    files.map(async (file) => {
      if (!file?.path) return;

      try {
        await fs.unlink(file.path);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error(
            "Unable to remove unused order image:",
            error.message
          );
        }
      }
    })
  );
}

async function createOrder(req, res, next) {
  let session;
  let orderCreated = false;
  const uploadedFiles = Array.isArray(req.files) ? req.files : [];

  
  try {
    const body = req.body || {};

    console.log("[CREATE ORDER DIAGNOSTIC]", {
      contentType: req.headers["content-type"],
      bodyKeys: Object.keys(body),
      customerName: body.customerName,
      customerNameType: typeof body.customerName,
      filesCount: uploadedFiles.length,
    });

    const {
      customerName,
      customerPhone,
      governorate,
      shippingAddress,
      customerNote = "",
      shippingCost = 0,
    } = body;

    let items = body.items;

    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        return sendError(res, 400, "Invalid order items format");
      }
    }

    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      customerName.trim().length > 120
    ) {
      return sendError(res, 400, "Valid customer name is required");
    }

    if (
      typeof customerPhone !== "string" ||
      !customerPhone.trim() ||
      customerPhone.trim().length > 30
    ) {
      return sendError(res, 400, "Valid customer phone is required");
    }

    if (
      typeof governorate !== "string" ||
      !EGYPTIAN_GOVERNORATES.includes(governorate.trim())
    ) {
      return sendError(res, 400, "Please select a valid governorate");
    }

    if (
      typeof shippingAddress !== "string" ||
      !shippingAddress.trim() ||
      shippingAddress.trim().length > 1000
    ) {
      return sendError(res, 400, "Valid shipping address is required");
    }

    if (
      typeof customerNote !== "string" ||
      customerNote.length > 2000
    ) {
      return sendError(res, 400, "Invalid customer note");
    }

    const parsedShippingCost = Number(shippingCost);

    if (
      !Number.isFinite(parsedShippingCost) ||
      parsedShippingCost < 0 ||
      !Number.isSafeInteger(Math.round(parsedShippingCost * 100))
    ) {
      return sendError(res, 400, "Invalid shipping cost");
    }

    if (!Array.isArray(items) || items.length === 0) {
      return sendError(
        res,
        400,
        "Order must contain at least one item"
      );
    }

    if (items.length > 100) {
      return sendError(res, 400, "Order contains too many items");
    }

    const imagePathByItemId = new Map();

    for (const file of uploadedFiles) {
      const match = /^itemImage_(\d+)$/.exec(file.fieldname);

      if (!match) {
        return sendError(
          res,
          400,
          "An uploaded image has an invalid field name"
        );
      }

      const itemId = Number(match[1]);

      if (!Number.isSafeInteger(itemId) || itemId <= 0) {
        return sendError(
          res,
          400,
          "An uploaded image has an invalid product ID"
        );
      }

      if (imagePathByItemId.has(itemId)) {
        return sendError(
          res,
          400,
          `More than one image was uploaded for item ${itemId}`
        );
      }

      imagePathByItemId.set(
        itemId,
        `/uploads/order-items/${path.basename(file.filename)}`
      );
    }

    const quantitiesByItemId = new Map();

    for (const item of items) {
      const itemId = Number(item?.itemId);
      const quantity = Number(item?.quantity);

      if (!Number.isSafeInteger(itemId) || itemId <= 0) {
        return sendError(
          res,
          400,
          "Each item must have a valid itemId"
        );
      }

      if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        return sendError(
          res,
          400,
          "Each quantity must be a positive integer"
        );
      }

      const combinedQuantity =
        (quantitiesByItemId.get(itemId) || 0) + quantity;

      if (!Number.isSafeInteger(combinedQuantity)) {
        return sendError(
          res,
          400,
          "Invalid combined item quantity"
        );
      }

      quantitiesByItemId.set(itemId, combinedQuantity);
    }

    for (const itemId of imagePathByItemId.keys()) {
      if (!quantitiesByItemId.has(itemId)) {
        return sendError(
          res,
          400,
          `An image was uploaded for item ${itemId}, which is not in the order`
        );
      }
    }

    const requestedItems = [...quantitiesByItemId.entries()].sort(
      ([a], [b]) => a - b
    );

    session = await mongoose.startSession();

    let responseOrder = null;

    await session.withTransaction(async () => {
      const orderItems = [];
      let subtotal = 0;

      for (const [itemId, quantity] of requestedItems) {
        const stockItem = await AvailableStock.findOneAndUpdate(
          {
            itemId,
            active: true,
            qty: { $gte: quantity },
          },
          {
            $inc: { qty: -quantity },
          },
          {
            new: true,
            session,
          }
        );

        if (!stockItem) {
          const existingItem = await AvailableStock.findOne({ itemId })
            .session(session)
            .lean();

          if (!existingItem || !existingItem.active) {
            const error = new Error(`Item ${itemId} is unavailable`);
            error.statusCode = 409;
            throw error;
          }

          const error = new Error(
            `Insufficient stock for item ${itemId}`
          );
          error.statusCode = 409;
          throw error;
        }

        const offerPrice = Number(stockItem.offerPrice) || 0;
        const retailPrice = Number(stockItem.retailPrice) || 0;
        const unitPrice = offerPrice > 0 ? offerPrice : retailPrice;

        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          const error = new Error(
            `Invalid price configured for item ${itemId}`
          );
          error.statusCode = 500;
          throw error;
        }

        const lineTotal = Number((unitPrice * quantity).toFixed(2));
        subtotal = Number((subtotal + lineTotal).toFixed(2));

        orderItems.push({
          itemId: stockItem.itemId,
          name: stockItem.name,
          unitPrice,
          quantity,
          lineTotal,
          realImagePath: imagePathByItemId.get(itemId) || null,
        });
      }

      const totalAmount = Number(
        (subtotal + parsedShippingCost).toFixed(2)
      );

      const [createdOrder] = await Order.create(
        [
          {
            orderNumber: getOrderNumber(),

            customer: null,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),

            items: orderItems,
            subtotal,
            shippingCost: parsedShippingCost,
            totalAmount,

            governorate: governorate.trim(),
            shippingAddress: shippingAddress.trim(),
            customerNote: customerNote.trim(),
            status: "pending",
          },
        ],
        { session }
      );

      responseOrder = createdOrder;
    });

    orderCreated = true;

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: responseOrder,
    });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }

    if (error.code === 11000) {
      return sendError(
        res,
        409,
        "Order number conflict. Please try again."
      );
    }

    return next(error);
  } finally {
    if (session) {
      await session.endSession();
    }

    if (!orderCreated) {
      await removeUploadedFiles(uploadedFiles);
    }
  }
}

async function getMyOrders(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const filter = { customer: req.user._id };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    return next(error);
  }
}

async function getAllOrders(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    );

    const filter = {};

    if (req.query.status) {
      if (!VALID_STATUSES.includes(req.query.status)) {
        return sendError(res, 400, "Invalid order status filter");
      }

      filter.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid order ID");
    }

    let orderQuery = Order.findById(id);

    if (isAdmin(req)) {
      orderQuery = orderQuery.populate("customer", "name email");
    }

    const order = await orderQuery.lean();

    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    const customerId =
      order.customer?._id?.toString() ||
      order.customer?.toString();

    const ownsOrder =
      Boolean(customerId) &&
      customerId === req.user._id.toString();

    if (!isAdmin(req) && !ownsOrder) {
      return sendError(res, 403, "You cannot access this order");
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  let session;

  try {
    if (!isAdmin(req)) {
      return sendError(
        res,
        403,
        "Only admins can update order status"
      );
    }

    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid order ID");
    }

    if (!VALID_STATUSES.includes(status)) {
      return sendError(res, 400, "Invalid order status");
    }

    session = await mongoose.startSession();

    let updatedOrder = null;

    await session.withTransaction(async () => {
      const order = await Order.findById(id).session(session);

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      if (order.status === status) {
        updatedOrder = order;
        return;
      }

      const allowedNextStatuses = ALLOWED_TRANSITIONS[order.status] || [];

      if (!allowedNextStatuses.includes(status)) {
        const error = new Error(
          `Cannot change order status from ${order.status} to ${status}`
        );
        error.statusCode = 409;
        throw error;
      }

      // Restore stock exactly once when cancelling.
      if (status === "cancelled") {
        if (order.stockRestored) {
          const error = new Error("Stock has already been restored");
          error.statusCode = 409;
          throw error;
        }

        for (const item of order.items) {
          const result = await AvailableStock.updateOne(
            { itemId: item.itemId },
            { $inc: { qty: item.quantity } },
            { session }
          );

          if (result.matchedCount !== 1) {
            const error = new Error(
              `Cannot restore stock for item ${item.itemId}`
            );
            error.statusCode = 409;
            throw error;
          }
        }

        order.stockRestored = true;
      }

      order.status = status;
      order.statusUpdatedBy = req.user._id;
      order.statusUpdatedAt = new Date();

      await order.save({ session });
      updatedOrder = order;
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }

    return next(error);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

async function deleteOrder(req, res, next) {
  let session;

  try {
    if (!isAdmin(req)) {
      return sendError(res, 403, "Only admins can delete orders");
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid order ID");
    }

    session = await mongoose.startSession();

    let deletedOrder = null;

    await session.withTransaction(async () => {
      const order = await Order.findById(id).session(session);

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      // Don't restore stock for shipped or delivered orders.
      // Cancelled orders may already have had their stock restored.
      const shouldRestoreStock =
        !order.stockRestored &&
        !["shipped", "delivered"].includes(order.status);

      if (shouldRestoreStock) {
        for (const item of order.items) {
          const result = await AvailableStock.updateOne(
            { itemId: item.itemId },
            { $inc: { qty: item.quantity } },
            { session }
          );

          if (result.matchedCount !== 1) {
            const error = new Error(
              `Cannot restore stock for item ${item.itemId}`
            );
            error.statusCode = 409;
            throw error;
          }
        }
      }

      const result = await Order.deleteOne(
        { _id: order._id },
        { session }
      );

      if (result.deletedCount !== 1) {
        const error = new Error("Order could not be deleted");
        error.statusCode = 409;
        throw error;
      }

      deletedOrder = {
        _id: order._id,
        orderNumber: order.orderNumber,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      order: deletedOrder,
    });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }

    return next(error);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

async function exportQPExpresse(req, res, next) {
  try {
    const filter = {};

    if (req.query.status) {
      if (!VALID_STATUSES.includes(req.query.status)) {
        return sendError(res, 400, "Invalid order status filter");
      }

      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      "full name",
      "phone",
      "address",
      "customer serial",
      "total amount",
      "notes",
      "order date",
      "shipment contents",
      "weight",
      "city",
    ];

    const rows = [
      headers,
      ...orders.map((order) => [
        order.customerName || order.customer?.name || "",
        order.customerPhone || "",
        order.shippingAddress || "",
        "",
        Number(order.totalAmount) || 0,
        order.customerNote || "",
        order.createdAt
          ? new Date(order.createdAt).toLocaleDateString("en-GB")
          : "",
        "ملابس",
        "",
        order.governorate || "",
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 18 },
      { wch: 40 },
      { wch: 18 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 22 },
      { wch: 10 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "QP Expresse"
    );

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="qp-expresse-orders.xlsx"'
    );

    res.setHeader("Content-Length", buffer.length);

    return res.status(200).send(buffer);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  exportQPExpresse,
  deleteOrder,
};