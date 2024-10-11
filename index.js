require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
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
    const res = await fetch("https://api.growtavern.site/player/login/google", {
      method: "post",
      header: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: decoded.email,
      }),
    });
    const requestdata = await res.json();
    if (requestdata.type === "success") {
      fetch("/player/growid/login/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          growId: requestdata.data.name,
          password: requestdata.data.pass,
        }),
      });
      const token = Buffer.from(
        `_token=&growId=${requestdata.data.name}&password=${requestdata.data.pass}`
      ).toString("base64");
      return res.send(
        JSON.stringify({
          status: "success",
          message: "Account Validated.",
          token,
          url: "",
          accountType: "growtopia",
        })
      );
    }
  } catch (error) {
    return res.status(500).send("Error decoding token.");
  }
});

// app.post("/player/auth/google", async (req, res) => {
//   try {
//     const { data, error } = await supabaseClient.auth.signInWithOAuth({
//       provider: "google",
//       options: {
//         redirectTo: "https://grow-login-alpha.vercel.app/public/html/dashboard",
//       },
//     });

//     if (error) {
//       return res.status(400).json({
//         status: "error",
//         message: error.message,
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       url: data.url,
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: "error",
//       message: "Something went wrong during the Google authentication process.",
//     });
//   }
// });

app.post("/player/auth/google", async (req, res) => {
  try {
    // Step 1: Login dengan Google
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://grow-login-alpha.vercel.app/public/html/dashboard",
      },
    });

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    // Step 2: Decode token Google untuk mendapatkan informasi email pengguna
    const decoded = jwt.decode(data.access_token);
    if (!decoded || !decoded.email) {
      return res.status(400).json({
        status: "error",
        message: "Invalid Google token.",
      });
    }

    // Step 3: Lakukan request ke /player/growid/login/validate
    const response = await fetch(
      "https://api.growtavern.site/player/login/google",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: decoded.email,
        }),
      }
    );

    const requestdata = await response.json();

    // Step 4: Jika response dari API Growtavern sukses, generate token dan kirim response final
    if (requestdata.type === "success") {
      const token = Buffer.from(
        `_token=&growId=${requestdata.data.name}&password=${requestdata.data.pass}`
      ).toString("base64");

      // Step 5: Kirim respons dengan token dan status sukses
      return res.json({
        status: "success",
        message: "Account Validated.",
        token,
        url: "",
        accountType: "growtopia",
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: "Failed to validate account with Growtavern.",
      });
    }
  } catch (err) {
    console.error("Error during Google authentication process:", err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong during the authentication process.",
    });
  }
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
