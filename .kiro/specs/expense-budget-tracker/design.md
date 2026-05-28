# Design Document: Expense & Budget Tracker

## Overview

The Expense & Budget Tracker is a client-side web application built with vanilla HTML, CSS, and JavaScript. It provides users with a simple interface to track expenses across three categories (Food, Transport, Fun), view their total spending, and visualize spending distribution through a pie chart. All data is persisted in the browser's Local Storage, eliminating the need for a backend server.

### Key Design Principles

1. **Simplicity**: Single-page application with minimal dependencies (vanilla JavaScript only)
2. **Persistence**: All data stored locally in the browser using Local Storage API
3. **Responsiveness**: Immediate UI updates following user actions
4. **Modularity**: Clear separation between data management, UI rendering, and business logic

### Technology Stack

- **HTML5**: Semantic markup for structure
- **CSS3**: Styling with flexbox/grid for layout
- **Vanilla JavaScript (ES6+)**: Application logic and DOM manipulation
- **Local Storage API**: Client-side data persistence
- **Canvas API**: Pie chart rendering

## Architecture

### High-Level Architecture

The application follows a simple Model-View-Controller (MVC) pattern adapted for vanilla JavaScript:

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                          │
│  (Structure: Form, Transaction List, Balance, Chart)   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├──> styles.css (Visual Presentation)
                 │
                 └──> app.js (Application Logic)
                          │
                          ├──> Data Layer (Storage Manager)
                          │    - Local Storage operations
                          │    - Transaction CRUD
                          │
                          ├──> Business Logic Layer
                          │    - Balance calculation
                          │    - Category aggregation
                          │    - Validation
                          │
                          └──> Presentation Layer (DOM Manager)
                               - UI rendering
                               - Event handling
                               - Chart drawing
```

### File Structure

```
project-root/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Single CSS file (all styles)
└── js/
    └── app.js          # Single JavaScript file (all logic)
```

### Data Flow

1. **User Input** → Form submission
2. **Validation** → Check all fields are filled
3. **Data Creation** → Create transaction object
4. **Storage** → Save to Local Storage
5. **UI Update** → Refresh transaction list, balance, and chart
6. **Persistence** → Data available on page reload

## Components and Interfaces

### HTML Structure

The application consists of five main sections:

```html
<body>
  <div class="container">
    <!-- 1. Header with Balance Display -->
    <header>
      <h1>Expense & Budget Tracker</h1>
      <div id="balance-display">
        <span>Total Spending: </span>
        <span id="total-amount">$0.00</span>
      </div>
    </header>

    <!-- 2. Input Form -->
    <section id="input-section">
      <form id="transaction-form">
        <input type="text" id="item-name" placeholder="Item Name" />
        <input type="number" id="amount" placeholder="Amount" />
        <select id="category">
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Fun">Fun</option>
        </select>
        <button type="submit">Add Transaction</button>
      </form>
      <div id="error-message" class="hidden"></div>
    </section>

    <!-- 3. Transaction List -->
    <section id="transaction-section">
      <h2>Transactions</h2>
      <div id="transaction-list" class="scrollable">
        <!-- Transactions rendered dynamically -->
      </div>
    </section>

    <!-- 4. Chart Component -->
    <section id="chart-section">
      <h2>Spending by Category</h2>
      <canvas id="spending-chart" width="300" height="300"></canvas>
      <div id="chart-legend"></div>
    </section>
  </div>
</body>
```

### CSS Organization

The single CSS file (`css/styles.css`) is organized into logical sections:

1. **Reset & Base Styles**: CSS reset, box-sizing, base typography
2. **Layout**: Container, flexbox/grid layouts, spacing
3. **Components**: Form styles, button styles, transaction cards
4. **Balance Display**: Header and balance styling
5. **Transaction List**: List container, scrollable area, individual transaction items
6. **Chart Section**: Canvas container, legend styles
7. **Utility Classes**: `.hidden`, `.error`, category color indicators
8. **Responsive Design**: Media queries for mobile/tablet

### JavaScript Module Structure

The single JavaScript file (`js/app.js`) is organized into functional modules using the Module Pattern:

```javascript
// 1. Storage Manager Module
const StorageManager = {
  saveTransactions(transactions) { ... },
  loadTransactions() { ... },
  clearTransactions() { ... }
};

