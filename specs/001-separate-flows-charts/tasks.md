---
description: "Task list for Separate Flows & Charts"
---

# Tasks: Separate Flows & Category Charts

**Input**: Design documents from `/specs/001-separate-flows-charts/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify project structure and dependencies in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Update Category model with type field in prisma/schema.prisma
- [x] T003 Generate Prisma client and create migration in prisma/migrations
- [x] T004 Define CategoryType in app/lib/types.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Distinct Income/Expense Entry (Priority: P1) 🎯 MVP

**Goal**: Split Income/Expense entry flow and enforce category typing.

**Independent Test**: Verify "Add" button shows choice, and category list is filtered by type.

### Implementation for User Story 1

- [x] T005 [US1] Create CategorySelector component with type filtering in app/components/transaction/category-selector.tsx
- [x] T006 [US1] Update Transaction Add Page to force type selection in app/(pages)/transaction/add/page.tsx
- [x] T007 [US1] Update Categories API to support type filtering in app/api/categories/route.ts
- [x] T008 [US1] Update Transaction API to validate type consistency in app/api/transactions/route.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Category-Based Charts (Priority: P2)

**Goal**: Add distinct Chart page with filtered visualizations.

**Independent Test**: Verify Chart page shows correct data aggregation by category and responds to type toggles.

### Implementation for User Story 2

- [x] T009 [US2] Create Stats API endpoint for aggregated data in app/api/stats/route.ts
- [x] T010 [US2] Create customized PieChart component in app/components/charts/category-pie-chart.tsx
- [x] T011 [US2] Create Charts Page with month navigation and type toggle in app/(pages)/charts/page.tsx
- [x] T012 [US2] Add Chart icon link to Bottom Navigation in app/components/layout/bottom-navigation.component.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T013 Update legacy categories to default to EXPENSE (if not handled by migration)
- [x] T014 Run validation steps from quickstart.md

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
