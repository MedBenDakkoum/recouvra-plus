// Recouvra+ Common JavaScript Functions

// API client helper
window.api = {
    baseUrl: '/api',
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint);
    },

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
};

// Format helpers
window.format = {
    currency(amount, currency = 'TND') {
        return new Intl.NumberFormat('fr-TN', {
            style: 'currency',
            currency
        }).format(amount);
    },

    date(dateString) {
        return new Date(dateString).toLocaleDateString('fr-TN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    status(status) {
        const statusMap = {
            'pending': 'En attente',
            'partial': 'Partiellement payée',
            'paid': 'Payée',
            'overdue': 'En retard',
            'active': 'Actif',
            'inactive': 'Inactif'
        };
        return statusMap[status] || status;
    }
};

// Common functions
window.recouvra = {
    // Check authentication
    checkAuth() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/login';
            return false;
        }
        return true;
    },

    // Handle logout
    handleLogout(event) {
        event.preventDefault();
        window.location.href = '/logout';
    },

    // Get status class for badges
    getStatusClass(status) {
        const statusClasses = {
            'paid': 'success',
            'pending': 'warning',
            'partial': 'info',
            'overdue': 'danger',
            'active': 'success',
            'inactive': 'muted'
        };
        return statusClasses[status] || 'muted';
    },

    // Show modal
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    },

    // Hide modal
    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        const form = document.querySelector(`#${modalId} form`);
        if (form) form.reset();
    },

    // Show success message
    showSuccess(message) {
        alert(message);
    },

    // Show error message
    showError(message) {
        alert(message);
    },

    // Confirm action
    confirm(message) {
        return confirm(message);
    }
};

// Auto-check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    recouvra.checkAuth();
});
