const keys = require("./keys");

// Express App setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const { Pool } = require("pg");
const pgClient = new Pool({
  database: keys.pgDatabase,
  host: keys.pgHost,
  password: keys.pgPassword,
  port: keys.pgPort,
  user: keys.pgUser,
});
pgClient.on("error", () => console.log("Lost PG connection"));
pgClient.on("connect", () => {
  pgClient
    .query("CREATE TABLE IF NOT EXISTS fibs (number INT)")
    .catch((err) => console.log(err))
    .then(() => console.log("Database ready"));
});

// Redis Client Setup
const redis = require("redis");
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();

// Express rout handlers
app.get("/", (req, res) => {
  res.send("Hi");
});

app.get("/values/all", async (req, res) => {
  let values;
  try {
    values = await pgClient.query("SELECT * FROM fibs");
  } catch (err) {
    console.log(err);
  }
  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    res.send(values);
  });
});

app.post("/values", async (req, res) => {
  const index = req.body.index;
  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high");
  }
  redisClient.hset("values", index, "Nothing yet!");
  redisPublisher.publish("insert", index);
  try {
    await pgClient.query("INSERT INTO fibs(number) VALUES ($1)", [index]);
  } catch (err) {
    console.log(err);
  }
  res.send({ working: true });
});

app.listen(5000, (err) => {
  console.log("Listening");
});
