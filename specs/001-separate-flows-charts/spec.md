# Feature Specification: Separate Flows & Category Charts

**Feature Branch**: `001-separate-flows-charts`
**Created**: 2025-12-20
**Status**: Draft
**Input**: User description: "1. แยกหมวดหมู่รายรับกับรายจ่ายออกจากกันและให้เรียกใช้งานให้ง่ายขึ้น 2. อยากเพิ่มหน้าดู chart ในส่วนของ menu ให้เป็น chart ที่ดูแยกตามหมวดหมู่"

## User Scenarios & Testing

### User Story 1 - Distinct Income/Expense Entry (Priority: P1)

As a user, I want to clearly select whether I am recording an Income or an Expense before entering details, so that I never accidentally categorize an expense as income.

**Why this priority**: Directly addresses Principle II (Distinct Financial Flows) of the Constitution to prevent user error and improve usability.

**Independent Test**: Can be tested by navigating to the "Add Transaction" screen and verifying the mandatory selection or distinct interfaces for Income vs Expense.

**Acceptance Scenarios**:

1. **Given** the user is on the Dashboard, **When** they tap the "Add" button, **Then** they should see a clear option to choose "Income" or "Expense" (or distinct buttons for each).
2. **Given** the user selects "Expense", **When** they view the category list, **Then** only Expense categories should be visible.
3. **Given** the user selects "Income", **When** they view the category list, **Then** only Income categories should be visible.

---

### User Story 2 - Category-Based Charts (Priority: P2)

As a user, I want to view charts of my finances broken down by category from the main menu, so that I can understand my spending and earning habits.

**Why this priority**: Addresses Principle III (Categorized Insight) by answering "Where is my money going?" through visualization.

**Independent Test**: Can be tested by tapping the "Chart" icon in the menu and verifying the data visualization.

**Acceptance Scenarios**:

1. **Given** the user is on any page, **When** they look at the main navigation menu, **Then** they should see a "Chart" or "Statistics" option.
2. **Given** the user is on the Chart page, **When** they view the default state, **Then** they should see a graphical breakdown (e.g., Pie Chart) of Expenses by Category for the current month.
3. **Given** the user is on the Chart page, **When** they toggle to "Income", **Then** the chart should update to show Income by Category.

### Edge Cases

- **No Data**: If the current month has no transactions, the chart should display a friendly "No data" state rather than an empty grid or error.
- **Switching Types**: If a user selects "Expense" then switches to "Income" during entry, the selected Category must be cleared if it was an Expense category.
- **Empty Categories**: If no categories exist for a selected type, the selector should prompt the user to create one or show an empty state.
- **Legacy Migration**: Existing categories without a type should default to "Expense" to ensure backward compatibility without user friction.

## Requirements

### Functional Requirements

- **FR-001**: The specific "Add Transaction" flow MUST require a clear distinction between Income and Expense types.
- **FR-002**: The Category Selector MUST filter available categories based on the selected transaction type (Income categories for Income, Expense categories for Expense).
- **FR-003**: The Main Navigation (Menu) MUST include a direct link to the Charts/Statistics page.
- **FR-004**: The Charts page MUST display a Pie Chart (or similar distribution chart) showing total values grouped by Category.
- **FR-005**: The Charts page MUST allow toggling between Income and Expense views.
- **FR-006**: The Charts page MUST default to the current month but MUST allow navigating to previous/next months.

### Key Entities

- **Transaction**: existing entity, needs strict type enforcement (Income/Expense).
- **Category**: existing entity, acts as the grouping key for charts. MUST have a strict `type` attribute (Income or Expense) preventing mixed usage.

## Clarifications

### Session 2025-12-20
- Q: How should categories be associated with transaction types? → A: **Strict Separation** - Categories are explicitly created as "Income" or "Expense" and can strictly ONLY be used for that type.
- Q: What is the date scope for charts? → A: **Month Navigation** - Users can switch to previous/next months (e.g., "< November >").
- Q: How to handle existing legacy categories? → A: **Default to Expense** - Treat all existing legacy categories as "Expense" during migration.

## Success Criteria

### Measurable Outcomes

- **SC-001**: User can navigate to the Chart view in exactly 1 tap from the main Dashboard (Constitution Principle IV).
- **SC-002**: Users can switch between recording an Income and recording an Expense with clear visual feedback (no ambiguity).
- **SC-003**: 100% of categories displayed in the selector match the currently selected transaction type.

## Assumptions

- The app uses `recharts` for visualization (based on package.json).
- The "Menu" refers to the bottom navigation bar or the primary accessible menu on the dashboard.
- "Separated" implies both UI separation and logic separation (filtering).
