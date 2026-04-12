import dotenv from "dotenv";

dotenv.config();

const clientOriginRaw = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const clientOrigins = clientOriginRaw
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  port: Number(process.env.PORT) || 4000,
  clientOrigins,
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5433/sales_dashboard",
  jwtSecret: process.env.JWT_SECRET || "change_this_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d"
};
