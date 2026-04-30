const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize SQLite database with better configuration
const db = new sqlite3.Database(
  "./database.db",
  sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error("Error opening database:", err);
      process.exit(1);
    } else {
      console.log("✓ Connected to SQLite database");

      // Enable WAL mode for better concurrency
      db.run("PRAGMA journal_mode=WAL");
      db.run("PRAGMA synchronous=NORMAL");

      // Ensure reservations table exists
      db.run(
        `CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            reservation_date TEXT NOT NULL,
            reservation_time TEXT NOT NULL,
            guest_count TEXT NOT NULL,
            special_requests TEXT,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err) {
            console.error("Error creating table:", err);
          } else {
            console.log("✓ Reservations table ready");
          }
        },
      );
    }
  },
);

// Handle database errors
db.on("error", (err) => {
  console.error("Database error:", err);
});

// Create a new reservation
app.post("/api/reservations", (req, res) => {
  try {
    const { name, phone, date, time, guests, requests } = req.body;

    if (!name || !phone || !date || !time) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const sql = `INSERT INTO reservations (customer_name, phone_number, reservation_date, reservation_time, guest_count, special_requests)
                     VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [name, phone, date, time, guests || "1", requests || ""];

    db.run(sql, params, function (err) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to create reservation" });
      }
      res.status(201).json({
        message: "Reservation confirmed",
        id: this.lastID,
      });
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch all reservations for Admin Dashboard
app.get("/api/reservations", (req, res) => {
  try {
    const sql = `SELECT * FROM reservations ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to load reservations" });
      }
      res.json({
        data: rows || [],
      });
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update reservation status
app.patch("/api/reservations/:id/status", (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const sql = `UPDATE reservations SET status = ? WHERE id = ?`;

    db.run(sql, [status, id], function (err) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to update status" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      res.json({ message: "Status updated successfully" });
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✓ Server running at http://localhost:${PORT}`);
  console.log(`✓ Reservations API: POST /api/reservations`);
  console.log(`✓ Get reservations: GET /api/reservations`);
  console.log(`✓ Health check: GET /health`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
      } else {
        console.log("Database closed");
      }
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
      } else {
        console.log("Database closed");
      }
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
