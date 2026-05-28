// Expense & Budget Tracker Application
// This file will contain all JavaScript logic for the application

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Generates a unique transaction ID using a timestamp + random string.
 * Combination ensures uniqueness even for rapid successive calls.
 * @returns {string} e.g. "1704067200000-abc1234"
 */
function generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${timestamp}-${random}`;
}

// ─── Storage Manager Module ───────────────────────────────────────────────────
// Handles all Local Storage read/write operations for transactions.
const StorageManager = {
    STORAGE_KEY: 'expense-tracker-transactions',

    saveTransactions(transactions) {
        try {
            const jsonString = JSON.stringify(transactions);
            localStorage.setItem(this.STORAGE_KEY, jsonString);
            return true;
        } catch (error) {
            console.error('Failed to save to storage:', error);
            return false;
        }
    },

    loadTransactions() {
        try {
            const jsonString = localStorage.getItem(this.STORAGE_KEY);
            if (!jsonString) {
                return [];
            }
            const data = JSON.parse(jsonString);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Failed to load from storage:', error);
            return [];
        }
    },

    clearTransactions() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }
};

// ─── Transaction Manager Module ───────────────────────────────────────────────
// Manages the in-memory transactions array and keeps it in sync with storage.
const TransactionManager = {
    // Initialize directly from storage so data is available before init() runs
    transactions: StorageManager.loadTransactions(),

    init() {
        // Re-load in case storage was updated externally before App.init()
        this.transactions = StorageManager.loadTransactions();
    },

    /**
     * Creates a new transaction from raw form values, persists it, and returns it.
     * @param {string} itemName
     * @param {number} amount
     * @param {string} category  "Food" | "Transport" | "Fun"
     * @returns {Object} The newly created transaction object
     */
    addTransaction(itemName, amount, category) {
        const transaction = {
            id: generateTransactionId(),
            itemName,
            amount,
            category,
            timestamp: Date.now()
        };
        this.transactions.push(transaction);
        StorageManager.saveTransactions(this.transactions);
        return transaction;
    },

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        StorageManager.saveTransactions(this.transactions);
    },

    getTransactions() {
        return this.transactions;
    },

    calculateBalance() {
        return this.transactions.reduce((total, transaction) => {
            return total + transaction.amount;
        }, 0);
    },

    getCategoryTotals() {
        const totals = {
            Food: 0,
            Transport: 0,
            Fun: 0
        };

        this.transactions.forEach(transaction => {
            if (totals.hasOwnProperty(transaction.category)) {
                totals[transaction.category] += transaction.amount;
            }
        });

        return totals;
    }
};

// UI Manager Module - Handles DOM manipulation and rendering
const UIManager = {
    elements: {},

    init() {
        // Cache DOM elements
        this.elements = {
            transactionForm: document.getElementById('transaction-form'),
            itemNameInput: document.getElementById('item-name'),
            amountInput: document.getElementById('amount'),
            categorySelect: document.getElementById('category'),
            errorMessage: document.getElementById('error-message'),
            transactionList: document.getElementById('transaction-list'),
            totalAmount: document.getElementById('total-amount'),
            spendingChart: document.getElementById('spending-chart'),
            chartLegend: document.getElementById('chart-legend')
        };
    },

    renderTransactions() {
        const transactions = TransactionManager.getTransactions();
        const listElement = this.elements.transactionList;

        if (transactions.length === 0) {
            listElement.innerHTML = '<div class="empty-state">No transactions yet. Add your first expense above!</div>';
            return;
        }

        listElement.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <span class="transaction-name">${this.escapeHtml(transaction.itemName)}</span>
                    <span class="transaction-amount">$${transaction.amount.toFixed(2)}</span>
                    <span class="transaction-category category-${transaction.category.toLowerCase()}">${transaction.category}</span>
                </div>
                <button 
                    class="delete-btn" 
                    data-transaction-id="${transaction.id}"
                    aria-label="Delete transaction: ${this.escapeHtml(transaction.itemName)}, $${transaction.amount.toFixed(2)}">
                    ×
                </button>
            </div>
        `).join('');

        // Attach delete event listeners
        listElement.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-transaction-id');
                this.handleDelete(id);
            });
        });
    },

    updateBalance() {
        const balance = TransactionManager.calculateBalance();
        this.elements.totalAmount.textContent = `$${balance.toFixed(2)}`;
    },

    renderChart() {
        const categoryTotals = TransactionManager.getCategoryTotals();
        ChartRenderer.drawPieChart(categoryTotals, this.elements.spendingChart);
        ChartRenderer.renderLegend(categoryTotals, this.elements.chartLegend);
    },

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
    },

    hideError() {
        this.elements.errorMessage.classList.add('hidden');
        this.elements.errorMessage.textContent = '';
    },

    clearForm() {
        this.elements.itemNameInput.value = '';
        this.elements.amountInput.value = '';
        this.elements.categorySelect.value = '';
    },

    handleDelete(id) {
        TransactionManager.deleteTransaction(id);
        this.renderTransactions();
        this.updateBalance();
        this.renderChart();
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Form Handler Module - Handles form validation and submission
const FormHandler = {
    validateForm(formData) {
        const errors = [];

        // Check item name
        if (!formData.itemName || formData.itemName.trim() === '') {
            errors.push('Item name is required');
        }

        // Check amount
        if (!formData.amount || formData.amount <= 0) {
            errors.push('Amount must be greater than 0');
        }

        // Check category
        if (!formData.category || !['Food', 'Transport', 'Fun'].includes(formData.category)) {
            errors.push('Please select a valid category');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    handleSubmit(event) {
        event.preventDefault();

        // Extract form data
        const formData = {
            itemName: UIManager.elements.itemNameInput.value,
            amount: parseFloat(UIManager.elements.amountInput.value),
            category: UIManager.elements.categorySelect.value
        };

        // Validate form data
        const validation = this.validateForm(formData);

        if (!validation.isValid) {
            UIManager.showError(validation.errors.join('. '));
            return;
        }

        // Create and add transaction via TransactionManager
        TransactionManager.addTransaction(
            formData.itemName.trim(),
            formData.amount,
            formData.category
        );

        // Update UI
        UIManager.hideError();
        UIManager.clearForm();
        UIManager.renderTransactions();
        UIManager.updateBalance();
        UIManager.renderChart();
    }
};

// Chart Renderer Module - Handles canvas chart drawing
const ChartRenderer = {
    colors: {
        Food: '#FF6384',
        Transport: '#36A2EB',
        Fun: '#FFCE56'
    },

    drawPieChart(categoryTotals, canvas) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate total
        const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

        // Handle empty state
        if (total === 0) {
            this.drawEmptyState(ctx, centerX, centerY, radius);
            return;
        }

        let currentAngle = -Math.PI / 2; // Start at top (12 o'clock)

        // Draw each slice
        Object.entries(categoryTotals).forEach(([category, amount]) => {
            if (amount > 0) {
                const sliceAngle = (amount / total) * 2 * Math.PI;

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();

                ctx.fillStyle = this.colors[category];
                ctx.fill();

                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                currentAngle += sliceAngle;
            }
        });
    },

    drawEmptyState(ctx, centerX, centerY, radius) {
        // Draw a gray circle for empty state
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#ecf0f1';
        ctx.fill();
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add text
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No data', centerX, centerY);
    },

    renderLegend(categoryTotals, legendElement) {
        const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

        if (total === 0) {
            legendElement.innerHTML = '';
            return;
        }

        legendElement.innerHTML = Object.entries(categoryTotals).map(([category, amount]) => {
            const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
            return `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${this.colors[category]}"></div>
                    <span>${category}: $${amount.toFixed(2)} (${percentage}%)</span>
                </div>
            `;
        }).join('');
    }
};

// App Initialization
const App = {
    init() {
        // Initialize modules
        TransactionManager.init();
        UIManager.init();

        // Render initial state
        UIManager.renderTransactions();
        UIManager.updateBalance();
        UIManager.renderChart();

        // Attach event listeners
        UIManager.elements.transactionForm.addEventListener('submit', (e) => {
            FormHandler.handleSubmit(e);
        });

        console.log('Expense & Budget Tracker initialized successfully');
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
