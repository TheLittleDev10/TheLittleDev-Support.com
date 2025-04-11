require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create a payment intent for Stripe
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for Stripe events
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    case 'payment_intent.payment_failed':
      console.log('Payment failed');
      break;
  }

  res.json({ received: true });
});

// Create a checkout session for Stripe Checkout
app.post('/create-checkout-session', async (req, res) => {
  try {
    // Get amount from either query params or request body
    const amount = req.query.amount || req.body.amount;
    
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Support TheLittleDev',
            },
            unit_amount: parseInt(amount) * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/success.html`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Checkout Session Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create an embedded checkout session for Stripe
app.post('/create-embedded-checkout', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Support TheLittleDev',
            },
            unit_amount: parseInt(amount) * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `${req.protocol}://${req.get('host')}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.json({ client_secret: session.client_secret });
  } catch (error) {
    console.error('Embedded Checkout Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Also support GET requests for the checkout session
app.get('/create-checkout-session', async (req, res) => {
  try {
    const { amount } = req.query;
    
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Support TheLittleDev',
            },
            unit_amount: parseInt(amount) * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/success.html`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Checkout Session Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle the return URL for embedded checkout
app.get('/return', async (req, res) => {
  const { session_id } = req.query;
  
  try {
    if (!session_id) {
      return res.redirect('/');
    }
    
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.status === 'complete') {
      // Payment was successful
      res.redirect('/success.html');
    } else {
      // Payment was not successful
      res.redirect('/cancel.html');
    }
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.redirect('/cancel.html');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));