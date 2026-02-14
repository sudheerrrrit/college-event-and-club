const notFound = (req, res) => {
  res.status(404).json({ message: `Not found - ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
};

module.exports = { notFound, errorHandler };
