import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { API } from '../api';
import { Address, Order, ShippingAddress } from '../models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);

  createCashOrder(cartId: string, shippingAddress: ShippingAddress) {
    return this.http.post<{ status: string; data: Order }>(`${API}/orders/${cartId}`, { shippingAddress });
  }

  /** Returns a Stripe checkout URL; Stripe redirects back to `${returnUrl}/allorders` on success. */
  createCheckoutSession(cartId: string, shippingAddress: ShippingAddress, returnUrl: string) {
    return this.http
      .post<{ status: string; session: { url: string } }>(`${API}/orders/checkout-session/${cartId}`, { shippingAddress }, { params: { url: returnUrl } })
      .pipe(map((r) => r.session.url));
  }

  getUserOrders(userId: string) {
    return this.http.get<Order[]>(`${API}/orders/user/${userId}`);
  }

  getAddresses() {
    return this.http.get<{ data: Address[] }>(`${API}/addresses`).pipe(map((r) => r.data));
  }

  addAddress(address: Omit<Address, '_id'>) {
    return this.http.post<{ data: Address[] }>(`${API}/addresses`, address).pipe(map((r) => r.data));
  }

  removeAddress(id: string) {
    return this.http.delete<{ data: Address[] }>(`${API}/addresses/${id}`).pipe(map((r) => r.data));
  }
}
