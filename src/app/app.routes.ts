import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', title: 'FreshCart | Fresh groceries & more', loadComponent: () => import('./pages/home').then((m) => m.Home) },
  { path: 'products', title: 'Products | FreshCart', loadComponent: () => import('./pages/products').then((m) => m.Products) },
  { path: 'products/:id', title: 'Product | FreshCart', loadComponent: () => import('./pages/product-details').then((m) => m.ProductDetails) },
  { path: 'categories', title: 'Categories | FreshCart', loadComponent: () => import('./pages/categories').then((m) => m.Categories) },
  { path: 'categories/:id', title: 'Category | FreshCart', loadComponent: () => import('./pages/category-details').then((m) => m.CategoryDetails) },
  { path: 'brands', title: 'Brands | FreshCart', loadComponent: () => import('./pages/brands').then((m) => m.Brands) },
  { path: 'brands/:id', title: 'Brand | FreshCart', loadComponent: () => import('./pages/brand-details').then((m) => m.BrandDetails) },

  { path: 'cart', title: 'Cart | FreshCart', canActivate: [authGuard], loadComponent: () => import('./pages/cart').then((m) => m.CartPage) },
  { path: 'wishlist', title: 'Wishlist | FreshCart', canActivate: [authGuard], loadComponent: () => import('./pages/wishlist').then((m) => m.WishlistPage) },
  { path: 'checkout', title: 'Checkout | FreshCart', canActivate: [authGuard], loadComponent: () => import('./pages/checkout').then((m) => m.Checkout) },
  { path: 'allorders', title: 'My orders | FreshCart', canActivate: [authGuard], loadComponent: () => import('./pages/orders').then((m) => m.Orders) },
  { path: 'profile', title: 'My profile | FreshCart', canActivate: [authGuard], loadComponent: () => import('./pages/profile').then((m) => m.Profile) },
  { path: 'change-password', title: 'Change password | FreshCart', canActivate: [authGuard], loadComponent: () => import('./pages/auth/change-password').then((m) => m.ChangePassword) },

  { path: 'login', title: 'Sign in | FreshCart', canActivate: [guestGuard], loadComponent: () => import('./pages/auth/login').then((m) => m.Login) },
  { path: 'register', title: 'Create account | FreshCart', canActivate: [guestGuard], loadComponent: () => import('./pages/auth/register').then((m) => m.Register) },
  { path: 'forgot-password', title: 'Reset password | FreshCart', canActivate: [guestGuard], loadComponent: () => import('./pages/auth/forgot-password').then((m) => m.ForgotPassword) },

  { path: '**', title: 'Page not found | FreshCart', loadComponent: () => import('./pages/not-found').then((m) => m.NotFound) },
];
