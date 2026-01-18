/**
 * Distributed Tracing Configuration
 * Integrates OpenTelemetry for observability across services
 */

const { NodeSDK } = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { trace, context } = require("@opentelemetry/api");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");

// Initialize OpenTelemetry SDK
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces",
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "college-media-backend",
    [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
  }),
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

// Start the SDK
sdk.start();

// Graceful shutdown
process.on("SIGTERM", () => {
  sdk.shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error) => console.error("Error terminating tracing", error))
    .finally(() => process.exit(0));
});

module.exports = {
  trace,
  context,
  tracer: trace.getTracer("college-media-backend", "1.0.0"),
};