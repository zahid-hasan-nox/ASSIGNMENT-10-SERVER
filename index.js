const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config(); // 🟢

const app = express();
const port = process.env.PORT || 5000;

// ✅ CORS setup
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend-domain.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 🧠 MongoDB Connection URI — এখানে KEY গুলা ঠিক করে দিছি
const uri = `mongodb+srv://assignmentTen:${process.env.DB_PASS}@cluster0.fcigo5r.mongodb.net/?appName=Cluster0`;

console.log(uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ✅ Connect once, reuse connection
let db, tasksCollection;
async function connectDB() {
  try {
    if (!db) {
      await client.connect();
      db = client.db(process.env.DB_NAME || "taskDB");
      tasksCollection = db.collection("tasks");
      console.log("✅ MongoDB Connected!");
    }
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}
connectDB();

// ✅ Routes
app.get("/", (req, res) => {
  res.send("🚀 Server is running perfectly!");
});

// ➕ Add new task
app.post("/tasks", async (req, res) => {
  try {
    await connectDB();
    const newTask = req.body;
    const result = await tasksCollection.insertOne(newTask);
    res.send(result);
  } catch (error) {
    console.error("POST /tasks error:", error);
    res.status(500).send({ error: error.message });
  }
});

// 📜 Get all tasks or by email
app.get("/tasks", async (req, res) => {
  try {
    await connectDB();
    const query = req.query.email ? { email: req.query.email } : {};
    const result = await tasksCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("GET /tasks error:", error);
    res.status(500).send({ error: error.message });
  }
});

// 🟢 Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
