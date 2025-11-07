const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// ✅ CORS setup
app.use(
  cors({
    origin: ["http://localhost:5173"], // React app URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 🧠 MongoDB URI
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.fcigo5r.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// 🛠️ Main function

async function run() {
  try {
    await client.connect();
    const db = client.db("taskDB");
    const tasksCollection = db.collection("tasks");

    console.log("✅ MongoDB Connected Successfully!");

    // CREATE
    app.post("/tasks", async (req, res) => {
      try {
        const newTask = req.body;
        const result = await tasksCollection.insertOne(newTask);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // READ all / filter by email
    app.get("/tasks", async (req, res) => {
      try {
        const query = req.query.email ? { email: req.query.email } : {};
        const result = await tasksCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // READ single
    app.get("/tasks/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const task = await tasksCollection.findOne({ _id: new ObjectId(id) });
        res.send(task);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // UPDATE
    app.put("/tasks/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedTask = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            title: updatedTask.title,
            category: updatedTask.category,
            description: updatedTask.description,
            date: updatedTask.date,
            budget: updatedTask.budget,
          },
        };
        const result = await tasksCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // PATCH: Increase bid count
    app.patch("/tasks/:id/bid", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await tasksCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $inc: { bidsCount: 1 } },
          { returnDocument: "after" }
        );
        res.send(result.value);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // DELETE
    app.delete("/tasks/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await tasksCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // Root
    app.get("/", (req, res) => {
      res.send("🚀 Server is running!");
    });

    await client.db("admin").command({ ping: 1 });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}
run().catch(console.dir);

// 🟢 Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
