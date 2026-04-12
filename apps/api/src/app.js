import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { leadsRouter } from "./routes/leads.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

export const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (config.clientOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  })
);
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api", (req, res) => {
  return res.json({ message: "Sales Dashboard API is running" });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/leads", leadsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
