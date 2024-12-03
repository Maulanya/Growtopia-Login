require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const os = require("os");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const supabaseUrl = process.env.URL;
const supabaseKey = process.env.KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  console.log(req.method, req.url);
  next();
});

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

app.post("/decode-token", async (req, res) => {
  const accessToken = req.body.access_token;

  if (!accessToken) {
    return res.status(400).send("No access token provided.");
  }

  try {
    const decoded = jwt.decode(accessToken);
    if (decoded) {
      return res.json(decoded.email);
    }
    // GrowtopiaPS Backend
  } catch (error) {
    return res.send("Error decoding token.");
  }
});

app.get("/os", (req, res) => {
  const CurrentMacAndroid = "02:00:00:00:00:00";
  const networkInterfaces = os.networkInterfaces();
  // Iterate through the interfaces
  for (const interface in networkInterfaces) {
    const addresses = networkInterfaces[interface];
    addresses.forEach((address) => {
      // Check if the address is IPv4 and not a loopback address
      if (address.mac === CurrentMacAndroid) {
        res
          .json({
            status: true,
            message: `block login with address Interface ${interface}, MAC Address ${address.mac}`,
          })
          .status(500);
      }
      if (address.family === "IPv4" && !address.internal) {
        res
          .json({
            status: false,
            message: `Interface: ${interface}, MAC Address: ${address.mac}`,
          })
          .status(200);
      }
    });
  }
});

app.all("/player/growid/checkToken", (req, res) => {
  try {
    const { refreshToken, clientData } = req.body;

    if (!refreshToken || !clientData) {
      return res.status(400).send({
        status: "error",
        message: "Missing refreshToken or clientData",
      });
    }

    let decodeRefreshToken = Buffer.from(refreshToken, "base64").toString(
      "utf-8"
    );
    if (!decodeRefreshToken.includes("&from=")) {
      decodeRefreshToken += "&from=session";
    }
    console.log(decodeRefreshToken);
    const token = Buffer.from(
      decodeRefreshToken.replace(
        /(_token=)[^&]*/,
        `$1${Buffer.from(clientData).toString("base64")}`
      )
    ).toString("base64");

    res.send({
      status: "success",
      message: "Token is valid.",
      token: token,
      url: "",
      accountType: "growtopia",
    });
  } catch (error) {
    res.status(500).send({ status: "error", message: "Internal Server Error" });
  }
});

app.post("/player/login/google/validate", async (req, res) => {
  const { email } = req.body;
  console.log(email);
  // const resdata = await fetch("http://localhost:1515/player/login/google", {
  const resdata = await fetch(
    "https://api.growtavern.site:1515/player/login/google",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    }
  );
  const requestdata = await resdata.json();
  if (requestdata.type === "success") {
    return res.json({
      type: "success",
      growId: requestdata.data.name,
      password: requestdata.data.pass,
    });
  } else {
    return res.json({
      type: "error",
      message: requestdata.message,
    });
  }
  // if (requestdata.type === "success") {
  //   // await fetch("http://localhost:5000/player/growid/login/validate", {
  //   await fetch(
  //     "https://grow-login-alpha.vercel.app/player/growid/login/validate",
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         growId: requestdata.data.name,
  //         password: requestdata.data.pass,
  //       }),
  //     }
  //   );
  //   const token = Buffer.from(
  //     `_token=&growId=${requestdata.data.name}&password=${requestdata.data.pass}`
  //   ).toString("base64");
  //   return res.send(
  //     JSON.stringify({
  //       status: "success",
  //       message: "Account Validated.",
  //       token,
  //       url: "",
  //       accountType: "growtopia",
  //     })
  //   );
  // }
});

app.post("/player/auth/google", async (req, res) => {
  try {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        skipBrowserRedirects: true,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
    res.status(200).json({
      status: "success",
      url: data.url,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong during the Google authentication process.",
    });
  }
});

app.post("/player/login/dashboard", (req, res) => {
  res.sendFile(__dirname + "/public/html/dashboard.html");
});

app.all("/player/growid/checkToken", (req, res) => {
  try {
    const { refreshToken, clientData } = req.body;

    if (!refreshToken || !clientData) {
      return res.status(400).send({
        status: "error",
        message: "Missing refreshToken or clientData",
      });
    }

    let decodeRefreshToken = Buffer.from(refreshToken, "base64").toString(
      "utf-8"
    );
    if (!decodeRefreshToken.includes("&from=")) {
      decodeRefreshToken += "&from=session";
    }
    console.log(decodeRefreshToken);
    const token = Buffer.from(
      decodeRefreshToken.replace(
        /(_token=)[^&]*/,
        `$1${Buffer.from(clientData).toString("base64")}`
      )
    ).toString("base64");

    res.send({
      status: "success",
      message: "Token is valid.",
      token: token,
      url: "",
      accountType: "growtopia",
    });
  } catch (error) {
    res.status(500).send({ status: "error", message: "Internal Server Error" });
  }
});

app.post("/player/growid/login/validate", (req, res) => {
  const growId = req.body.growId;
  const password = req.body.password;
  const { refreshToken, clientData } = req.body;

  let decodeRefreshToken = Buffer.from(refreshToken, "base64").toString(
    "utf-8"
  );
  if (!decodeRefreshToken.includes("&from=")) {
    decodeRefreshToken += "&from=session";
  }
  console.log(decodeRefreshToken);
  const token = Buffer.from(
    decodeRefreshToken.replace(
      /(_token=)[^&]*/,
      `$1${Buffer.from(clientData).toString("base64")}`
    )
  ).toString("base64");

  // const token = Buffer.from(
  //   `_token=&growId=${growId}&password=${password}`
  // ).toString("base64");

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
  // res.send("Hello World");
  res.sendFile(__dirname + "/public/html/dashboard.html");
  // res.send("<script>window.close();</script>");
});

app.use(function (req, res) {
  res.status(404).send("Not Found");
});

app.listen(5000, function () {
  console.log("Listening on port 5000");
});
