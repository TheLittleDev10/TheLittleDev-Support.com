# TheLittleDev Support Page

A support page for TheLittleDev with payment integration using Stripe and PayPal.

## Features

- Responsive design
- Stripe payment integration
- PayPal payment integration
- Support tiers with different pricing options

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Stripe account with API keys
- PayPal developer account with Client ID

## Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/thelittledev-support.git
   cd thelittledev-support
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   PAYPAL_CLIENT_ID=your_paypal_client_id
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

## Running the Application

### Development Mode

```
npm run dev
```

This will start the server with nodemon, which automatically restarts the server when changes are detected.

### Production Mode

```
npm start
```

The application will be available at `http://localhost:3000`.

## Deployment

This application can be deployed to various platforms such as Heroku, Vercel, or Netlify. Make sure to set up the environment variables in your deployment platform.

## GitHub Pages Note

If you're planning to host this on GitHub Pages, please note that this is a Node.js application that requires a server to handle API requests. GitHub Pages only supports static websites, so you'll need to:

1. Use a different hosting service for the backend (like Heroku, Render, or Railway)
2. Or convert the application to use serverless functions (like Netlify Functions or Vercel Serverless Functions)

## License

MIT