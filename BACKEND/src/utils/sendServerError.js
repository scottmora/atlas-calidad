function sendServerError(res, err, message) {
  console.error(err);
  return res.status(500).json({
    error: message,
    glosa: err.message || err.toString(),
  });
}

module.exports = sendServerError;
