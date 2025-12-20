# Research: Separate Flows & Charts

## Decisions

### 1. Charting Library
- **Decision**: Use `recharts` (already in package.json).
- **Rationale**: Project already includes it. It is React-based, responsive, and composable.
- **Alternatives**: Chart.js (needs wrapper), D3 (too low-level).

### 2. Category Type Implementation
- **Decision**: Add `type` String field to `Category` model in Prisma.
- **Rationale**: Simple, queryable. Using Enums in Prisma can sometimes vary by DB provider, but String with app-level validation or Enum match is fine. Given existing strings usage, we will likely use "INCOME" and "EXPENSE".
- **Migration**: Default to "EXPENSE" for existing rows.

### 3. Chart Data Aggregation
- **Decision**: Aggregation via Prisma `groupBy` on backend.
- **Rationale**: More efficient than fetching all transactions and reducing on client. Reduces payload size.

### 4. Date Navigation Scoping
- **Decision**: `date-fns` for month manipulation (startOfMonth, endOfMonth).
- **Rationale**: Already in package.json. Reliable date math.

## Open Questions

- None. Technology stack is predefined.
