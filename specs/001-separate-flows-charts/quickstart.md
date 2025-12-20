# Quickstart Verification: Separate Flows & Charts

## Prerequisites

1. Apply Prisma migration: `npx prisma migrate dev`
2. Start dev server: `npm run dev`

## Verification Steps

### 1. Distinct Flows
1. Go to Dashboard.
2. Click "Add" button.
3. **Verify**: You see a choice for "Income" vs "Expense".
4. Select "Expense".
5. **Verify**: Only expense categories are shown.
6. Create a transaction.
7. **Verify**: Transaction saved correctly as Expense.

### 2. Chart Visualization
1. Go to "Settings" area or find "Charts" in menu (if added).
2. Click "Charts".
3. **Verify**: Chart page loads default month.
4. Toggle "Income".
5. **Verify**: Chart updates to income data.
6. Click "Previous Month".
7. **Verify**: Date header updates and data refreshes.