// 2. Transaction Manager Module
const TransactionManager = {
  transactions: [],
  addTransaction(transaction) { ... },
  deleteTransaction(id) { ... },
  getTransactions() { ... },
  calculateBalance() { ... },
  getCategoryTotals() { ... }
};

// 3. UI Manager Module
const UIManager = {
  renderTransactions() { ... },
  updateBalance() { ... },
  renderChart() { ... },
  showError(message) { ... },
  clearForm() { ... }
};

// 4. Form Handler Module
const FormHandler = {
  validateForm(formData) { ... },
  handleSubmit(event) { ... }
};

// 5. Chart Renderer Module
const ChartRenderer = {
  drawPieChart(categoryTotals) { ... },
  renderLegend(categoryTotals) { ... }
};

// 6. App Initialization
const App = {
  init() { ... }
};
```

## Data Models

### Transaction Object

```javascript
{
  id: string,           // Unique identifier (timestamp-based)
  itemName: string,     // Name of the expense item
  amount: number,       // Expense amount (positive number)
  category: string,     // One of: "Food", "Transport", "Fun"
  timestamp: number     // Creation timestamp (Date.now())
}
```

**Example:**
```javascript
{
  id: "1704067200000-abc123",
  itemName: "Lunch at cafe",
  amount: 15.50,
  category: "Food",
  timestamp: 1704067200000
}
```

### Local Storage Schema

**Key:** `expense-tracker-transactions`

**Value:** JSON string containing array of Transaction objects

```javascript
// Stored format
localStorage.setItem('expense-tracker-transactions', JSON.stringify([
  { id: "...", itemName: "...", amount: 15.50, category: "Food", timestamp: ... },
  { id: "...", itemName: "...", amount: 25.00, category: "Transport", timestamp: ... }
]));
```

### Category Totals Object

Used internally for chart rendering and category aggregation:

```javascript
{
  Food: number,       // Total spending on Food
  Transport: number,  // Total spending on Transport
  Fun: number        // Total spending on Fun
}
```

**Example:**
```javascript
{
  Food: 125.50,
  Transport: 75.00,
  Fun: 50.25
}
```

## Key Algorithms

### 1. Balance Calculation Algorithm

**Purpose:** Calculate the total sum of all transaction amounts

**Input:** Array of Transaction objects

**Output:** Total balance (number)

**Algorithm:**
```javascript
function calculateBalance(transactions) {
  return transactions.reduce((total, transaction) => {
    return total + transaction.amount;
  }, 0);
}
```

**Complexity:** O(n) where n is the number of transactions

### 2. Category Aggregation Algorithm

**Purpose:** Calculate total spending per category for chart rendering

**Input:** Array of Transaction objects

**Output:** CategoryTotals object

**Algorithm:**
```javascript
function getCategoryTotals(transactions) {
  const totals = {
    Food: 0,
    Transport: 0,
    Fun: 0
  };
  
  transactions.forEach(transaction => {
    totals[transaction.category] += transaction.amount;
  });
  
  return totals;
}
```

**Complexity:** O(n) where n is the number of transactions

### 3. Pie Chart Drawing Algorithm

**Purpose:** Render a pie chart on canvas showing spending distribution

**Input:** CategoryTotals object

**Output:** Visual pie chart on canvas element

**Algorithm:**
```javascript
function drawPieChart(categoryTotals, canvas) {
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;
  
  // Calculate total for percentage calculation
  const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
  
  // Handle empty state
  if (total === 0) {
    drawEmptyState(ctx, centerX, centerY, radius);
    return;
  }
  
  // Define colors for each category
  const colors = {
    Food: '#FF6384',
    Transport: '#36A2EB',
    Fun: '#FFCE56'
  };
  
  let currentAngle = -Math.PI / 2; // Start at top (12 o'clock)
  
  // Draw each slice
  Object.entries(categoryTotals).forEach(([category, amount]) => {
    if (amount > 0) {
      const sliceAngle = (amount / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = colors[category];
      ctx.fill();
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      currentAngle += sliceAngle;
    }
  });
}
```

**Complexity:** O(1) - fixed number of categories (3)

### 4. Form Validation Algorithm

**Purpose:** Validate user input before creating a transaction

**Input:** Form data object `{ itemName, amount, category }`

**Output:** Validation result object `{ isValid: boolean, errors: string[] }`

**Algorithm:**
```javascript
function validateForm(formData) {
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
}
```

**Complexity:** O(1) - fixed number of fields

### 5. Transaction ID Generation Algorithm

**Purpose:** Generate unique IDs for transactions

**Input:** None

**Output:** Unique string ID

**Algorithm:**
```javascript
function generateTransactionId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}
```

**Uniqueness:** Combination of timestamp and random string ensures uniqueness

### 6. Local Storage Serialization/Deserialization

**Purpose:** Convert transactions to/from JSON for storage

**Serialization:**
```javascript
function saveToStorage(transactions) {
  try {
    const jsonString = JSON.stringify(transactions);
    localStorage.setItem('expense-tracker-transactions', jsonString);
    return true;
  } catch (error) {
    console.error('Failed to save to storage:', error);
    return false;
  }
}
```

**Deserialization:**
```javascript
function loadFromStorage() {
  try {
    const jsonString = localStorage.getItem('expense-tracker-transactions');
    if (!jsonString) {
      return [];
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return [];
  }
}
```

## Event Flow Diagrams

### Add Transaction Flow

```
User fills form → User clicks "Add Transaction"
                         ↓
                  Form Submit Event
                         ↓
                  Prevent Default
                         ↓
                  Extract Form Data
                         ↓
                  Validate Form Data
                         ↓
              ┌──────────┴──────────┐
              │                     │
         Valid?                 Invalid?
              │                     │
              ↓                     ↓
    Create Transaction      Show Error Message
              ↓                     │
    Generate Unique ID              │
              ↓                     │
    Add to Transactions Array       │
              ↓                     │
    Save to Local Storage           │
              ↓                     │
    Clear Form                      │
              ↓                     │
    Update Transaction List         │
              ↓                     │
    Update Balance Display          │
              ↓                     │
    Update Chart                    │
              ↓                     │
              └─────────────────────┘
                         ↓
                    Complete
```

### Delete Transaction Flow

```
User clicks Delete Button
         ↓
  Click Event Handler
         ↓
  Get Transaction ID from data attribute
         ↓
  Remove from Transactions Array
         ↓
  Save Updated Array to Local Storage
         ↓
  Update Transaction List (re-render)
         ↓
  Update Balance Display
         ↓
  Update Chart
         ↓
  Complete
```

### Page Load Flow

```
Page Loads
    ↓
DOMContentLoaded Event
    ↓
Initialize App
    ↓
Load Transactions from Local Storage
    ↓
Parse JSON to Transaction Objects
    ↓
Store in Transactions Array
    ↓
Render Transaction List
    ↓
Calculate and Display Balance
    ↓
Calculate Category Totals
    ↓
Render Pie Chart
    ↓
Attach Event Listeners
    ↓
Ready for User Interaction
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

While this application is primarily UI-focused, there are several core pure functions that can be validated through property-based testing. These functions handle data transformation, validation, and calculation logic independent of the DOM and browser APIs.

### Property 1: Form Validation Completeness

*For any* form data object containing itemName, amount, and category fields, the validation function SHALL return `isValid: false` if any field is empty, null, or invalid, and SHALL return `isValid: true` only when all fields contain valid values (non-empty itemName, positive amount, valid category).

**Validates: Requirements 1.3**

### Property 2: Transaction Creation Correctness

*For any* valid form data object (non-empty itemName, positive amount, valid category), creating a transaction SHALL produce an object containing all input fields plus a unique ID and timestamp, where the ID is non-empty and the timestamp is a valid number.

**Validates: Requirements 1.5**

### Property 3: JSON Serialization Round-Trip

*For any* valid transaction object, serializing it to JSON and then deserializing it back SHALL produce an equivalent transaction object with all fields (id, itemName, amount, category, timestamp) preserved with their original values and types.

**Validates: Requirements 2.4, 2.5**

### Property 4: Transaction Deletion Correctness

*For any* array of transactions and any transaction ID that exists in the array, deleting that transaction SHALL result in an array that: (1) has length reduced by exactly one, (2) does not contain the deleted transaction ID, and (3) contains all other transactions unchanged.

**Validates: Requirements 4.2**

### Property 5: Balance Calculation Accuracy

*For any* array of transaction objects, calculating the balance SHALL return a number equal to the sum of all transaction amounts, where an empty array returns zero and the result is always non-negative.

**Validates: Requirements 5.1**

### Property 6: Category Aggregation Correctness

*For any* array of transaction objects, calculating category totals SHALL return an object with exactly three keys (Food, Transport, Fun), where each value equals the sum of amounts for transactions in that category, and the sum of all three category totals equals the total balance.

**Validates: Requirements 6.2**

## Error Handling

### Input Validation Errors

**Error Type:** Invalid Form Data

**Scenarios:**
- Empty item name
- Missing or zero/negative amount
- No category selected

**Handling:**
- Display error message below form
- Highlight invalid fields (optional enhancement)
- Prevent transaction creation
- Keep form data intact for user correction

**User Feedback:**
```javascript
// Error message examples
"Item name is required"
"Amount must be greater than 0"
"Please select a valid category"
```

### Storage Errors

**Error Type:** Local Storage Failure

**Scenarios:**
- Local Storage quota exceeded
- Local Storage disabled by user
- Browser in private/incognito mode with storage restrictions

**Handling:**
- Catch exceptions during `localStorage.setItem()`
- Log error to console
- Display user-friendly message: "Unable to save data. Please check your browser settings."
- Allow app to continue functioning with in-memory data only

**Implementation:**
```javascript
try {
  localStorage.setItem(key, value);
} catch (error) {
  console.error('Storage error:', error);
  showStorageError();
  // Continue with in-memory operation
}
```

### Data Corruption Errors

**Error Type:** Invalid JSON in Local Storage

**Scenarios:**
- Corrupted data in Local Storage
- Manual user modification of storage
- Data from incompatible app version

**Handling:**
- Catch JSON.parse() exceptions
- Log error to console
- Return empty array as fallback
- Optionally clear corrupted data

**Implementation:**
```javascript
try {
  const data = JSON.parse(localStorage.getItem(key));
  return Array.isArray(data) ? data : [];
} catch (error) {
  console.error('Parse error:', error);
  return []; // Safe fallback
}
```

### Canvas Rendering Errors

**Error Type:** Canvas Context Unavailable

**Scenarios:**
- Browser doesn't support Canvas API
- Canvas element not found in DOM

**Handling:**
- Check for canvas support before rendering
- Gracefully degrade to text-based category summary
- Display message: "Chart unavailable"

**Implementation:**
```javascript
const canvas = document.getElementById('spending-chart');
if (!canvas || !canvas.getContext) {
  displayTextSummary(categoryTotals);
  return;
}
```

### Edge Cases

**Empty State:**
- No transactions: Display "No transactions yet" message
- Balance shows $0.00
- Chart shows empty state or message

**Large Numbers:**
- Amounts over 1 million: Format with commas (e.g., $1,234,567.89)
- Very long item names: Truncate with ellipsis in display

**Decimal Precision:**
- Round all amounts to 2 decimal places for display
- Store full precision in data model

## Testing Strategy

### Overview

The testing strategy combines property-based testing for core business logic with example-based unit tests for specific scenarios and integration tests for browser API interactions.

### Property-Based Testing

**Library:** [fast-check](https://github.com/dubzzz/fast-check) (JavaScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Each test references its design document property

**Property Tests to Implement:**

1. **Form Validation Property Test**
   - **Tag:** `Feature: expense-budget-tracker, Property 1: Form Validation Completeness`
   - **Generator:** Arbitrary objects with random itemName (string/empty), amount (number/zero/negative), category (valid/invalid/empty)
   - **Assertion:** Validation returns correct isValid status based on field validity

2. **Transaction Creation Property Test**
   - **Tag:** `Feature: expense-budget-tracker, Property 2: Transaction Creation Correctness`
   - **Generator:** Valid form data with random non-empty strings, positive numbers, valid categories
   - **Assertion:** Created transaction has all required fields with correct types

3. **JSON Round-Trip Property Test**
   - **Tag:** `Feature: expense-budget-tracker, Property 3: JSON Serialization Round-Trip`
   - **Generator:** Random transaction objects with various field values
   - **Assertion:** `JSON.parse(JSON.stringify(transaction))` equals original transaction

4. **Transaction Deletion Property Test**
   - **Tag:** `Feature: expense-budget-tracker, Property 4: Transaction Deletion Correctness`
   - **Generator:** Random transaction arrays and random IDs from those arrays
   - **Assertion:** Deletion removes exactly one item, the correct item, and preserves others

5. **Balance Calculation Property Test**
   - **Tag:** `Feature: expense-budget-tracker, Property 5: Balance Calculation Accuracy`
   - **Generator:** Random arrays of transactions with various amounts
   - **Assertion:** Calculated balance equals manual sum of amounts
   - **Edge Cases:** Empty array returns 0, single transaction returns that amount

6. **Category Aggregation Property Test**
   - **Tag:** `Feature: expense-budget-tracker, Property 6: Category Aggregation Correctness`
   - **Generator:** Random arrays of transactions with various categories
   - **Assertion:** Category totals sum to total balance, all three categories present
   - **Edge Cases:** Empty array returns all zeros, single category has all transactions

### Unit Testing

**Framework:** Jest or Vitest (modern JavaScript testing frameworks)

**Unit Tests to Implement:**

1. **Form Validation Examples**
   - Valid form data passes validation
   - Empty item name fails validation
   - Zero amount fails validation
   - Negative amount fails validation
   - Invalid category fails validation
   - Multiple errors are all reported

2. **Transaction ID Generation**
   - Generated IDs are unique across multiple calls
   - IDs are non-empty strings
   - IDs contain timestamp component

3. **UI Rendering Examples**
   - Transaction list renders correct number of items
   - Each transaction displays correct fields
   - Delete button is present for each transaction
   - Balance displays with correct formatting ($X.XX)

4. **Error Display**
   - Error message shows when validation fails
   - Error message hides when form is valid
   - Error message contains specific field errors

### Integration Testing

**Approach:** Browser-based testing with Local Storage mocking

**Integration Tests to Implement:**

1. **Local Storage Operations**
   - Save transactions to Local Storage
   - Load transactions from Local Storage
   - Delete transactions updates Local Storage
   - Corrupted data returns empty array

2. **Full User Workflows**
   - Add transaction → appears in list → balance updates → chart updates
   - Delete transaction → removed from list → balance updates → chart updates
   - Page reload → transactions persist → UI renders correctly

3. **Canvas Rendering**
   - Chart renders with valid data
   - Chart shows empty state with no data
   - Chart updates when data changes

### Manual Testing Checklist

**Browser Compatibility:**
- [ ] Test in Chrome 90+
- [ ] Test in Firefox 88+
- [ ] Test in Edge 90+
- [ ] Test in Safari 14+

**Responsive Design:**
- [ ] Test on mobile viewport (320px - 480px)
- [ ] Test on tablet viewport (768px - 1024px)
- [ ] Test on desktop viewport (1200px+)

**User Interactions:**
- [ ] Form submission with valid data
- [ ] Form submission with invalid data
- [ ] Delete transaction
- [ ] Scroll transaction list with many items
- [ ] Page reload preserves data

**Edge Cases:**
- [ ] Add 100+ transactions (performance)
- [ ] Very long item names
- [ ] Very large amounts
- [ ] All transactions in one category
- [ ] Empty state (no transactions)

### Test Coverage Goals

- **Property Tests:** 100% coverage of pure business logic functions
- **Unit Tests:** 80%+ coverage of JavaScript code
- **Integration Tests:** All critical user workflows
- **Manual Tests:** All supported browsers and viewports

### Continuous Testing

**Development Workflow:**
1. Write property test for new business logic
2. Implement function to pass property test
3. Write unit tests for specific examples
4. Run all tests before committing
5. Manual browser testing for UI changes

**Test Execution:**
```bash
# Run all tests
npm test

# Run property tests only
npm test -- --grep "Property"

# Run with coverage
npm test -- --coverage

# Run in watch mode during development
npm test -- --watch
```

## Implementation Notes

### Development Phases

**Phase 1: Core Data Layer**
1. Implement Transaction data model
2. Implement Storage Manager (save/load/clear)
3. Write and pass property tests for serialization
4. Implement Transaction Manager (add/delete/calculate)
5. Write and pass property tests for calculations

**Phase 2: UI Foundation**
1. Create HTML structure
2. Implement base CSS styles
3. Implement form rendering
4. Implement transaction list rendering
5. Wire up event listeners

**Phase 3: Business Logic Integration**
1. Implement Form Handler with validation
2. Write and pass property tests for validation
3. Connect form submission to Transaction Manager
4. Implement balance calculation and display
5. Write and pass property tests for balance

**Phase 4: Visualization**
1. Implement category aggregation
2. Write and pass property tests for aggregation
3. Implement Chart Renderer
4. Implement pie chart drawing algorithm
5. Implement chart legend

**Phase 5: Polish & Testing**
1. Add error handling
2. Implement responsive design
3. Cross-browser testing
4. Performance optimization
5. Accessibility improvements

### Performance Considerations

**Optimization Strategies:**

1. **Minimize DOM Manipulation**
   - Batch updates when possible
   - Use DocumentFragment for multiple insertions
   - Avoid layout thrashing

2. **Efficient Re-rendering**
   - Only re-render changed components
   - Use event delegation for transaction list
   - Debounce chart updates if needed

3. **Local Storage Efficiency**
   - Only write to storage when data changes
   - Avoid unnecessary serialization
   - Consider compression for large datasets (future enhancement)

4. **Chart Rendering**
   - Clear canvas before redrawing
   - Use requestAnimationFrame for smooth updates
   - Cache color values and calculations

### Accessibility Considerations

**ARIA Labels:**
- Add `aria-label` to form inputs
- Add `aria-live` region for balance updates
- Add `aria-label` to delete buttons

**Keyboard Navigation:**
- Ensure all interactive elements are keyboard accessible
- Add visible focus indicators
- Support Enter key for form submission

**Screen Reader Support:**
- Use semantic HTML elements
- Provide text alternatives for chart
- Announce transaction additions/deletions

**Example:**
```html
<button 
  class="delete-btn" 
  aria-label="Delete transaction: Lunch at cafe, $15.50"
  data-transaction-id="...">
  ×
</button>
```

### Future Enhancements

**Potential Features:**
1. Edit existing transactions
2. Filter transactions by category
3. Date range filtering
4. Export data to CSV
5. Multiple budget categories with limits
6. Budget alerts when approaching limits
7. Dark mode theme
8. Data backup/restore functionality
9. Transaction search
10. Monthly/yearly spending trends

**Technical Improvements:**
1. Add TypeScript for type safety
2. Implement service worker for offline support
3. Add data compression for Local Storage
4. Implement virtual scrolling for large lists
5. Add animation transitions
6. Implement undo/redo functionality
7. Add data validation schema (e.g., Zod)
8. Implement state management pattern (e.g., Redux-like)

## Conclusion

This design provides a solid foundation for building the Expense & Budget Tracker as a simple, maintainable vanilla JavaScript application. The architecture separates concerns clearly, the data models are straightforward, and the algorithms are efficient for the expected scale. Property-based testing ensures the core business logic is correct across a wide range of inputs, while unit and integration tests cover specific scenarios and browser interactions.

The single-file approach for CSS and JavaScript keeps the project simple and easy to understand, while the modular organization within those files maintains code quality and readability. The use of Local Storage provides persistence without backend complexity, making the application easy to deploy and use.
