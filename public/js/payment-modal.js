// Payment Modal Functionality
const paymentModal = {
    init() {
        this.modal = document.getElementById('payment-modal');
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Add click event listeners to all donate buttons
        const donateButtons = document.querySelectorAll('.btn-primary');
        donateButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (e.currentTarget.getAttribute('href') === '#donate') {
                    this.openModal();
                }
            });
        });

        // Close modal when clicking outside or on close button
        document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    },

    openModal() {
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        // Reset any previous error messages
        document.getElementById('card-errors').textContent = '';
        document.getElementById('paypal-errors').textContent = '';
    },

    closeModal() {
        this.modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
};

// Initialize payment modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    paymentModal.init();
});