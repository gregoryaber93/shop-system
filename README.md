# Shop System — React Frontend

A modern, modular React + TypeScript frontend for a microservices-based shop platform. Built with Vite, React Query, and Zod, following a feature-first architecture.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build tool | Vite 6 |
| Routing | React Router v6 |
| Data fetching | TanStack React Query v5 |
| HTTP client | Axios |
| Validation | Zod |
| Testing | Vitest + Testing Library + MSW |

---

## Project Structure

```
src/
├── app/                        # App-level setup
│   ├── providers/              # Root context providers (QueryClient, Auth, Cart, User)
│   ├── routes/                 # AppRoutes — lazy-loaded route definitions
│   └── ui/                     # App-level pages (HomePage, NotFoundPage, ForbiddenPage, …)
├── features/                   # Feature modules (vertical slices)
│   ├── auth/                   # Login, Register, ProtectedRoute, JWT handling
│   ├── cart/                   # Shopping cart state and UI
│   ├── orders/                 # Checkout, order detail
│   ├── products/               # Product listing with React Query caching
│   ├── promotions/             # Promotion evaluation and selection
│   └── user/                   # User profile and order history
├── shared/
│   ├── lib/                    # Cross-cutting utilities
│   │   ├── auth/               # Token helpers
│   │   ├── cache/              # Cache utilities
│   │   ├── grpc/               # gRPC client helpers
│   │   ├── http/               # Axios instance and interceptors
│   │   ├── idempotency/        # Idempotency key generation
│   │   ├── query/              # React Query client config
│   │   └── retry/              # Exponential back-off retry
│   ├── test/                   # Shared test utilities and MSW setup
│   └── ui/                     # Reusable UI components (ErrorBoundary, …)
├── styles/                     # Global CSS
├── App.tsx
└── main.tsx
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
npm install
```

### Environment

Copy the example file and fill in the backend service URLs:

```bash
cp .env.example .env.local
```

```env
# .env.local
VITE_API_BASE_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run type-check` | Run TypeScript compiler without emitting files |
| `npm run test` | Run all tests once with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run verify` | Full pipeline: type-check + test + build |
| `npm run analyze-bundle` | Build and inspect bundle output |

---

## Routes

| Path | Access | Description |
|---|---|---|
| `/login` | Public | Login page |
| `/register` | Public | Registration page |
| `/forbidden` | Public | 403 page |
| `/` | Protected | Home / product listing |
| `/checkout` | Protected | Order checkout |
| `/orders/:orderId` | Protected | Order detail |
| `/profile` | Protected | User profile and order history |
| `/admin/shops` | Admin role | Shop management |
| `/admin/users` | Admin role | User management |
| `/manager/shops` | Manager role | Shops (manager view) |
| `/manager/products` | Manager role | Product management |
| `/manager/promotions` | Manager role | Promotion management |

---

## Backend Services

The frontend integrates with the following microservices:

| Service | Default URL |
|---|---|
| Auth Service | `http://localhost:5300` |
| User Service | `http://localhost:5301` |
| Product Service | `http://localhost:5294` |
| Order Service | `http://localhost:5297` |
| Promotion Service | `http://localhost:5298` |

See `docsReact/QUICK-START.md` for instructions on starting the services locally with Docker Compose.

---

## Architecture Highlights

- **Feature-first layout** — each feature owns its `api/`, `model/`, `ui/`, and `tests/` sub-folders.
- **JWT authentication** — tokens are stored and attached to all requests via an Axios interceptor. Protected routes redirect unauthenticated users to `/login`.
- **Role-based access** — `ProtectedRoute` accepts an optional `requiredRoles` prop and redirects to `/forbidden` if the user lacks the required role.
- **React Query caching** — product and user data are cached with configurable `staleTime`/`gcTime` to reduce redundant network requests.
- **Idempotency** — checkout requests carry a generated idempotency key to prevent duplicate orders on retry.
- **Error handling** — Axios interceptors map ProblemDetails responses to typed errors; `ErrorBoundary` catches unexpected render errors.
- **Code splitting** — all page components are lazy-loaded via `React.lazy` for smaller initial bundle size.

---

## Testing

Tests are written with [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/). API calls are mocked with [MSW](https://mswjs.io/).

```bash
npm run test
```

---

## Copilot Instructions

The `docsReact/` folder contains detailed GitHub Copilot instruction packs split by domain (auth, products, cart, orders, promotions, user, error handling, testing, performance, …). Refer to `docsReact/README.md` for an overview and `docsReact/QUICK-START.md` for a step-by-step feature build guide.
