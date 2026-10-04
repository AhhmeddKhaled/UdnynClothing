function errorHandler(
  err,
  req,
  res,
  next
) {
  console.error(
    "Server error:",
    err
  );

  res.status(400).json({
    success: false,
    error:
      err.message ||
      "حدث خطأ في السيرفر",
  });
}

module.exports = errorHandler;