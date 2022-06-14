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
    const orderCollection = client.db("gadget").collection("orders");

    // jwt token:
    app.post("/login", (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.JWT_ACCESS_TOKEN);
      res.send({ token });
    });

    app.post("/uploadPd", async (req, res) => {
      const body = req.body;
      console.log(body);

      const tokenInfo = req.headers.authorization;
      // console.log(tokenInfo);

      const [email, accessToken] = tokenInfo.split(" ");
      const decoded = verifyToken(accessToken);
      console.log(decoded);

      if (email === decoded?.email) {
        const result = await gadgetCollection.insertOne(body);
        res.send(result);
      } else {
        res.send({ success: "unAuthorized Access" });
      }
    });

    app.get("/products", async (req, res) => {
      const products = await gadgetCollection.find({}).toArray();
      res.send(products);
    });

    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    app.get("/showOrder", async (req, res) => {
      const tokenInfo = req.headers.authorization;
      const [email, accessToken] = tokenInfo.split(" ");
      const decoded = verifyToken(accessToken);

      if (email === decoded.email) {
        const products = await orderCollection.find({ email }).toArray();
        res.send(products);
      } else {
        res.send({ success: "Unauthorized Access" });
      }
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

// verify jwt token:
function verifyToken(token) {
  let email;
  jwt.verify(token, process.env.JWT_ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      email = "Invalid Email";
    }
    if (decoded) {
      email = decoded;
      console.log(decoded);
    }
  });
  return email;
}
