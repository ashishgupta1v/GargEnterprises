# Implementation Plan: Garg Enterprises Inventory System (Phase 1)

This implementation plan details the sequential, step-by-step execution roadmap for **Approach C: Spec-Driven, AI-Accelerated Monorepo Execution**. 

All deliverables are mapped to specific files within a unified monorepo structure. Development proceeds in logical phases: Infrastructure & Foundation first, followed by Backend Domains, the Mobile Sync Core, UI screens, and final QA verification.

---

## Proposed Changes & Folder Layout

> **Lead Engineer**: Ashish Gupta · Digital Builders
> **Document**: GE-P1-IMPL-001 · v1.1 · May 2026

The monorepo structure will divide the application into three primary directories:
* `/backend`: Laravel 12 Modular Monolith.
* `/mobile`: React Native Expo client application.
* `/web`: Vue.js 3 / Inertia Owner dashboard assets.

---

## Phase 0: Repository Scaffold & Database Setup (Days 1–4)

This phase establishes the monorepo workspace, builds database migrations, configures server configurations, and establishes trusted device authentication schemas.

### 1. Database Migrations

#### [NEW] [migrations](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/backend/database/migrations/)
* Write version-controlled PostgreSQL schema migrations:
  * `2026_05_28_000001_create_brands_table.php`
  * `2026_05_28_000002_create_categories_table.php` (utilizing `ltree` extensions and Gist indexing structures).
  * `2026_05_28_000003_create_locations_table.php` (self-referential physical bin system).
  * `2026_05_28_000004_create_products_table.php` (the central SKU schema mapped to brands, categories, and HSN codes).
  * `2026_05_28_000005_create_inventory_stock_table.php` (composite key balances).
  * `2026_05_28_000006_create_users_table.php` (trusted device tracking JSONB schema).
  * `2026_05_28_000007_create_stock_movements_table.php` (transaction pending queue).
  * `2026_05_28_000008_create_activity_log_table.php` (immutable audit trails).
  * `2026_05_28_000009_create_product_photos_table.php` (media relations).

### 2. Infrastructure Configuration

#### [NEW] [Dockerfile](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/backend/Dockerfile)
* Docker container file configured with PHP-FPM, Alpine Linux, PostgreSQL drivers, and standard extensions.

#### [NEW] [docker-compose.yml](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/backend/docker-compose.yml)
* Runs PHP-FPM, isolated Redis, Nginx reverse proxy, and MeiliSearch containers under a virtualized local networking environment.

### 3. Authentication & Security Domain

#### [NEW] [LoginAction.php](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/backend/app/Domains/Identity/Actions/LoginAction.php)
* Processes logins by verifying the phone number and 6-digit PIN. Validates trusted hardware signatures. Blocks logins if the account is locked out inside Redis due to consecutive PIN failures.

#### [NEW] [LoginRequest.php](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/backend/app/Domains/Identity/Requests/LoginRequest.php)
* Handles input validation using FormRequest parameters.

---

## Phase 1: Catalog & Search Engine Integration (Days 5–11)

This phase seeds the 26,000 product catalogue, integrates the self-hosted typo-tolerant search engine, handles bulk Excel uploads, and builds the client-side local database engine.

### 1. Backend Search Pipeline

#### [NEW] [ProductObserver.php](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/backend/app/Domains/Catalog/Observers/ProductObserver.php)
* Monitors Eloquent product events (`created`, `updated`, `deleted`). On event triggers, it queues a background job that indexes matching entities in the MeiliSearch engine.

#### [NEW] [SearchProductsAction.php](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/backend/app/Domains/Catalog/Actions/SearchProductsAction.php)
* Invokes MeiliSearch APIs with filtering inputs, resolving search lists in under 50ms.

### 2. Bulk Excel Upload Core

#### [NEW] [ImportCatalogAction.php](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/backend/app/Domains/Catalog/Actions/ImportCatalogAction.php)
* Validates imported Excel spreadsheets row-by-row. Validates foreign keys (brand, category matching), HSN values, duplicates, and barcode integrity. Outputs detailed validation logs specifying row numbers, fields, and reasons for rejected data.

### 3. Client Database (WatermelonDB Configuration)

