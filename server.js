// server.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "mongodb";
import express from "express";

// compute __filename and __dirname first (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// now load .env from the same folder as this script
dotenv.config({ path: path.resolve(__dirname, ".env") });

const { MongoClient } = pkg;

console.log("cwd:", process.cwd());
console.log("__dirname:", __dirname);
console.log("ENV file path used:", path.resolve(__dirname, ".env"));


// Full debug output for env var
const rawUrl = process.env.MONGO_URL;
console.log("MONGO_URL exists? ->", rawUrl !== undefined);
console.log("typeof MONGO_URL ->", typeof rawUrl);
console.log("MONGO_URL length ->", rawUrl ? rawUrl.length : 0);
console.log("MONGO_URL (first 200 chars) ->", (rawUrl || "undefined").slice(0, 200).replace(/\n/g, "\\n"));

if (!rawUrl || typeof rawUrl !== "string") {
  console.error("MONGO_URL is missing or not a string. Check .env in project root.");
  process.exit(1);
}

// sanity: trim (removes accidental whitespace/newlines)
const MONGO_URL = rawUrl.trim();

try {
  // Ensure it's a non-empty string
  if (MONGO_URL.length === 0) throw new Error("Empty MONGO_URL after trim");
} catch (e) {
  console.error("Bad MONGO_URL:", e);
  process.exit(1);
}

// Create client with the exact string from .env
const client = new MongoClient(MONGO_URL);

const app = express();
const PORT = process.env.PORT ?? 3000;
let db = null;

async function start() {
  try {
    // connect WITH NO ARGUMENTS (we already gave URI to constructor)
    await client.connect();
    console.log("Connected to MongoDB");

    db = client.db(process.env.MONGO_DB_NAME ?? "wanderlust");

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

    app.get("/getUsers", async (req, res) => {
      try {
        if (!db) throw new Error("DB not initialized");
        const users = await db.collection("users").find({}).toArray();
        res.json(users);
      } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("Closing MongoDB connection...");
  try { await client.close(); } catch (e) { /* ignore */ }
  process.exit(0);
});

start();
