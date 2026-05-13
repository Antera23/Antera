const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { MercadoPagoConfig, Preference } = require("mercadopago");

dotenv.config();

const app = express();

// 🔥 CORS correcto
app.use(cors({ origin: "*" }));
app.use(express.json());

// 🔐 MercadoPago config
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// =========================
// ENDPOINT: CREAR PAGO
// =========================
app.post("/create-payment", async (req, res) => {
  try {
    const items = req.body.items;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Carrito vacío" });
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items.map(item => ({
          title: item.name,
          quantity: Number(item.qty),
          unit_price: Number(item.price),
          currency_id: "UYU",
        })),

        back_urls: {
          success: "http://127.0.0.1:5500/success.html",
          failure: "http://127.0.0.1:5500/failure.html",
          pending: "http://127.0.0.1:5500/pending.html",
        },

        auto_return: "approved",
      },
    });

    console.log("✔ Pago creado");

    res.json({
      url: result.init_point,
    });

  } catch (error) {
    console.log("❌ ERROR MERCADOPAGO:", error);
    res.status(500).json({
      error: error.message || "Error creando pago",
    });
  }
});

// =========================
// SERVER
// =========================
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});