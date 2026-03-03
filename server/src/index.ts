import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import { healthRouter } from "./routes/health.js";
import { customersRouter } from "./routes/customers.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { contentRouter } from "./routes/content.js";
import { adminContentRouter } from "./routes/admin-content.js";
import { adminGalleryRouter } from "./routes/admin-gallery.js";
import { askMikeRouter } from "./routes/ask-mike.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();
const port = parseInt(process.env.API_PORT || "3000", 10);

// Trust proxy (App Runner terminates SSL and forwards as HTTP)
app.set("trust proxy", 1);

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? (process.env.CORS_ORIGINS || "https://www.mikesconeyisland.com,https://mikesconeyisland.com")
          .split(",")
          .map((s) => s.trim())
      : true,
    credentials: true,
  })
);
app.use(express.json());

// Session
const isProd = process.env.NODE_ENV === "production";
const PgSession = connectPgSimple(session);
const sessionPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : false,
});
app.use(
  session({
    store: new PgSession({
      pool: sessionPool,
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
      ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
    },
  })
);

// Routes
app.use("/api", healthRouter);
app.use("/api/customers", customersRouter);
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/ask-mike", askMikeRouter);
app.use("/api/admin", authMiddleware, dashboardRouter);
app.use("/api/admin", authMiddleware, adminContentRouter);
app.use("/api/admin", authMiddleware, adminGalleryRouter);

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
