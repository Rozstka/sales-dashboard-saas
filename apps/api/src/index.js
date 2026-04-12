import { app } from "./app.js";
import { checkDbConnection } from "./db.js";
import { config } from "./config.js";

function getDatabaseTarget(connectionString) {
  try {
    const parsed = new URL(connectionString);
    return `${parsed.hostname}:${parsed.port || "5432"}${parsed.pathname}`;
  } catch {
    return "unknown";
  }
}

async function bootstrap() {
  try {
    await checkDbConnection();
    app.listen(config.port, () => {
      console.log(`API started on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start API:");
    console.error("Database target:", getDatabaseTarget(config.databaseUrl));
    console.error(error?.stack || error);
    process.exit(1);
  }
}

bootstrap();
