const requestLogger = (req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - startedAt;
    const status = res.statusCode;
    const level = status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO";
    console.log(`[${level}] ${req.method} ${req.originalUrl} ${status} - ${ms}ms`);
  });
  next();
};

export default requestLogger;
