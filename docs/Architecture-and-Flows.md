# Architecture & Flows

CMS Web relies on a role-based workflow to process maintenance complaints efficiently. 

## 1. Role-Based Authorization

The system classifies users into distinct roles, each having specific privileges:
* **Faculty**: Submits departmental or residential complaints. Can comment, edit, or delete posts within a 30-minute window.
* **Warden**: Submits hostel-related complaints. Can comment, edit, or delete posts within a 30-minute window.
* **Centrehead**: Submits administrative/building-related complaints. Can comment, edit, or delete posts within a 30-minute window.
* **Admin (XEN, AE, JE)**:
  * **XEN (Executive Engineer)**: Oversees all pending posts, assigns Junior Engineers (JE), and manages post statuses.
  * **AE (Assistant Engineer)**: Reviews posts pending AE review and manages them.
  * **JE (Junior Engineer)**: Resolves assignments directly or reports progress.

*Diagram location:* `/public/img/cms6.png`

---

## 2. Authentication Flow

Authentication is session or token-based, verifying credentials (login) and checking positions/roles on protected routes via custom Gin middleware.

*Diagram location:* `/public/img/cms1.png`

---

## 3. Complaint Lifecycle Flow

The typical flow of a complaint from submission to closure:
1. **Creation**: Submissions by Faculty, Warden, or Centrehead default to the `Pending_XEN` status.
2. **Review/Assignment**: The XEN reviews and delegates it to a Junior Engineer (`Pending_JE`).
3. **Execution**: The JE performs the work and updates the status to `Resolved_JE`.
4. **Resolution**: The complaint progresses through administrative checks (AE / XEN) until it reaches `Resolved` or `Closed`.

*Diagram location:* `/public/img/cms2.png`

---

## 4. Request Status Matrix (XEN, JE)

A quick matrix showing how request statuses transition between the Executive Engineer (XEN) and the Junior Engineer (JE):

*Diagram location:* `/public/img/cms3.png`

---

## 5. Request Status (AE)

How Assistant Engineers (AE) intervene in the verification process for specific complaints:

*Diagram location:* `/public/img/cms4.png`
