const express = require("express");
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(
  cors({
    origin: "*", // Replace "*" with specific domains for better security
    methods: "GET,POST,OPTIONS",
    allowedHeaders: ["Content-Type"],
  })
);
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to my simple Node.js app!");
});

app.post("/create-checkout-session", async (req, res) => {
  const { priceId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: "https://your-success-url.com",
      cancel_url: "https://your-cancel-url.com",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/unsubscribe", async (req, res) => {
  const { subscriptionId } = req.body;

  try {
    const deletedSubscription = await stripe.subscriptions.del(subscriptionId);
    res.json({ status: deletedSubscription.status });
    console.log("Subscription deleted", deletedSubscription);
  } catch (error) {
    console.error("Error cancelling subscription:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
