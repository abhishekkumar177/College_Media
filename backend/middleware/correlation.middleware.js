import { randomUUID } from "crypto";

export function correlationMiddleware(req, res, next) {
  const incomingId = req.headers["x-correlation-id"];
  const correlationId = incomingId || randomUUID();

  req.correlationId = correlationId;

  res.setHeader("X-Correlation-ID", correlationId);

  next();
}
