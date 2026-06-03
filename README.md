# Flashpedia — Flash Sale Marketplace Frontend

A React + TypeScript marketplace frontend for a flash-sale backend. Users can register, log in, browse active and upcoming flash deals with live countdown timers, place orders, pay or cancel them, and review order history. The UI is inspired by Tokopedia (green primary, red flash-sale accents) and prices are formatted as Indonesian Rupiah.

---

## Tech Stack

- **React 18** + **TypeScript** + **Vite 6**
- **React Router 7** for client-side routing
- **Axios** for HTTP, with a shared interceptor that attaches `Authorization: Bearer <accessToken>` on protected requests
- **Context API** for auth state
- Plain CSS with a small design-token system (no UI framework)
- **Nginx** (alpine) for production serving
- **Docker** + **docker compose** for containerized deploys

---

## Prerequisites

- **Node.js 20+** and **npm 10+** (only required for local dev)
- A running backend at **http://localhost:3000** that exposes the endpoints below
- **Docker 24+** (optional, for containerized runs)

---

## Quick Start (local dev)

```bash
# 1. Install dependencies
npm install

# 2. (optional) Point at a non-default backend
cp .env.example .env
# edit VITE_API_BASE_URL if your API is not on http://localhost:3000

# 3. Start the dev server
npm run dev
```

The app is served at **http://localhost:5173**. Vite hot-reloads on file changes.

### Available scripts

| Command          | Description                                  |
| ---------------- | -------------------------------------------- |
| `npm run dev`    | Start Vite dev server with HMR on port 5173  |
| `npm run build`  | Type-check (`tsc -b`) and build to `dist/`   |
| `npm run preview`| Serve the production build locally on 4173   |
| `npm run lint`   | Run ESLint over the project                  |

---

## Configuration

All runtime config is driven by Vite environment variables, which are **inlined into the bundle at build time** (Vite does not read `.env` files at runtime in production).

### Environment variables

| Variable             | Required | Default                  | Description                                  |
| -------------------- | -------- | ------------------------ | -------------------------------------------- |
| `VITE_API_BASE_URL`  | No       | `http://localhost:3000`  | Base URL of the flash-sale backend API       |

### Local dev

Put overrides in a `.env` file at the project root:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Vite picks up `.env`, `.env.local`, and `.env.[mode]` automatically. Variables must be prefixed with `VITE_` to be exposed to the client bundle.

### Production / Docker

