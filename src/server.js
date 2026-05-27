import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { users } from "./fakeData/fakeUsers.js";
import { router as apiRoutes } from "./routes/index.js";
import { connectDB } from "./config/mongodb.js";
import { limiter } from "./middlewares/rateLimiter.js";
import errorHandler from "./middlewares/errorHandler.js";
import helmet from "helmet";

const app = express();
app.use(helmet());

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://frontend-ten-blush-12.vercel.app",
  ], // frontend domain
  credentials: true, // ✅ allow cookies to be sent
};

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(cookieParser());

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send(`<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Express + Tailwind</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="min-h-screen bg-gray-50 text-gray-800">
      <main class="max-w-2xl mx-auto p-8">
        <div class="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 p-8">
          <h1 class="text-3xl font-bold tracking-tight text-blue-600">
            Hello Client, I am your Server!
          </h1>
          <p class="mt-3 text-gray-600">
            This page is styled with <span class="font-semibold">Tailwind CSS</span> via CDN.
          </p>
          <div class="mt-6 flex flex-wrap items-center gap-3">
            <a href="/api/v2/users" class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              GET /users
            </a>
            <span class="text-xs text-gray-500">Try POST/PUT/DELETE with your API client.</span>
          </div>
        </div>
        <footer class="mt-10 text-center text-xs text-gray-400">
          Express server running with Tailwind via CDN
        </footer>
      </main>
    </body>
  </html>`);
});

app.use(errorHandler);

const PORT = process.env.PORT || 3002;

await connectDB();

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT} 🟢`);
});
