const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
const path = require("path");
const { google } = require("googleapis");

const TOKEN_PATH = path.resolve(__dirname, "../token.json");
const CREDS = require("../client_secret.json");

const CLIENT_ID = (CREDS.installed || CREDS.web).client_id;
const CLIENT_SECRET = (CREDS.installed || CREDS.web).client_secret;
const REDIRECT = "http://localhost:5173/oauth";

// ================= SAVE TOKEN =================

router.post("/", async (req, res) => {

  try {

    const { code } = req.body;

    console.log("OAUTH CODE:", code);

    if (!code) {
      return res.status(400).json({ error: "Missing code" });
    }

    const oAuth = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT
    );

    const { tokens } = await oAuth.getToken(code);

    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));

    console.log("TOKEN SAVED");

    res.json({ success: true });

  } catch (e) {
    console.error("AUTH ERROR:", e);
    res.status(500).json({ error: String(e) });
  }

});

module.exports = router;
