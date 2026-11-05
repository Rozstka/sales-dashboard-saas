import dotenv from "dotenv";

dotenv.config();

const clientOriginRaw = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const clientOrigins = clientOriginRaw
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("Set JWT_SECRET to a random value of at least 32 characters");
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  clientOrigins,
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5433/sales_dashboard",
  jwtSecret: jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d"
};