Pass it as a Docker build arg (see [Docker](#docker) below).

### Auth & dev token

A few endpoints expect a static dev token. It lives in [`src/config.ts`](src/config.ts):

```ts
export const STATIC_DEV_TOKEN = 'static-dev-token';
```

This token is sent on `POST /users` (register) and `GET /flash-sale-products` requests. Authenticated endpoints (`/orders`) use the per-user access token saved at login time, attached automatically by the axios interceptor in [`src/api/client.ts`](src/api/client.ts).

Tokens are stored in `localStorage` under the keys `accessToken` and `refreshToken`.

---

## Backend API contract

The app expects the following endpoints from the backend at `VITE_API_BASE_URL`:

| Method | Path                                  | Auth header                        | Body                                       | Used by                |
| ------ | ------------------------------------- | ---------------------------------- | ------------------------------------------ | ---------------------- |
| POST   | `/users`                              | `Bearer static-dev-token`          | `{ username, password }`                   | Register page          |
| POST   | `/users/login`                        | _none_                             | `{ username, password }`                   | Login page             |
| GET    | `/flash-sale-products?active=true`    | `Bearer static-dev-token`          | —                                          | Active deals on Home   |
| GET    | `/flash-sale-products?upcoming=true`  | `Bearer static-dev-token`          | —                                          | Upcoming deals on Home |
| POST   | `/orders`                             | `Bearer <accessToken>`             | `{ flashSaleProductId }`                   | Buy Now button         |
| GET    | `/orders`                             | `Bearer <accessToken>`             | —                                          | My Orders page         |
| GET    | `/orders/:id`                         | `Bearer <accessToken>`             | —                                          | Order detail / Payment |
| PATCH  | `/orders/:id`                         | `Bearer <accessToken>`             | `{ status: "paid" \| "cancelled" }`        | Payment page           |

### Expected response shapes

**Login** — `POST /users/login`

```jsonc
{
  "accessToken": "eyJ…",
  "refreshToken": "eyJ…"
}
```

Snake-case variants (`access_token` / `refresh_token`) are also accepted.

**Flash sale product** — `GET /flash-sale-products`

```jsonc
{
  "id": "1",
  "product_id": "2",
  "product_name": "Charger",
  "stock": 0,
  "price": "10.00",
  "start_date": "2026-06-03T00:00:00.000Z",
  "end_date":   "2026-06-04T00:00:00.000Z",
  "cached_stock": 0,
  "is_active": true,
  "is_upcoming": false
}
```

The UI uses `product_name`, parses `price` (string) as float and renders it as Rupiah, and uses `stock` to gate the **Buy Now** button. Countdown is computed from `end_date` (active) or `start_date` (upcoming).

**Order** — `GET /orders` and `GET /orders/:id`

```jsonc
{
  "id": "4",
  "user_id": "6",
  "product_id": "1",
  "flash_sale_product_id": "4",
  "product_name": "Desk",
  "price": "10.00",
  "status": "created",
  "created_at": "2026-06-03T15:06:49.161Z",
  "updated_at": "2026-06-03T15:06:49.161Z"
}
```

`status` values understood by the UI: `created`, `pending`, `paid`, `cancelled`. Both `created` and `pending` are treated as awaiting-payment.

---

## Docker

A multi-stage `Dockerfile` builds the Vite bundle with Node and serves it with Nginx. Static assets are aggressively cached and the SPA fallback rewrites unknown routes to `index.html`.

### Build & run with Docker

```bash
# Build with the default API URL
docker build -t flashpedia-web .

# Or override the API URL at build time
docker build --build-arg VITE_API_BASE_URL=https://api.example.com -t flashpedia-web .

# Run; container listens on 80, mapped to host 5173
docker run --rm -p 5173:80 flashpedia-web
```

Open **http://localhost:5173**.

### docker compose

```bash
# Build & run (default API: http://localhost:3000)
docker compose up --build

# With a custom API URL
VITE_API_BASE_URL=https://api.example.com docker compose up --build

# Stop
docker compose down
```

### Talking to a backend on the host machine

The browser (not the container) makes the API calls, so `http://localhost:3000` typically Just Works on macOS / Windows. If the API runs in another container, either:

- Expose it on the host (`-p 3000:3000`) and leave `VITE_API_BASE_URL` as-is, or
- Put both services on the same Docker network and build with `VITE_API_BASE_URL=http://<service-name>:3000`.

---

## Production build (without Docker)

```bash
npm run build         # outputs to dist/
npm run preview       # serves the build on http://localhost:4173
```

The contents of `dist/` are pure static files — drop them behind any CDN, S3 + CloudFront, Netlify, Vercel, or the included Nginx image.

---

## Project structure

```
src/
├── api/                       # Axios calls
│   ├── auth.ts                # POST /users, POST /users/login
│   ├── client.ts              # Shared axios instance + Bearer interceptor
│   ├── orders.ts              # POST/GET/PATCH /orders
│   └── products.ts            # GET /flash-sale-products
├── components/
│   ├── CountdownTimer.tsx     # Ticking DD:HH:MM:SS digit boxes
│   ├── FlashSaleProductCard.tsx
│   ├── Layout.tsx             # Sticky header + search + nav
│   └── ProtectedRoute.tsx     # Redirects unauthenticated users to /login
├── context/
│   └── AuthContext.tsx        # isAuthenticated, login, register, logout
├── pages/
│   ├── HomePage.tsx           # Active + upcoming flash sales
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── OrdersPage.tsx         # User's order history
│   ├── OrderDetailPage.tsx    # Single order summary
│   └── PaymentPage.tsx        # Pay or cancel an order
├── types/
│   └── index.ts               # FlashSaleProduct, Order, AuthTokens, …
├── utils/
│   ├── format.ts              # parsePrice, formatRupiah, order helpers
│   └── storage.ts             # localStorage token helpers
├── config.ts                  # API_BASE_URL, STATIC_DEV_TOKEN, storage keys
├── App.tsx                    # Routes
├── main.tsx                   # React entry
└── index.css                  # Design tokens + all component styles
```

---

## Features

- **Account creation** with the dev-token-protected `POST /users` endpoint
- **Login** that stores access + refresh tokens in `localStorage`
- **Active flash sales** grid with a live "ends in" countdown per card and a hero banner showing the soonest-ending deal
- **Upcoming flash sales** grid with a "starts in" countdown
- **Buy Now** flow → creates an order and redirects to the order detail page
- **Payment page** with VA / card / e-wallet method picker that PATCHes the order to `paid`
- **Cancel order** action (PATCH `cancelled`)
- **My Orders** list with status badges, formatted dates, and Rupiah pricing
- **Logout** clears tokens and redirects to login
- **Auto-refresh** of the home page every 30 seconds so stock and countdowns stay current
- **Skeleton loaders**, **empty states**, and a basic **SPA fallback** in the Nginx image

---

## Routes

| Path                          | Auth required | Page                |
| ----------------------------- | ------------- | ------------------- |
| `/login`                      | No            | LoginPage           |
| `/register`                   | No            | RegisterPage        |
| `/`                           | Yes           | HomePage (deals)    |
| `/orders`                     | Yes           | OrdersPage          |
| `/orders/:orderId`            | Yes           | OrderDetailPage     |
| `/orders/:orderId/payment`    | Yes           | PaymentPage         |
| anything else                 | —             | Redirects to `/`    |

---

## Troubleshooting

**`Network Error` on every request** — make sure the backend is reachable at `VITE_API_BASE_URL` and that CORS allows your origin (`http://localhost:5173` for dev, your container host:port in Docker).

**Login succeeds but protected routes redirect to `/login`** — open DevTools → Application → Local Storage and confirm `accessToken` and `refreshToken` are present. Login response must contain `accessToken` / `refreshToken` (or `access_token` / `refresh_token`).

**Stock/price not showing for products** — verify the API returns `product_name`, `price` (string is fine), and `stock` on the flash-sale product objects. The UI is keyed off those exact field names.

**Docker container 404s on a deep link refresh** — the bundled `nginx.conf` already includes the SPA fallback. If you swap in a different reverse proxy, make sure unknown paths fall back to `index.html`.

---

## License

This project is for educational / exercise purposes.
