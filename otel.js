// otel.js - Complete OpenTelemetry preload with console interception
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-http");
const { OTLPLogExporter } = require("@opentelemetry/exporter-logs-otlp-http");
const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");
const { LoggerProvider, SimpleLogRecordProcessor } = require("@opentelemetry/sdk-logs");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { resourceFromAttributes } = require("@opentelemetry/resources");

const resource = resourceFromAttributes({
  "service.name": "usecase-dashboard",
  "service.version": "1.0.0",
});

console.log("🔍 OTEL Preload: initializing...");

// --- Trace exporter ---
const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",
});

// --- Metrics exporter ---
const metricExporter = new OTLPMetricExporter({
  url: "http://localhost:4318/v1/metrics",
});
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 60000,
});

// --- Logs exporter ---
const logExporter = new OTLPLogExporter({
  url: "http://localhost:4318/v1/logs",
});
const loggerProvider = new LoggerProvider({
  resource,
  logRecordProcessors: [new SimpleLogRecordProcessor(logExporter)],
});

// --- SDK Setup ---
const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReader,
  loggerProvider,
  instrumentations: [getNodeAutoInstrumentations()],
});

// Start the SDK before app code
try {
  sdk.start();
  console.log("✅ OTEL SDK started");

  // Optional test log
  const logger = loggerProvider.getLogger("my-app-logger");
  logger.emit({
    severityText: "INFO",
    body: "Hello LGTM logs 👋",
  });
} catch (err) {
  console.error("❌ Failed to start OTEL SDK:", err);
}

// --- Console Interceptor Setup ---
console.log("🚀 Setting up console interceptor for LGTM backend...");

// Store original console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

// Function to send log to LGTM backend
async function sendLogToLGTM(severity, message, args = []) {
  try {
    const logData = {
      resourceLogs: [
        {
          resource: {
            attributes: [
              { key: "service.name", value: { stringValue: "usecase-dashboard" } },
              { key: "service.version", value: { stringValue: "1.0.0" } }
            ]
          },
          scopeLogs: [
            {
              logRecords: [
                {
                  timeUnixNano: Date.now() * 1000000,
                  severityText: severity,
                  body: { stringValue: message },
                  attributes: [
                    { key: "console.method", value: { stringValue: severity.toLowerCase() } },
                    { key: "console.args", value: { stringValue: JSON.stringify(args) } },
                    { key: "timestamp", value: { stringValue: new Date().toISOString() } }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    await fetch("http://localhost:4318/v1/logs", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });
  } catch (error) {
    // Fallback to original console to avoid infinite loops
    originalConsole.error('Failed to send log to LGTM backend:', error);
  }
}

// Intercept console.log
console.log = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  // Send to LGTM backend
  sendLogToLGTM("INFO", message, args);
  
  // Call original console.log
  originalConsole.log(...args);
};

// Intercept console.error
console.error = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  // Send to LGTM backend
  sendLogToLGTM("ERROR", message, args);
  
  // Call original console.error
  originalConsole.error(...args);
};

// Intercept console.warn
console.warn = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  // Send to LGTM backend
  sendLogToLGTM("WARN", message, args);
  
  // Call original console.warn
  originalConsole.warn(...args);
};

// Intercept console.info
console.info = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  // Send to LGTM backend
  sendLogToLGTM("INFO", message, args);
  
  // Call original console.info
  originalConsole.info(...args);
};

// Intercept console.debug
console.debug = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  // Send to LGTM backend
  sendLogToLGTM("DEBUG", message, args);
  
  // Call original console.debug
  originalConsole.debug(...args);
};

console.log("✅ Console interceptor initialized - all logs will be sent to LGTM backend");

// Ensure clean shutdown
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
