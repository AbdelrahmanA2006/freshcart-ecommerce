# FreshCart — E-commerce App (Angular)

A complete e-commerce front end built with **Angular 20** and **Tailwind CSS v4**, powered by the
[Route e-commerce API](https://documenter.getpostman.com/view/5709532/2s93JqTRWN)
(`https://ecommerce.routemisr.com/api/v1`).

Reference demo: https://freshcart-route.vercel.app/products

---

## Features

### Authentication
- **Register**: name, email, Egyptian phone number, password + confirmation, with validation
- **Login**: returns you to the page you came from
- **Forgot password**: 3 steps (email → 6-digit code → new password), with "resend code"
- **Change password**: stays signed in with the new token
- **Profile**: update name, email and phone; manage saved addresses
- Session stored in `localStorage`; expired tokens are cleared automatically
- Route guards protect private pages and keep signed-in users away from login/register

### Shopping
- **Homepage**: auto-playing hero slider, feature highlights, categories, best sellers, popular brands, top rated
- **Products**: search, sort (price, rating, best selling, newest), filter by category, brand and price range, pagination
- **Product details**: image gallery, quantity picker, stock status, add to cart/wishlist, reviews (read and post), related products
- **Brands** and **brand details** (with brand search)
- **Categories** and **category details** (with subcategory filter)

### Cart, wishlist & orders
- **Cart**: display, add, update quantity, remove item, clear cart, order summary
- **Wishlist**: display, add, remove, move to cart
- **Checkout**: choose a saved address or enter a new one (optionally save it)
- **Payment**: **online** (card via Stripe checkout) or **cash on delivery**
- **Orders**: order history with payment and delivery status, expandable details

### UX
- Responsive from 375px phones to desktop
- Loading skeletons, empty states, toast notifications, clear error messages
- Accessible labels, focus states and keyboard-friendly controls

---

## Tech stack

| | |
|---|---|
| Framework | Angular 20 (standalone components, signals, `rxResource`, lazy-loaded routes) |
| Styling | Tailwind CSS v4 |
| Forms | Angular Reactive Forms with custom validators |
| HTTP | `HttpClient` + functional interceptor (adds the `token` header) |
| Icons | lucide-angular |

---

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) **20.19+ or 22.12+** (LTS recommended)
- npm (comes with Node.js)
- [Git](https://git-scm.com/)

No `.env` file or API key is needed: the Route API is public, and user tokens come from logging in.

### Install & run

```bash
git clone https://github.com/<your-username>/freshcart-ecommerce.git
cd freshcart-ecommerce
npm install
npm start
```

Open **http://localhost:4200**.

### Scripts

| Command | What it does |
|---|---|
| `npm start` | Dev server with live reload on port 4200 |
| `npm run build` | Production build into `dist/freshcart` |
| `npm run watch` | Development build in watch mode |

---

## Running on Windows with VS Code

1. Install **Node.js LTS** from https://nodejs.org (tick "Add to PATH"), **Git** from https://git-scm.com, and **VS Code** from https://code.visualstudio.com.
2. Open VS Code, then press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>, choose **Git: Clone**, paste the repository URL, and pick a folder.
   Or, in a terminal: `git clone https://github.com/<your-username>/freshcart-ecommerce.git`, then `code freshcart-ecommerce`.
3. When VS Code suggests the recommended extensions (Angular Language Service, Tailwind CSS IntelliSense, Prettier), click **Install**.
4. Open the terminal with <kbd>Ctrl</kbd>+<kbd>`</kbd> and run:
   ```powershell
   npm install
   npm start
   ```
5. Open http://localhost:4200 in your browser. Press <kbd>Ctrl</kbd>+<kbd>C</kbd> in the terminal to stop the server.

**Troubleshooting on Windows**
- *"running scripts is disabled on this system"* in PowerShell: run
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or switch the VS Code terminal to **Command Prompt**.
- *Port 4200 already in use*: run `npx ng serve --port 4300`.
- *`node` is not recognized*: restart VS Code after installing Node.js.

---

## Project structure

```
src/app/
├── core/
│   ├── api.ts                    API base URL + error-message helper
│   ├── models.ts                 TypeScript interfaces for API data
│   ├── guards/auth.guard.ts      authGuard / guestGuard
│   ├── interceptors/             adds the `token` header, handles expired sessions
│   └── services/                 auth, catalog, cart, wishlist, orders, toast
├── shared/                       product card/grid, pagination, stars, spinner,
│                                 skeletons, empty state, validators, EGP pipe
├── layout/                       navbar, footer, toasts
├── pages/                        one file per page
│   └── auth/                     login, register, forgot/change password
├── app.routes.ts                 lazy-loaded routes
└── app.config.ts                 router, HttpClient, interceptor
```

## Pages and API endpoints

| Page | Route | Endpoints used |
|---|---|---|
| Login | `/login` | `POST /auth/signin` |
| Register | `/register` | `POST /auth/signup` |
| Forgot password | `/forgot-password` | `POST /auth/forgotPasswords`, `POST /auth/verifyResetCode`, `PUT /auth/resetPassword` |
| Change password | `/change-password` | `PUT /users/changeMyPassword` |
| Profile | `/profile` | `PUT /users/updateMe`, `GET/POST/DELETE /addresses` |
| Home | `/` | `GET /products`, `GET /categories`, `GET /brands` |
| Products | `/products` | `GET /products` (sort, `category[in]`, `brand`, `price[gte]`, `price[lte]`, pagination) |
| Product details | `/products/:id` | `GET /products/:id`, `GET/POST /products/:id/reviews` |
| Brands / details | `/brands`, `/brands/:id` | `GET /brands`, `GET /brands/:id`, `GET /products?brand=` |
| Categories / details | `/categories`, `/categories/:id` | `GET /categories/:id`, `GET /categories/:id/subcategories`, `GET /products?subcategory=` |
| Cart | `/cart` | `GET/POST/DELETE /cart`, `PUT/DELETE /cart/:productId` |
| Wishlist | `/wishlist` | `GET/POST /wishlist`, `DELETE /wishlist/:productId` |
| Checkout | `/checkout` | `POST /orders/:cartId` (cash), `POST /orders/checkout-session/:cartId?url=` (online) |
| Orders | `/allorders` | `GET /orders/user/:userId` |

## Notes
- The API's `keyword` search parameter returns no results, so product search matches titles, brands and categories in the browser.
- After a successful Stripe payment, the API redirects back to `/allorders`.
- Test phone numbers must be valid Egyptian mobiles (e.g. `01012345678`); passwords need 6+ characters with an uppercase letter and a number.