#### [NEW] [schema.ts](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/mobile/src/db/schema.ts)
* Mapped local SQLite tables, foreign keys, and barcode search indexes.

#### [NEW] [Product.ts](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/mobile/src/db/models/Product.ts)
* WatermelonDB Product Active Record model with lazy-loaded relations for category models and brand models.

---

## Phase 2: Inventory Ledger & Maker-Checker Workflows (Days 12–17)

This phase builds the transactional core of the backend system, ensuring atomic stock balances, maker-checker authorization policies, and automated alerts.

### 1. Stock ledgers & Approvals

#### [NEW] [SubmitMovementAction.php](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/backend/app/Domains/Inventory/Actions/SubmitMovementAction.php)
* Handles stock movement entries. Evaluates request parameters and user permissions:
  * If the submitter is an **Owner**, mutations take effect immediately.
  * If the submitter is a **Manager**, the transaction status is marked `pending` and stock counts remain locked.
* Triggers the `StockMovementSubmittedEvent` when a pending record is saved.

#### [NEW] [ProcessApprovalAction.php](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/backend/app/Domains/Inventory/Actions/ProcessApprovalAction.php)
* Wraps stock ledger updates in an atomic database transaction (`FOR UPDATE` row lock). Updates `qty_on_hand` and logs transactions inside the `activity_log` table.

### 2. Automated Scheduled Alert Engine

#### [NEW] [AlertEngineCommand.php](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/backend/app/Domains/Inventory/Commands/AlertEngineCommand.php)
* Scheduled CLI Command executing daily at 6:00 AM. Detects low-stock items, out-of-stock items, and dead stock. Updates database flags and queues Firebase Cloud Messaging (FCM) notifications to the Owner.

---

## Phase 3: Client App UI, Scanning, & Synchronization (Days 18–20)

This phase builds the React Native mobile screens, links the camera scanner to local databases, integrates Zustand stores, and implements the network-resilient offline synchronization services.

### 1. State Stores & Sync Services

#### [NEW] [useAuthStore.ts](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/mobile/src/stores/useAuthStore.ts)
* Zustand slice managing bearer token values, user role permissions, active lockouts, and biometric authentication status.

#### [NEW] [sync.ts](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/mobile/src/db/sync.ts)
* Executes background synchronizations when an active connection is detected. Pulls delta catalog changes and uploads offline action queues sequentially.

### 2. React Native UI Components

#### [NEW] [BarcodeScannerScreen.tsx](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/mobile/src/screens/BarcodeScannerScreen.tsx)
* Integrates native camera views with ML Kit barcode parsers. Succeeding scans route to local product lookups.

#### [NEW] [MovementQueueScreen.tsx](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/mobile/src/screens/MovementQueueScreen.tsx)
* Displays local pending transactions and queued offline updates, with colour-coded network status indicators.

#### [NEW] [OwnerDashboardScreen.tsx](file:///C:/Users/ashis/OneDrive/Desktop/Project/Garg%20Enterprises/Phase%201/mobile/src/screens/OwnerDashboardScreen.tsx)
* Aggregates real-time metrics (pending approval queues count, total inventory value, out-of-stock count) and displays pending transaction cards with swipe actions.

---

## Verification Plan (Day 21)

To ensure the system matches the defined TRD standards and performance SLAs, the following tests will be executed:

### Automated Tests
* Run PHPUnit database constraint tests:
  * Validate that attempting to update or delete any row in `activity_log` throws a database exception.
  * Verify concurrent stock inward actions execute successfully without race conditions by running 50 concurrent simulated client calls inside parallel PHP threads.
* TypeScript compilation test:
  * Execute `npx tsc --noEmit` inside the `/mobile` directory to assert zero typing compilation errors.

### Manual Verification
* Run an offline simulation:
  * Put the mobile app into Airplane Mode.
  * Scan a test product barcode, verify it returns details instantly from SQLite (<150ms).
  * Record an inward shipment of 10 items. Verify the app shows: `"⚡ 1 transaction queued locally"`.
  * Disable Airplane Mode. Confirm the transaction is automatically sent, that the Owner receives a push notification, and that approving the transaction updates stock levels atomically in the production PostgreSQL instance.
