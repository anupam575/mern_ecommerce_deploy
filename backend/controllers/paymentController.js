import Stripe from "stripe";

// ✅ Process Payment
export const processPayment = async (req, res, next) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const myPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      metadata: {
        company: "Ecommerce",
      },
    });
    console.log("✅ PaymentIntent created:", myPayment); // ✅ check client_secret

    res.status(200).json({
      success: true,
      client_secret: myPayment.client_secret,
    });
  } catch (error) {
    console.error("Payment Processing Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Send Stripe API Key
export const sendStripeApiKey = async (req, res, next) => {
  try {
    res.status(200).json({
      stripeApiKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error("Stripe API Key Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
