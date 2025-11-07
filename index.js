const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

// ✅ CORS setup
app.use(
  cors({
    origin: ["http://localhost:5173", "https://your-frontend-domain.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());

// 🧠 MongoDB URI
const uri = mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.fcigo5r.mongodb.net/?retryWrites=true&w=majority;

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
  if (!db) {
    await client.connect();
    db = client.db("taskDB");
    tasksCollection = db.collection("tasks");
    console.log("✅ MongoDB Connected!");
  }
}
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("🚀 Server is running on Vercel!");
});

app.post("/tasks", async (req, res) => {
  try {
    await connectDB();
    const newTask = req.body;
    const result = await tasksCollection.insertOne(newTask);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/tasks", async (req, res) => {
  try {
    await connectDB();
    const query = req.query.email ? { email: req.query.email } : {};
    const result = await tasksCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 🟢 Export handler for Vercel
module.exports = app;
