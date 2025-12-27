# Master Prompt: Recreate the ISABEL Collection System

## I. Project Overview

Your task is to build a complete, professional, single-page dashboard application for a lending collections system named "ISABEL". The application will be built using the latest zoneless, standalone Angular framework and styled with Tailwind CSS. It will feature a dashboard for managing borrowers, a detailed view for individual cases, a reporting section with data visualizations, and functionality for generating PDF documents.

Follow all instructions precisely, adhering to the specified file structure, data models, and feature requirements.

## II. Technology Stack & Setup

1.  **Framework:** Angular (v20+), standalone components, zoneless change detection.
2.  **Styling:** Tailwind CSS via CDN.
3.  **Libraries:**
    *   `jsPDF` for PDF generation (via CDN).
    *   `d3.js` for data visualization (via CDN).
4.  **Language:** TypeScript with strict type checking.

## III. File Structure

Create the following file structure and content.

```
.
├── index.html
├── index.tsx
├── metadata.json
├── services/
│   ├── data.service.ts
│   └── pdf.service.ts
├── src/
│   ├── app.component.ts
│   └── components/
│       ├── detail-panel.component.ts
│       ├── flow-visualizer.component.ts
│       ├── reports.component.ts
│       └── stat-card.component.ts
└── TODO.md
```

## IV. File-by-File Implementation Details

### 1. `metadata.json`

Set up the application's metadata.

-   **`name`**: "ISABEL - Collection System"
-   **`description`**: "Professional Lending Collection System dashboard with workflow management and document generation."
-   **`requestFramePermissions`**: `[]`

### 2. `index.html`

Create the main HTML file. It must include:
- A `<title>`: "ISABEL Collection System".
- A `<base href="/">` tag.
- CDN `<script>` tags for **Tailwind CSS**, **jsPDF**, and **D3.js (v7)**.
- An `<style>` block for custom scrollbars and a default `font-family`.
- The `<script type="importmap">` for Angular and RxJS dependencies.
- A `<body>` tag containing the `<app-root>` element.

### 3. `index.tsx`

Create the application entry point.
- Import `@angular/compiler`.
- Import `bootstrapApplication` and `provideZonelessChangeDetection`.
- Import `AppComponent`.
- Bootstrap `AppComponent` with the `provideZonelessChangeDetection` provider.

### 4. `services/data.service.ts`

This is the core state management service.

-   **Data Models:** Define and export the following types:
    -   `WorkflowStatus`: A string literal union for all possible statuses (`'NOT_LOCATED'`, `'LOCATED'`, `'W_DISCLOSURE'`, etc.).
    -   `Borrower`: An interface with fields like `id`, `full_name`, `loan_id`, `status`, `outstanding_balance`, etc.
    -   `ActionLog`: An interface with fields for logging changes, including `borrower_id`, `action_type`, `old_status`, `new_status`, `notes`, `performed_at`.
-   **Mock Data:** Populate the service with the provided `mockBorrowers` and `mockLogs` arrays.
-   **State Management (Signals):**
    -   Create a `borrowers` signal to hold the array of `Borrower` objects.
    -   Create a `logs` signal to hold the array of `ActionLog` objects.
-   **Computed Signals:**
    -   `stats`: A `computed` signal that calculates the count of borrowers in 'legal', 'moving', and 'stuck' categories.
    -   `portfolioStats`: A `computed` signal that calculates KPIs for the reports page: `totalOutstanding`, `totalLoanAmount`, `collectionRate`, `financialDistribution` (for the donut chart), and `statusCounts` (for the bar chart).
-   **Business Logic (Methods):**
    -   `getNextStates(currentStatus: WorkflowStatus)`: A method that acts as a Finite State Machine (FSM), returning an array of valid next statuses based on the current one.
    -   `updateStatus(borrowerId, newStatus, note)`: Updates a single borrower's status, resets their `days_in_status`, updates `last_action_date`, and adds a new `ActionLog`.
    -   `addNote(borrowerId, note)`: Adds a new `ActionLog` of type 'NOTE' for a borrower without changing their status.
    -   `bulkUpdateStatus(borrowerIds, newStatus, note)`: Updates the status for multiple borrowers simultaneously and creates a log entry for each.

### 5. `services/pdf.service.ts`

This service handles PDF generation.

-   **`generateDemandLetter(borrower, type)`:**
    -   This method accepts a `Borrower` object and a `type` ('1ST' or '2ND').
    -   It uses `window.jspdf` to create a new PDF document.
    -   The PDF should be professionally formatted with a header (company name, address), recipient details, date, a bold title (`NOTICE OF OUTSTANDING DEBT` or `FINAL DEMAND BEFORE LEGAL ACTION`), a body text that dynamically includes the borrower's name and outstanding balance (formatted as `₱12,345`), and a closing.
    -   The file should be saved with a dynamic name (e.g., `John_Doe_1ST_Demand.pdf`).

### 6. `src/components/stat-card.component.ts`

A reusable card for displaying key performance indicators (KPIs).

