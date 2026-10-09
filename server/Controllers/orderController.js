
const mongoose = require("mongoose");
const Order = require("../Models/Order");
const AvailableStock = require("../Models/AvailableStock");

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
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
  return req.user?.role?.name === "admin" ||
    req.user?.role?.name === "owner";
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

// POST /api/orders
async function createOrder(req, res, next) {
  const session = await mongoose.startSession();
  let responseOrder = null;

  try {
    const {
      items,
      shippingAddress = "",
      customerNote = "",
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return sendError(res, 400, "Order must contain at least one item");
    }

    if (items.length > 100) {
      return sendError(res, 400, "Order contains too many items");
    }

    if (typeof shippingAddress !== "string" || shippingAddress.length > 1000) {
      return sendError(res, 400, "Invalid shipping address");
    }

    if (typeof customerNote !== "string" || customerNote.length > 2000) {
      return sendError(res, 400, "Invalid customer note");
    }

    // Combine duplicate item IDs and validate all quantities.
    const quantitiesByItemId = new Map();

    for (const item of items) {
      const itemId = Number(item?.itemId);
      const quantity = Number(item?.quantity);

      if (!Number.isSafeInteger(itemId) || itemId <= 0) {
        return sendError(res, 400, "Each item must have a valid itemId");
      }

      if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        return sendError(res, 400, "Each quantity must be a positive integer");
      }

      const combinedQuantity =
        (quantitiesByItemId.get(itemId) || 0) + quantity;

      if (!Number.isSafeInteger(combinedQuantity)) {
        return sendError(res, 400, "Invalid combined item quantity");
      }

      quantitiesByItemId.set(itemId, combinedQuantity);
    }

    const requestedItems = [...quantitiesByItemId.entries()];

    await session.withTransaction(async () => {
      const orderItems = [];
      let totalAmount = 0;

      // Sort IDs to keep the update order consistent across requests.
      requestedItems.sort(([a], [b]) => a - b);

      for (const [itemId, quantity] of requestedItems) {
        // The stock decrement is conditional and atomic.
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

        // Offer price is used when valid and greater than zero.
        // Otherwise, use the retail price.
        const offerPrice = Number(stockItem.offerPrice) || 0;
        const retailPrice = Number(stockItem.retailPrice) || 0;
        const unitPrice =
          offerPrice > 0 ? offerPrice : retailPrice;

        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          const error = new Error(
            `Invalid price configured for item ${itemId}`
          );
          error.statusCode = 500;
          throw error;
        }

        const lineTotal = Number((unitPrice * quantity).toFixed(2));
        totalAmount = Number((totalAmount + lineTotal).toFixed(2));

        orderItems.push({
          itemId: stockItem.itemId,
          name: stockItem.name,
          unitPrice,
          quantity,
          lineTotal,
        });
      }

      const [createdOrder] = await Order.create(
        [
          {
            orderNumber: getOrderNumber(),
            customer: req.user._id,
            items: orderItems,
            totalAmount,
            shippingAddress: shippingAddress.trim(),
            customerNote: customerNote.trim(),
            status: "pending",
          },
        ],
        { session }
      );

      responseOrder = createdOrder;
    });

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

    next(error);
  } finally {
    await session.endSession();
  }
}

// GET /api/orders/my-orders
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
    next(error);
  }
}

// GET /api/orders
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
    next(error);
  }
}

// GET /api/orders/:id
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

    const ownsOrder =
      order.customer.toString() === req.user._id.toString();

    if (!isAdmin(req) && !ownsOrder) {
      return sendError(res, 403, "You cannot access this order");
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/orders/:id/status
async function updateOrderStatus(req, res, next) {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid order ID");
    }

    if (!VALID_STATUSES.includes(status)) {
      return sendError(res, 400, "Invalid order status");
    }

    let updatedOrder = null;
    let transactionError = null;

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

      // Return reserved stock exactly once when cancelling.
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

    next(error);
  } finally {
    await session.endSession();
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};