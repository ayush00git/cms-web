# API Reference

This document maps all the API endpoints available in the CMS Web backend. Most endpoints require authentication via token cookies checked by the `IsAuthenticated` middleware.

---

## 1. Authentication Routes

### Faculty Auth
* `POST /api/auth/faculty/signup` - Register a new faculty account
* `POST /api/auth/faculty/login` - Login to a faculty account
* `POST /api/auth/faculty/forget-password` - Request a password reset link
* `PATCH /api/auth/faculty/reset-password` - Complete password reset using token

### Warden Auth
* `POST /api/auth/warden/signup` - Register a new warden account
* `POST /api/auth/warden/login` - Login to a warden account
* `POST /api/auth/warden/forget-password` - Request a password reset link
* `PATCH /api/auth/warden/reset-password` - Complete password reset using token

### Centrehead Auth
* `POST /api/auth/centrehead/signup` - Register a new centrehead account
* `POST /api/auth/centrehead/login` - Login to a centrehead account
* `POST /api/auth/centrehead/forget-password` - Request a password reset link
* `PATCH /api/auth/centrehead/reset-password` - Complete password reset using token

### Admin Auth
* `POST /api/auth/admin/login` - Login to an admin account (XEN, AE, JE)

### General Auth
* `POST /api/auth/logout` - Clear authentication cookies
* `GET /api/auth/verify` - Verify an account via email link
* `GET /api/profile` - Fetch the profile details of the current logged-in user

---

## 2. Complaint (Post) Routes

Protected by `IsAuthenticated` middleware.

* `POST /api/post/faculty` - Submit a new faculty post
* `POST /api/post/warden` - Submit a new warden post
* `POST /api/post/centrehead` - Submit a new centrehead post

* `PATCH /api/post/faculty/edit/:post_id` - Edit a faculty post (valid for 30 mins post-creation)
* `PATCH /api/post/warden/edit/:post_id` - Edit a warden post (valid for 30 mins post-creation)
* `PATCH /api/post/centrehead/edit/:post_id` - Edit a centrehead post (valid for 30 mins post-creation)

* `DELETE /api/post/faculty/delete/:post_id` - Delete a faculty post (valid for 30 mins post-creation)
* `DELETE /api/post/warden/delete/:post_id` - Delete a warden post (valid for 30 mins post-creation)
* `DELETE /api/post/centrehead/delete/:post_id` - Delete a centrehead post (valid for 30 mins post-creation)

* `GET /api/post/faculty` - Retrieve posts submitted by the logged-in faculty
* `GET /api/post/warden` - Retrieve posts submitted by the logged-in warden
* `GET /api/post/centrehead` - Retrieve posts submitted by the logged-in centrehead

---

## 3. Comments Routes

* `POST /api/post/faculty/comment/:post_id` - Comment on a faculty post (as post author)
* `POST /api/post/warden/comment/:post_id` - Comment on a warden post (as post author)
* `POST /api/post/centrehead/comment/:post_id` - Comment on a centrehead post (as post author)

---

## 4. Admin Operations Routes

Admins can perform operations across any user post types and manage comments/statuses.

### Comments Management
* `GET /api/admin/comments` - Fetch all comments created by the logged-in admin
* `POST /api/admin/comment/:type/:id` - Post an admin comment on a specific post (`type` can be `faculty_posts`, `warden_posts`, `centrehead_posts`)
* `PATCH /api/admin/comment/:type/:id/:comment_id` - Edit an admin's own comment
* `DELETE /api/admin/comment/:type/:id/:comment_id` - Delete an admin's own comment

### Status Management
* `PATCH /api/admin/faculty_posts/status/:post_id` - Update status of a faculty post
* `PATCH /api/admin/warden_posts/status/:post_id` - Update status of a warden post
* `PATCH /api/admin/centrehead_posts/status/:post_id` - Update status of a centrehead post

### Post Queries
* `GET /api/admin/xen/posts` - Fetch posts available to XEN
* `GET /api/admin/ae/posts` - Fetch posts available to AE
* `GET /api/admin/je/posts` - Fetch posts assigned to JE
* `GET /api/admin/posts/:role/:post_id` - Fetch details of any post by role and ID
