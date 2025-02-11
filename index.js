const express = require("express");
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const cors = require("cors");

const stripe = new Stripe(
  "sk_test_51Q8bc2IXfR0igwVwqY5ZY2qTmZhIPNzXOalkGqk0bNYZem4Wh64Ba1qm0F0wMaEdX96H316EwA3WQZVhYk78LPrV00FP61gPJO"
);

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.end("Welcome to my simple Node.js app!");
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
    console.log("subscription deleted", deletedSubscription);
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
