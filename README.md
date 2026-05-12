# NIT Hamirpur - Complaint Management System (CMS) Backend

This repository contains the backend implementation for the Estate Office Complaint Management System at NIT Hamirpur. The system is designed to handle multi-role complaint lifecycles involving Faculty, Wardens, Centre Heads, and Administrative staff (XEN, AE, JE).

## Current Status: Complaint Flow
The core complaint lifecycle is fully implemented and verified.

### 1. Roles & Sources
- **Faculty**: Report residential or departmental complaints.
- **Warden**: Report hostel-related complaints (requires Room Number).
- **Centre Head**: Report building-related complaints.
- **Admin (XEN/AE/JE)**: Process and resolve complaints.

### 2. Multi-Stage Workflow
The system follows a strict state-machine flow:
1.  **Submission**: Complaint starts at `StatusPendingXEN` and `StageXEN`.
2.  **XEN Triage**: 
    - Forward to `AE` (updates to `StatusPendingAE` and `StageAE`).
    - Reject (updates to `StatusRejected`).
3.  **AE Assignment**:
    - Assign to a specific `JE` (updates to `StatusPendingJE` and `StageJE`).
    - Reject.
4.  **JE Resolution**:
    - Mark as `Resolved`.
    - Reject.

### 3. Key Technical Implementation
- **Dynamic Routing**: Automatic selection of Civil or Electrical officials based on complaint type.
- **Audit Trail**: Every action (forward/reject/resolve) requires a comment and is stored in the `Comments` table.
- **Database**: PostgreSQL with GORM Auto-migrations for all models.

---

## Integration with Authentication

The system is designed for seamless integration with a JWT-based authentication system.

### How to Integrate Auth:
1.  **Middleware**: Apply the Auth middleware to the reporting and admin processing routes in `routes/complaint_routes.go`.
2.  **ID Extraction**: In `controllers/complaint_controller.go`, replace the manually passed IDs in the request body (e.g., `input.AdminID`) with the ID extracted from the Gin Context:
    ```go
    // Example:
    userID := c.MustGet("userID").(uint)
    ```
3.  **Role Verification**: Add a check to verify that the logged-in user's role matches the required stage (e.g., only a user with `RoleXEN` can access `/admin/xen/complaint/status`).

---

## Getting Started

### Prerequisites
- Go 1.25+
- PostgreSQL

### Setup
1.  **Install Dependencies**:
    ```bash
    go mod tidy
    ```
2.  **Configure Environment**:
    Create a `.env` file based on `.env.example`:
    ```env
    DB_USER=postgres
    DB_PASS=your_password
    DB_NAME=cms_db
    DB_PORT=5432
    ```
3.  **Run Server**:
    ```bash
    go run main.go
    ```

### API Endpoints
- `POST /faculty/complaint/report`: Faculty reports.
- `POST /warden/complaint/report`: Warden reports.
- `POST /centrehead/complaint/report`: Centre Head reports.
- `POST /admin/xen/complaint/status`: XEN updates.
- `POST /admin/ae/complaint/status`: AE updates.
- `POST /admin/je/complaint/status`: JE updates.
- `GET /complaints/public`: Dashboard for all complaints and status updates.
