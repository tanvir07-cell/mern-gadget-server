const express = require("express");

const app = express();

const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");

// using middleware:
const cors = require("cors");
app.use(cors());
app.use(express.json());
require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");

// userName : mernGadget
// pass:6Pqcy8DHN3opJZz7

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.20t0r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const gadgetCollection = client.db("gadget").collection("users");

    // jwt token:
    app.post("/login", (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.JWT_ACCESS_TOKEN);
      res.send({ token });
    });

    app.post("/uploadPd", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await gadgetCollection.insertOne(body);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Node server is working");
});

app.listen(port, () => {
  console.log(`Server running the port ${port}`);
});
