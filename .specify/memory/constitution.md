<!--
SYNC IMPACT REPORT
Version Change: 1.0.0 (Initial Ratification)
Modified Principles: Defined initial 5 principles based on user input and project context.
Added Sections: Technical Constraints, Development Workflow.
Templates Requiring Updates: ✅ None (Initial Setup)
Follow-up TODOs: None
-->
# Jai Banteng Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### I. LIFF-First Interaction
<!-- Example: I. Library-First -->
The app occurs primarily within the LINE ecosystem. All interactions MUST be optimized for the LIFF environment, respecting safe areas, touch behaviors, and viewport constraints. It MUST feel native to LINE, not just a responsive website.

### II. Distinct Financial Flows
<!-- Example: II. CLI Interface -->
Income and Expense are fundamentally different activities. They MUST be clearly separated in the UI and data model to prevent user error. The interface MUST allow "Quick Entry" for both without ambiguity. Users should never accidentally log an expense as income or vice-versa.

### III. Categorized Insight
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
Data collection exists to serve visualization. Charts and graphs MUST be available by category to answer "Where is my money going?". Visualizations are not separate addons but core views accessible from the main menu.

### IV. Minimalist Efficiency
<!-- Example: IV. Integration Testing -->
Every tap counts. Deep nesting is prohibited. Key actions (Add Transaction, View Chart) MUST be accessible within 1-2 taps from the landing screen. Complexity MUST be hidden behind simple default choices.

### V. Data Integrity & Sync
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
As a financial record tool, data accuracy is paramount. Transactions MUST be persisted reliably using Prisma. Migrations MUST be non-destructive to user data.

## Technical Constraints
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

- **Framework**: Next.js 15+ (App Directory)
- **Database**: Prisma ORM with relational integrity
- **Styling**: Tailwind CSS for utility-first design
- **Platform**: Mobile Web targeted explicitly for LINE Internal Browser (LIFF)

## Development Workflow
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

- **Branching**: Use `feature/name` for new work.
- **Commits**: Follow Conventional Commits (feat, fix, docs, etc.).
- **Reviews**: All changes strictly affecting Core Principles require code review against this constitution.

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This Constitution is the highest level of design authority for Jai Banteng.
1. **Compliance**: All feature specifications and implementation plans must be checked against these principles.
2. **Amendments**: Changes to these principles require explicit user approval and a version bump of this document.
3. **Conflicts**: In case of conflict between efficiency and features, efficiency (Principle IV) usually wins unless it compromises data integrity (Principle V).

**Version**: 1.0.0 | **Ratified**: 2025-12-20 | **Last Amended**: 2025-12-20
