# Implementation Plan: Expense & Budget Tracker

## Overview

This implementation plan breaks down the Expense & Budget Tracker into discrete coding tasks following the development phases outlined in the design document. The application is a client-side web app built with vanilla HTML, CSS, and JavaScript that tracks expenses across three categories (Food, Transport, Fun), displays total spending, and visualizes spending distribution through a pie chart. All data persists in browser Local Storage.

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create directory structure with `css/` and `js/` folders
  - Create `index.html` with semantic HTML structure including header, input form, transaction list section, and chart section
  - Add form elements for item name (text input), amount (number input), and category (select dropdown with Food, Transport, Fun options)
  - Add canvas element for pie chart rendering
  - Link CSS and JavaScript files
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 2. Implement core data layer and storage management
  - [x] 2.1 Create Transaction data model and Storage Manager module
    - Implement `generateTransactionId()` function to create unique IDs using timestamp and random string
    - Implement `StorageManager.saveTransactions()` to serialize transaction array to JSON and save to Local Storage
    - Implement `StorageManager.loadTransactions()` to load and deserialize transactions from Local Storage with error handling
    - Implement `StorageManager.clearTransactions()` for clearing storage
    - _Requirements: 2.1, 2.4, 2.5_

  - [ ]* 2.2 Write property test for JSON serialization round-trip
    - **Property 3: JSON Serialization Round-Trip**
    - **Validates: Requirements 2.4, 2.5**
    - Use fast-check to generate random transaction objects
    - Assert that `JSON.parse(JSON.stringify(transaction))` preserves all fields and types
    - Test with minimum 100 iterations

  - [x] 2.3 Implement Transaction Manager module
    - Create `TransactionManager` object with transactions array
    - Implement `addTransaction()` to add new transaction to array and save to storage
    - Implement `deleteTransaction()` to remove transaction by ID and update storage
    - Implement `getTransactions()` to return current transactions array
    - _Requirements: 1.5, 2.1, 2.2, 4.2, 4.3_

  - [ ]* 2.4 Write property test for transaction deletion correctness
    - **Property 4: Transaction Deletion Correctness**
    - **Validates: Requirements 4.2**
    - Generate random transaction arrays and select random IDs to delete
    - Assert array length reduces by one, deleted ID is removed, other transactions unchanged
    - Test with minimum 100 iterations

- [ ] 3. Implement business logic functions
  - [ ] 3.1 Implement balance calculation function
    - Create `calculateBalance()` function using reduce to sum all transaction amounts
    - Handle empty array case returning zero
    - _Requirements: 5.1, 5.5_

  - [ ]* 3.2 Write property test for balance calculation accuracy
    - **Property 5: Balance Calculation Accuracy**
    - **Validates: Requirements 5.1**
    - Generate random transaction arrays with various amounts
    - Assert calculated balance equals manual sum of amounts
    - Test empty array returns zero
    - Test with minimum 100 iterations

  - [ ] 3.3 Implement category aggregation function
    - Create `getCategoryTotals()` function to calculate spending per category (Food, Transport, Fun)
    - Return object with three category keys and their totals
    - _Requirements: 6.2_

  - [ ]* 3.4 Write property test for category aggregation correctness
    - **Property 6: Category Aggregation Correctness**
    - **Validates: Requirements 6.2**
    - Generate random transaction arrays with various categories
    - Assert category totals sum equals total balance
    - Assert all three categories present in result
    - Test with minimum 100 iterations

- [ ] 4. Implement form validation and handling
  - [ ] 4.1 Create form validation function
    - Implement `validateForm()` to check itemName is non-empty, amount is positive, category is valid
    - Return validation result object with `isValid` boolean and `errors` array
    - _Requirements: 1.3, 1.4_

  - [ ]* 4.2 Write property test for form validation completeness
    - **Property 1: Form Validation Completeness**
    - **Validates: Requirements 1.3**
    - Generate arbitrary form data objects with random/empty/invalid fields
    - Assert validation returns correct isValid status based on field validity
    - Test with minimum 100 iterations

  - [ ] 4.3 Implement Form Handler module
    - Create `FormHandler.handleSubmit()` to prevent default, extract form data, validate, and create transaction
    - Implement error display function to show validation errors below form
    - Implement form clearing function to reset inputs after successful submission
    - _Requirements: 1.3, 1.4, 1.5_

  - [ ]* 4.4 Write unit tests for form validation examples
    - Test valid form data passes validation
    - Test empty item name, zero amount, negative amount, invalid category all fail validation
    - Test multiple errors are reported correctly

