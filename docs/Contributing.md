# Contributing Guide

Thank you for contributing to CMS Web! To maintain code quality and ensure a smooth development process, please adhere to the following guidelines.

---

## 1. Development Workflow

1. **Create a Branch**: Create a descriptive feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Implement Changes**: Ensure your changes are modular and contain appropriate comments. Avoid unrelated refactorings.
3. **Run Tests**: Always run backend tests locally to verify no regressions were introduced:
   ```bash
   go test -v ./test/...
   ```
4. **Commit & Push**: Commit with concise messages conforming to conventional commits (e.g. `feat: add ...`, `fix: resolve ...`):
   ```bash
   git add .
   git commit -m "feat: add user profile page"
   git push origin feat/your-feature-name
   ```
5. **Pull Request**: Open a pull request against the `main` branch. Provide a comprehensive summary of your changes.

---

## 2. Code Conventions

### Backend (Go)
* **GORM Models**: When creating or modifying database schemas, verify relationships and validation tags (e.g., `binding:"required"`, `gorm:"not null"`).
* **Endpoints**: Add routes to their designated category in the `routes/` package.
* **Error Handling**: Follow idiomatic Go patterns. Return clear JSON error payloads with relevant HTTP statuses:
  * `400 Bad Request` for invalid input parameters/schemas.
  * `401 Unauthorized` / `403 Forbidden` for failed authentication/authorization checks.
  * `404 Not Found` when GORM queries return `gorm.ErrRecordNotFound`.
  * `500 Internal Server Error` for database failures.

### Frontend (React + TS)
* **TypeScript**: Define explicit types/interfaces for state, props, and API response schemas. Avoid using `any` whenever possible.
* **Styling**: Maintain vanilla CSS conventions and structure styles clearly within component directories.
