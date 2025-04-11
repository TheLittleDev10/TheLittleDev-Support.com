// Embedded Checkout Component for Stripe
const EmbeddedCheckout = {
  stripePromise: null,
  clientSecret: null,
  modalRef: null,
  checkoutRef: null,

  init() {
    // Initialize Stripe with the publishable key
    this.stripePromise = Stripe("pk_test_51R448fBVFBNfyFWgdnGrPhcK3a56cOrGEss2jYEYxdLA67CckISSxRHQMt4V6LRtD53GfEcVGWFrFNgRVJ4J4bcW000d0Z8mAd");
    this.modalRef = document.getElementById('embedded-checkout-modal');
    this.checkoutRef = document.getElementById('embedded-checkout-container');
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Add click event listeners to embedded checkout buttons
    const embeddedCheckoutButtons = document.querySelectorAll('.embedded-checkout-btn');
    embeddedCheckoutButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    });

    // Close modal when clicking outside or on close button
    if (this.modalRef) {
      const closeButton = this.modalRef.querySelector('.modal-close');
      if (closeButton) {
        closeButton.addEventListener('click', () => this.closeModal());
      }
      this.modalRef.addEventListener('click', (e) => {
        if (e.target === this.modalRef) {
          this.closeModal();
        }
      });
    }
  },

  async openModal() {
    const amount = document.getElementById('donation-amount').value;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }
    
    // Show loading state
    const checkoutButton = document.querySelector('.embedded-checkout-btn');
    if (checkoutButton) {
      checkoutButton.disabled = true;
      checkoutButton.textContent = 'Redirecting to Stripe...';
    }
    
    try {
      // Redirect to the Stripe donation link
      window.location.href = 'https://donate.stripe.com/test_cN2aHH0x8e8N9mo000';
    } catch (error) {
      console.error('Redirect Error:', error);
      alert('An error occurred. Please try again.');
      
      // Reset button state
      if (checkoutButton) {
        checkoutButton.disabled = false;
        checkoutButton.innerHTML = '<i class="fab fa-stripe mr-2"></i> Support Now';
      }
    }
  },

  closeModal() {
    if (this.modalRef) {
      // Remove the active class to trigger the fade-out animation
      this.modalRef.classList.remove('active');
      
      // Wait for the animation to complete before hiding the modal
      setTimeout(() => {
        this.modalRef.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Clear the checkout container
        if (this.checkoutRef) {
          this.checkoutRef.innerHTML = '';
        }
      }, 300); // Match the transition duration in CSS
    }
  },

  async mountCheckout() {
    if (!this.clientSecret || !this.checkoutRef) return;
    
    try {
      const stripe = await this.stripePromise;
      
      // Create the checkout
      const options = {
        clientSecret: this.clientSecret,
        // Customize the appearance as needed
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#3b82f6',
            colorBackground: '#1e1b4b',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            fontFamily: 'Poppins, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
        },
      };
      
      // Clear any previous checkout
      this.checkoutRef.innerHTML = '';
      
      // Mount the checkout
      const elements = stripe.elements(options);
      const checkout = elements.create('payment');
      checkout.mount(this.checkoutRef);
      
      // Handle payment completion
      checkout.on('change', (event) => {
        if (event.complete) {
          // Payment is complete, you can handle success here
          // or wait for the webhook to confirm the payment
          console.log('Payment complete!');
        }
      });
    } catch (error) {
      console.error('Error mounting checkout:', error);
      this.checkoutRef.innerHTML = '<div class="text-red-500 p-4">Failed to load checkout. Please try again.</div>';
    }
  }
};

// Initialize embedded checkout when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if the embedded checkout modal exists
  if (document.getElementById('embedded-checkout-modal')) {
    EmbeddedCheckout.init();
  }
});