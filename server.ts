import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("grocery.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    price REAL,
    image TEXT,
    stock INTEGER,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL
  );
`);

// Seed data if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const insert = db.prepare("INSERT INTO products (name, category, price, image, stock, description) VALUES (?, ?, ?, ?, ?, ?)");
  const seedProducts = [
    ["Amul Gold Milk", "Dairy", 33, "https://picsum.photos/seed/milk/400/400", 100, "Fresh full cream milk"],
    ["Harvest Gold Bread", "Bakery", 45, "https://picsum.photos/seed/bread/400/400", 50, "Whole wheat brown bread"],
    ["Lays Classic Salted", "Snacks", 20, "https://picsum.photos/seed/chips/400/400", 200, "Crispy potato chips"],
    ["Coca Cola 1.25L", "Beverages", 65, "https://picsum.photos/seed/coke/400/400", 80, "Refreshing soft drink"],
    ["Aashirvaad Atta 5kg", "Atta, Rice & Dal", 245, "https://picsum.photos/seed/atta/400/400", 40, "Premium chakki atta"],
    ["Maggi Noodles 280g", "Instant Food", 48, "https://picsum.photos/seed/maggi/400/400", 150, "2-minute masala noodles"],
    ["Surf Excel Matic", "Cleaning", 199, "https://picsum.photos/seed/surf/400/400", 30, "Top load detergent"],
    ["Dettol Handwash", "Personal Care", 99, "https://picsum.photos/seed/dettol/400/400", 60, "Germ protection liquid"],
  ];
  seedProducts.forEach(p => insert.run(...p));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.get("/api/products/search", (req, res) => {
    const q = req.query.q as string;
    const products = db.prepare("SELECT * FROM products WHERE name LIKE ? OR category LIKE ?").all(`%${q}%`, `%${q}%`);
    res.json(products);
  });

  app.post("/api/orders", (req, res) => {
    const { userId, items, total } = req.body;
    const info = db.prepare("INSERT INTO orders (user_id, total) VALUES (?, ?)").run(userId || 1, total);
    const orderId = info.lastInsertRowid;

    const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    items.forEach((item: any) => {
      insertItem.run(orderId, item.id, item.quantity, item.price);
    });

    res.json({ success: true, orderId });
  });

  app.get("/api/orders/user/:userId", (req, res) => {
    const userId = req.params.userId;
    const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    res.json(orders);
  });

  app.post("/api/register", (req, res) => {
    const { email, password, name } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, password, name);
      const user = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(info.lastInsertRowid);
      res.json({ success: true, user });
    } catch (err: any) {
      if (err.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ success: false, message: "Email already exists" });
      } else {
        res.status(500).json({ success: false, message: "Server error" });
      }
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT id, email, name FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