-   **Inputs:** `label`, `value`, `isActive`, `color` ('blue', 'red', 'green').
-   **Output:** `clicked`.
-   **UI:** The card should have a clean design with a title, a large value, and a slot for an SVG icon passed via `<ng-content>`. It should have hover effects and a distinct visual state (e.g., a blue ring) when `isActive` is true.

### 7. `src/components/flow-visualizer.component.ts`

A component to display a borrower's current position in the collections workflow.

-   **Input:** `status` of type `WorkflowStatus`.
-   **UI:**
    -   Create a vertical flow diagram using styled `div`s.
    -   Group related statuses (e.g., "Discovery Phase", "Legal Pipeline").
    -   The node corresponding to the current `status` input must be visually highlighted (e.g., blue background, white text, pulsing ring). Other nodes should have a neutral style.

### 8. `src/components/reports.component.ts`

The view for analytics and data visualization.

-   **UI:**
    -   Display four main KPI cards at the top: Portfolio Value, Outstanding Debt, Collection Rate, and Active Legal Cases. Currency values should be formatted for PHP (e.g., `₱1,200,000`).
    -   Create a 2-column layout for charts below the KPIs.
-   **Charts (D3.js):**
    -   **Donut Chart:** "Risk Exposure (By Balance)". It should visualize the `financialDistribution` data from `DataService`. Implement a tooltip on hover that shows the value for each segment (e.g., `₱50.5k`).
    -   **Bar Chart:** "Workflow Bottlenecks (Cases by Status)". It should be a horizontal bar chart displaying the top 6 statuses by borrower count from the `statusCounts` data in `DataService`.

### 9. `src/components/detail-panel.component.ts`

A sliding side panel to show comprehensive details for a selected borrower.

-   **Input:** `borrower` (can be `Borrower` or `null`).
-   **Output:** `close`.
-   **UI & Functionality:**
    -   The panel should slide in from the right when `borrower` is not null and be hidden otherwise. An overlay/backdrop should cover the main content when the panel is open.
    -   **Header:** Display the borrower's name, loan ID, phone, and a status badge. Include a close button.
    -   **Content (Scrollable):**
        -   **Financial Snapshot:** Two cards showing "Outstanding Balance" (formatted as PHP) and "Days in Status".
        -   **Workflow Visualizer:** Embed the `app-flow-visualizer` component.
        -   **Contact Information:** Display address and last payment date.
        -   **Quick Actions/Add Note:** A `textarea` and a "Save Note" button to call the `dataService.addNote` method.
        -   **Action History:** A vertical timeline that displays all logs for the current borrower, sorted by most recent first. Different action types (`STATUS_CHANGE`, `NOTE`) should have different icons/colors.
    -   **Footer:**
        -   **Primary Action Button:** A dynamically displayed button based on the borrower's status (e.g., "Generate 1st Demand Letter" if status is `DEMAND_QUEUE`). This button will call methods on `PdfService` or `DataService`.
        -   **Secondary Action Buttons:** A row of smaller buttons for all possible `nextStates` from the FSM, allowing for manual status transitions.

### 10. `src/app.component.ts`

The root component that orchestrates the entire application UI.

-   **Layout:**
    -   A fixed left sidebar for navigation.
    -   A main content area with a header.
    -   The detail panel (`app-detail-panel`) as an overlay layer.
-   **State (Signals):**
    -   `currentView`: Manages whether the 'dashboard' or 'reports' view is active.
    -   `filter`: Tracks the active KPI filter ('all', 'legal', 'stuck', 'moving').
    -   `searchQuery`: Holds the value from the search input.
    -   `selectedBorrower`: Holds the `Borrower` object for the detail panel.
    -   `selectedIds`: A `Set<string>` to manage IDs of borrowers selected for bulk actions.
-   **Computed Signals:**
    -   `filteredBorrowers`: A `computed` signal that chains filtering (by status filter) and searching (by search query) on the main `borrowers` list from the `DataService`.
    -   `isAllSelected`: A `computed` signal to determine the state of the "select all" checkbox.
-   **UI & Functionality:**
    -   **Sidebar:** Navigation links to switch `currentView`.
    -   **Dashboard View:**
        -   Render the three `app-stat-card` components. Clicking them should update the `filter` signal.
        -   **Borrower Table:**
            -   Display the `filteredBorrowers`.
            -   Include a "select all" checkbox in the header.
            -   Include a checkbox for each row. Clicking a checkbox/row toggles its ID in the `selectedIds` set. Clicking the main part of a row (not the checkbox cell) should set the `selectedBorrower` to open the detail panel.
            -   Display columns for Name/Loan ID, Status, Balance (formatted as PHP), and Last Action Date.
        -   **Bulk Action Bar:**
            -   This bar should appear at the bottom of the screen *only* when `selectedIds.size > 0`.
            -   It should display the number of selected items.
            -   It must contain a `<select>` dropdown for choosing a new status and an "Apply Update" button that calls `dataService.bulkUpdateStatus`.
            -   Include a button to clear the selection.

### 11. `TODO.md`

Finally, create the `TODO.md` file. List all the key features developed across the application and mark every single one as complete with `[x]`.

---

Execute these steps sequentially to build the full ISABEL application. Good luck.
