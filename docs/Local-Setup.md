# Local Setup

This guide will help you get CMS Web running locally on your development machine. The project is split into a Go backend and a React + TypeScript frontend.

## Prerequisites

Ensure you have the following installed:
- [Go](https://go.dev/dl/) (version 1.20+)
- [Node.js](https://nodejs.org/en) (v18+) and npm
- A relational database (SQLite by default or PostgreSQL/MySQL depending on configuration)

---

## 1. Backend Setup

The backend is built in Go using the **Gin** framework and **GORM**.

1. Navigate to the root directory of the project.
2. Create your `.env` configuration file from the example:
   ```bash
   cp .env.example .env
   ```
   Configure your database credentials and secret keys inside `.env`.
3. Install the dependencies:
   ```bash
   go mod download
   ```
4. Run the backend server:
   ```bash
   go run main.go
   ```
   The backend should now be running on its configured port (typically `:8080`).

---

## 2. Frontend Setup

The frontend is located in the `/app` folder.

1. Navigate to the `/app` directory:
   ```bash
   cd app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the local address printed in the terminal (usually `http://localhost:5173`) in your browser.

---

## 3. Running Tests

To verify that everything is working as expected, run the Go test suite:
```bash
go test -v ./test/...
```
