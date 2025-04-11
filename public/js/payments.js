// Stripe Elements initialization
const stripe = Stripe('pk_test_51R448fBVFBNfyFWgdnGrPhcK3a56cOrGEss2jYEYxdLA67CckISSxRHQMt4V6LRtD53GfEcVGWFrFNgRVJ4J4bcW000d0Z8mAd');
const elements = stripe.elements();

// Function to show payment method (Stripe or PayPal)
function showPaymentMethod(method) {
    const stripeForm = document.getElementById('stripe-payment-form');
    const paypalContainer = document.getElementById('paypal-button-container');
    
    // Update active state on buttons
    const stripeButton = document.querySelector('.payment-method-btn:nth-child(1)');
    const paypalButton = document.querySelector('.payment-method-btn:nth-child(2)');
    
    if (method === 'stripe') {
        stripeForm.classList.remove('hidden');
        paypalContainer.classList.add('hidden');
        stripeButton.classList.add('active');
        paypalButton.classList.remove('active');
    } else {
        stripeForm.classList.add('hidden');
        paypalContainer.classList.remove('hidden');
        stripeButton.classList.remove('active');
        paypalButton.classList.add('active');
        // Initialize PayPal buttons when PayPal method is selected
        initializePayPal();
    }
}

// Function to redirect to Stripe Checkout
async function redirectToCheckout() {
    const amount = document.getElementById('donation-amount').value;
    
    if (!amount || isNaN(amount) || amount <= 0) {
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = 'Please enter a valid donation amount.';
        return;
    }
    
    // Show loading state
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Processing...';
    }
    
    try {
        // Redirect to the Stripe payment link directly
        window.location.href = 'https://donate.stripe.com/test_cN2aHH0x8e8N9mo000';
    } catch (error) {
        console.error('Checkout Error:', error);
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = 'An error occurred. Please try again.';
        
        // Reset button state
        if (checkoutButton) {
            checkoutButton.disabled = false;
            checkoutButton.innerHTML = '<i class="fab fa-stripe mr-2"></i> Checkout with Stripe';
        }
    }
}

// Initialize all payment functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Stripe checkout button
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            redirectToCheckout();
        });
    }
    
    // Set default payment method to Stripe
    showPaymentMethod('stripe');
    
    // Override the inline onclick handlers with proper event listeners
    const paymentMethodButtons = document.querySelectorAll('.payment-method-btn');
    paymentMethodButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const method = button.querySelector('i').classList.contains('fa-credit-card') ? 'stripe' : 'paypal';
            showPaymentMethod(method);
        });
    });
});

// Create card element
const cardElement = elements.create('card', {
    style: {
        base: {
            color: '#fff',
            fontFamily: '"Poppins", sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    }
});

// Mount card element
cardElement.mount('#card-element');

// Handle real-time validation errors
cardElement.on('change', function(event) {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
        displayError.textContent = event.error.message;
    } else {
        displayError.textContent = '';
    }
});

// Handle form submission for Stripe
const stripeForm = document.getElementById('stripe-payment-form');
stripeForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const amount = document.getElementById('donation-amount').value;

    try {
        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: amount })
        });

        const data = await response.json();
        const { clientSecret } = data;

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value
                }
            }
        });

        if (result.error) {
            const errorElement = document.getElementById('card-errors');
            errorElement.textContent = result.error.message;
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                showSuccessMessage('Thank you for your support! Your payment was successful.');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = 'An error occurred while processing your payment.';
    }
});

// PayPal Integration
function initializePayPal() {
    const paypalContainer = document.getElementById('paypal-button-container');
    
    // Make sure the PayPal container is visible
    paypalContainer.classList.remove('hidden');
    
    // Clear the container first to avoid duplicate buttons
    paypalContainer.innerHTML = '<div id="paypal-errors" class="text-red-500 text-sm mb-4"></div>';
    
    // Check if PayPal SDK is loaded
    if (typeof paypal !== 'undefined') {
        paypal.Buttons({
            // Style the buttons
            style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'paypal'
            },
            createOrder: function(data, actions) {
                const amount = document.getElementById('donation-amount').value;
                
                if (!amount || isNaN(amount) || amount <= 0) {
                    document.getElementById('paypal-errors').textContent = 'Please enter a valid donation amount.';
                    return null;
                }
                
                return actions.order.create({
                    purchase_units: [{
                        description: 'Support TheLittleDev',
                        amount: {
                            value: amount
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    console.log('PayPal transaction completed:', details);
                    showSuccessMessage('Thank you for your support! Your PayPal payment was successful.');
                });
            },
            onError: function(err) {
                console.error('PayPal Error:', err);
                document.getElementById('paypal-errors').textContent = 'An error occurred with your PayPal payment. Please try again.';
            },
            onCancel: function() {
                console.log('PayPal transaction cancelled');
            }
        }).render('#paypal-button-container');
    } else {
        console.error('PayPal SDK not loaded');
        document.getElementById('paypal-errors').textContent = 'PayPal payment system is currently unavailable. Please try again later or use another payment method.';
    }
}

// Helper function to show success message
function showSuccessMessage(message) {
    // Close the payment modal
    document.getElementById('payment-modal').classList.add('hidden');
    document.body.style.overflow = '';
    
    // Show the popup with success message
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    
    // Update popup message
    popup.querySelector('p').textContent = message;
    
    // Show popup
    popup.classList.remove('hidden');
    // Use direct DOM manipulation instead of gsap since gsap is only available in the main HTML file
    popupContent.style.transform = 'scale(1)';
    popupContent.style.opacity = '1';
    
    // If gsap is available, use it for animation
    if (typeof gsap !== 'undefined') {
        gsap.to(popupContent, {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: 'back.out'
        });
    }
    
    // Reset form
    if (stripeForm) {
        stripeForm.reset();
        cardElement.clear();
    }
}