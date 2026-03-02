import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { healthRouter } from "./routes/health.js";
import { customersRouter } from "./routes/customers.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { contentRouter } from "./routes/content.js";
import { adminContentRouter } from "./routes/admin-content.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();
const port = parseInt(process.env.API_PORT || "3000", 10);

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? "https://mikesconey.com" : true,
    credentials: true,
  })
);
app.use(express.json());

// Session
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

// Routes
app.use("/api", healthRouter);
app.use("/api/customers", customersRouter);
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/admin", authMiddleware, dashboardRouter);
app.use("/api/admin", authMiddleware, adminContentRouter);

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(`[ERROR] ${err.message}`, err.stack);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(port, "0.0.0.0", () => {
  console.log(`API server running on port ${port}`);
});
