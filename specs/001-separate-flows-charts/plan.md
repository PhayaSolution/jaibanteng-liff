# Implementation Plan: Separate Flows & Category Charts

**Branch**: `001-separate-flows-charts` | **Date**: 2025-12-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-separate-flows-charts/spec.md`

## Summary

Implement strict separation of Income and Expense flows by updating the Transaction creation UI and Category data model. Add a new Charts page to the main navigation, visualizing financial data by category with month navigation and type filtering. Migration logic handles existing legacy category data.

## Technical Context

**Language/Version**: TypeScript / Node.js (Next.js 15+ App Directory)
**Primary Dependencies**: `prisma` (ORM), `recharts` (Visualization), `lucide-react` (Icons), `@line/liff` (Platform)
**Storage**: PostgreSQL (via Prisma)
**Testing**: Manual Verification (Constitution: LIFF-First Interaction)
**Target Platform**: Mobile Web (LIFF Browser)
**Project Type**: Next.js Web Application
**Performance Goals**: <500ms initial load for Chart page
**Constraints**: Visuals must fit within standard mobile viewports (Safe Area aware)
**Scale/Scope**: ~10-20 categories, ~100s transactions per month

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. LIFF-First Interaction**: Charts must be touch-friendly and responsive. **[PASS]**
- **II. Distinct Financial Flows**: This is the core goal of the feature. **[PASS]**
- **III. Categorized Insight**: This is the core goal of the feature. **[PASS]**
- **IV. Minimalist Efficiency**: Chart access is 1 tap from menu. **[PASS]**
- **V. Data Integrity & Sync**: Strict Schema enforcement for Category types. **[PASS]**

## Project Structure

### Documentation (this feature)

```text
specs/001-separate-flows-charts/
├── plan.md              # This file
├── research.md          # Technology decisions
├── data-model.md        # Prisma schema updates
├── quickstart.md        # Verification steps
└── contracts/           # API definitions
```

### Source Code (repository root)

```text
app/
├── (pages)/
│   ├── dashboard/page.tsx       # Update: Add separate add buttons? or modal logic
│   ├── charts/page.tsx          # NEW: Stats page
│   └── transaction/add/page.tsx # Update: Enforce type selection
├── api/
│   ├── categories/route.ts      # Update: Add logic for type filtering
│   └── stats/route.ts           # NEW: Endpoint for chart data
├── components/
│   ├── layout/bottom-navigation.tsx # Update: Add Chart icon
│   ├── charts/                  # NEW: Recharts components
│   └── transaction/
│       └── category-selector.tsx # Update: Filtering logic
└── lib/
    ├── prisma.ts
    └── types.ts                 # Update: Add CategoryType enum
```

**Structure Decision**: Next.js App Router structure with localized components for new features.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
