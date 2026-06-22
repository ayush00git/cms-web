# Welcome to the CMS Web Wiki

**CMS Web** is the official web interface of the Estate Office of NIT Hamirpur designed to streamline and manage maintenance complaints across the campus. It handles both **civil** and **electrical** complaints for both **official/departmental** buildings and **residential** quarters.

## Project Structure

Here is a quick overview of the key directories in this project:

- **`/app`**: The frontend application built using **Vite**, **React**, and **TypeScript**.
- **`/handlers`**: Go backend controller logic handling authentication, posts (complaints), and comments.
- **`/models`**: Gorm database models representing users (Faculty, Warden, Centrehead, Admin), posts, and comments.
- **`/routes`**: API routing configurations for both user actions and administrative control.
- **`/middleware`**: Backend middleware including authentication and permissions checking.
- **`/test`**: Go backend test suite verifying auth flows, complaint management, and administrative actions.

## Quick Links
- [[Local Setup|Local-Setup]]
- [[Architecture & Flows|Architecture-and-Flows]]
- [[API Reference|API-Reference]]
- [[Contributing|Contributing]]
