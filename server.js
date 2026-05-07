const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(express.json());

const ANGEL_BASE = "https://apiconnect.angelbroking.com";

function angelHeaders(apiKey, jwtToken = "") {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-UserType": "USER",
    "X-SourceID": "WEB",
    "X-ClientLocalIP": "127.0.0.1",
    "X-ClientPublicIP": "127.0.0.1",
    "X-MACAddress": "00:00:00:00:00:00",
    "X-PrivateKey": apiKey,
    ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
  };
}

// ── Login ──────────────────────────────────────────────────────────────────
app.post("/api/login", async (req, res) => {
  const { apiKey, clientId, mpin, totp } = req.body;
  try {
    const r = await fetch(`${ANGEL_BASE}/rest/auth/angelbroking/user/v1/loginByPassword`, {
      method: "POST",
      headers: angelHeaders(apiKey),
      body: JSON.stringify({ clientcode: clientId, password: mpin, totp }),
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

// ── Quote ──────────────────────────────────────────────────────────────────
app.post("/api/quote", async (req, res) => {
  const { apiKey, jwtToken, exchange, tokens } = req.body;
  try {
    const r = await fetch(`${ANGEL_BASE}/rest/secure/angelbroking/market/v1/quote/`, {
      method: "POST",
      headers: angelHeaders(apiKey, jwtToken),
      body: JSON.stringify({ mode: "FULL", exchangeTokens: { [exchange]: tokens } }),
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

// ── Candles ────────────────────────────────────────────────────────────────
app.post("/api/candles", async (req, res) => {
  const { apiKey, jwtToken, exchange, symboltoken, interval, fromdate, todate } = req.body;
  try {
    const r = await fetch(`${ANGEL_BASE}/rest/secure/angelbroking/historical/v1/getCandleData`, {
      method: "POST",
      headers: angelHeaders(apiKey, jwtToken),
      body: JSON.stringify({ exchange, symboltoken, interval, fromdate, todate }),
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

// ── Option Chain ───────────────────────────────────────────────────────────
app.post("/api/optionchain", async (req, res) => {
  const { apiKey, jwtToken, name, expiryDate, strikePrice, optionType } = req.body;
  try {
    const r = await fetch(`${ANGEL_BASE}/rest/secure/angelbroking/market/v1/optionChain`, {
      method: "POST",
      headers: angelHeaders(apiKey, jwtToken),
      body: JSON.stringify({ name, expiryDate, strikePrice: String(strikePrice), optionType }),
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

// ── Health check ───────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "ok", message: "Angel One Proxy Server Running ✅" }));

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
