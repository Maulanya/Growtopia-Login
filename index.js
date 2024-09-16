const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

// Middleware untuk mengatur header CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Membuat folder 'path' di root directory jika belum ada
const logDir = path.join(process.cwd(), "path");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Middleware untuk mencatat req.method dan req.url
app.use((req, res, next) => {
  const log = {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  };

  const logFilePath = path.join(logDir, "requests.json");

  // Baca file requests.json (jika ada)
  fs.readFile(logFilePath, "utf8", (err, data) => {
    let logs = [];
    if (!err && data) {
      logs = JSON.parse(data); // Jika file sudah ada, parse data lama
    }

    logs.push(log); // Tambahkan log baru

    // Tulis data ke dalam file requests.json
    fs.writeFile(logFilePath, JSON.stringify(logs, null, 2), (err) => {
      if (err) {
        console.error("Error writing to requests.json:", err);
      }
    });
  });

  next();
});

app.post("/player/login/dashboard", (req, res) => {
  res.sendFile(__dirname + "/public/html/dashboard.html");
});

app.post("/player/growid/login/validate", (req, res) => {
  const growId = req.body.growId;
  const password = req.body.password;

  const token = Buffer.from(
    `_token=&growId=${growId}&password=${password}`
  ).toString("base64");

  res.send(
    JSON.stringify({
      status: "success",
      message: "Account Validated.",
      token,
      url: "",
      accountType: "growtopia",
    })
  );
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(function (req, res) {
  res.status(404).send("Not Found");
});

app.listen(5000, function () {
  console.log("Listening on port 5000");
});