- [ ] 5. Checkpoint - Ensure core logic tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement CSS styling
  - [ ] 6.1 Create base styles and layout
    - Implement CSS reset and base typography with minimum 14px font size for body text
    - Create container layout using flexbox/grid with proper spacing
    - Style header with balance display prominently at top
    - Implement consistent color scheme throughout
    - _Requirements: 9.1, 10.1, 10.2, 10.3, 10.4_

  - [ ] 6.2 Style form components and transaction list
    - Style form inputs, select dropdown, and submit button with adequate spacing
    - Create transaction card styles with clear visual hierarchy
    - Implement scrollable container for transaction list
    - Add category color indicators (Food: #FF6384, Transport: #36A2EB, Fun: #FFCE56)
    - Style delete buttons for each transaction
    - _Requirements: 3.1, 3.2, 3.3, 10.4, 10.5_

  - [ ] 6.3 Add responsive design and utility classes
    - Implement media queries for mobile (320px-480px), tablet (768px-1024px), and desktop (1200px+)
    - Create utility classes: `.hidden`, `.error`, `.scrollable`
    - Add error message styling
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 7. Implement UI rendering and DOM manipulation
  - [ ] 7.1 Create UI Manager module for transaction list rendering
    - Implement `UIManager.renderTransactions()` to dynamically generate transaction list HTML
    - Display item name, amount, and category for each transaction with proper formatting
    - Add delete button with data-transaction-id attribute for each transaction
    - Use event delegation for delete button clicks
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 4.1_

  - [ ] 7.2 Implement balance display update function
    - Create `UIManager.updateBalance()` to calculate and display total with $X.XX formatting
    - Update balance display when transactions are added or deleted
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 7.3 Implement error display and form clearing functions
    - Create `UIManager.showError()` to display validation errors
    - Create `UIManager.clearForm()` to reset form inputs
    - Add/remove `.hidden` class to show/hide error messages
    - _Requirements: 1.4_

- [ ] 8. Implement chart rendering
  - [ ] 8.1 Create Chart Renderer module with pie chart drawing
    - Implement `ChartRenderer.drawPieChart()` using Canvas API
    - Calculate slice angles based on category totals as percentage of total spending
    - Draw pie slices with category colors starting at 12 o'clock position
    - Handle empty state when no transactions exist
    - Add white borders between slices for clarity
    - _Requirements: 6.1, 6.5_

  - [ ] 8.2 Implement chart legend rendering
    - Create `ChartRenderer.renderLegend()` to display category names, colors, and amounts
    - Update legend when chart updates
    - _Requirements: 6.1_

  - [ ] 8.3 Implement chart update function
    - Create `UIManager.renderChart()` to calculate category totals and trigger chart redraw
    - Update chart when transactions are added or deleted
    - _Requirements: 6.3, 6.4_

- [ ]* 8.4 Write unit tests for chart rendering
  - Test chart renders with valid data
  - Test chart shows empty state with no transactions
  - Test chart updates when data changes

- [ ] 9. Implement application initialization and event wiring
  - [ ] 9.1 Create App initialization module
    - Implement `App.init()` to load transactions from Local Storage on page load
    - Render initial transaction list, balance, and chart
    - Attach event listener to form submit
    - Attach event listeners to delete buttons using event delegation
    - _Requirements: 2.3, 3.4, 5.3, 6.3_

  - [ ] 9.2 Wire up transaction addition flow
    - Connect form submission to validation, transaction creation, storage update, and UI refresh
    - Ensure transaction list, balance, and chart all update within specified time limits
    - _Requirements: 7.2, 7.4_

  - [ ] 9.3 Wire up transaction deletion flow
    - Connect delete button clicks to transaction removal, storage update, and UI refresh
    - Ensure transaction list, balance, and chart all update within specified time limits
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 7.3, 7.4_

- [ ] 10. Checkpoint - Ensure integration works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Add error handling and edge cases
  - [ ] 11.1 Implement Local Storage error handling
    - Add try-catch blocks around localStorage.setItem() and localStorage.getItem()
    - Handle quota exceeded errors with user-friendly message
    - Handle JSON parse errors by returning empty array fallback
    - Log errors to console for debugging
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 11.2 Implement canvas fallback and edge case handling
    - Check for canvas support before rendering chart
    - Display text-based category summary if canvas unavailable
    - Handle very long item names with text truncation and ellipsis
    - Format large amounts with comma separators
    - Round all displayed amounts to 2 decimal places
    - _Requirements: 6.1, 6.5_

- [ ]* 11.3 Write integration tests for error scenarios
  - Test Local Storage save/load with mocked storage
  - Test corrupted data returns empty array
  - Test canvas unavailable shows fallback

- [ ] 12. Add accessibility features
  - [ ] 12.1 Implement ARIA labels and keyboard navigation
    - Add `aria-label` attributes to form inputs
    - Add `aria-label` to delete buttons with transaction details
    - Add `aria-live` region for balance updates
    - Ensure all interactive elements are keyboard accessible
    - Add visible focus indicators to buttons and inputs
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 12.2 Add screen reader support
    - Use semantic HTML elements throughout
    - Provide text alternative for chart visualization
    - Announce transaction additions/deletions to screen readers
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 13. Final testing and polish
  - [ ]* 13.1 Perform cross-browser testing
    - Test in Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
    - Verify all features work correctly in each browser
    - Test Local Storage persistence across page reloads
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 13.2 Perform responsive design testing
    - Test on mobile viewport (320px-480px)
    - Test on tablet viewport (768px-1024px)
    - Test on desktop viewport (1200px+)
    - Verify layout adapts appropriately at each breakpoint
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 13.3 Perform performance testing
    - Test with 100+ transactions to verify performance
    - Verify transaction list updates within 100ms
    - Verify balance updates within 100ms
    - Verify chart updates within 500ms
    - Verify initial page load within 2 seconds
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 14. Final checkpoint - Complete implementation review
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- The application uses vanilla JavaScript (ES6+) with no external dependencies except fast-check for property-based testing
- Property-based tests validate universal correctness properties across wide input ranges
- Unit tests validate specific examples and edge cases
- Integration tests verify browser API interactions and full user workflows
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- All data persists in browser Local Storage using the key `expense-tracker-transactions`
- The three expense categories are fixed: Food, Transport, and Fun
- Chart uses Canvas API with specific colors: Food (#FF6384), Transport (#36A2EB), Fun (#FFCE56)
- Performance targets: page load <2s, UI updates <100ms, chart updates <500ms
- Browser support: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3"] },
    { "id": 5, "tasks": ["3.4", "4.1"] },
    { "id": 6, "tasks": ["4.2", "4.3"] },
    { "id": 7, "tasks": ["4.4", "6.1"] },
    { "id": 8, "tasks": ["6.2"] },
    { "id": 9, "tasks": ["6.3", "7.1"] },
    { "id": 10, "tasks": ["7.2", "7.3"] },
    { "id": 11, "tasks": ["8.1"] },
    { "id": 12, "tasks": ["8.2", "8.3"] },
    { "id": 13, "tasks": ["8.4", "9.1"] },
    { "id": 14, "tasks": ["9.2", "9.3"] },
    { "id": 15, "tasks": ["11.1", "11.2"] },
    { "id": 16, "tasks": ["11.3", "12.1"] },
    { "id": 17, "tasks": ["12.2"] },
    { "id": 18, "tasks": ["13.1", "13.2", "13.3"] }
  ]
}
```
