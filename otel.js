const { NodeSDK } = require("@opentelemetry/sdk-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-http");
const { OTLPLogExporter } = require("@opentelemetry/exporter-logs-otlp-http");

const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");
const { SimpleLogRecordProcessor } = require("@opentelemetry/sdk-logs");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");

console.log("🔍 OTEL Preload: initializing...");

// --- Trace exporter (OTLP/HTTP) ---
const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces", // Change to LGTM OTLP endpoint
});

// --- Metrics exporter (OTLP/HTTP) ---
const metricExporter = new OTLPMetricExporter({
  url: "http://localhost:4318/v1/metrics", // Change to LGTM OTLP endpoint
});
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 60000, // every 60s
});

// --- Log exporter (OTLP/HTTP) ---
const logExporter = new OTLPLogExporter({
  url: "http://localhost:4318/v1/logs", // Change to LGTM OTLP endpoint
});

// --- SDK Setup ---
const sdk = new NodeSDK({
  traceExporter,
  metricReader,
  logRecordProcessor: new SimpleLogRecordProcessor(logExporter),
  instrumentations: [getNodeAutoInstrumentations()],
});

// Start the SDK before app code
sdk.start();
console.log("✅ OTEL SDK started");

// Ensure clean shutdown on exit
process.on("SIGTERM", async () => {
  try {
    await sdk.shutdown();
    console.log("🛑 OTEL SDK shut down");
  } catch (err) {
    console.error("❌ Error during OTEL shutdown", err);
  } finally {
    process.exit(0);
  }
});

