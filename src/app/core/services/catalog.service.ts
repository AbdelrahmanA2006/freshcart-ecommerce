import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, shareReplay } from 'rxjs';
import { API } from '../api';
import { Brand, Category, ListResponse, Product, Review, SubCategory } from '../models';

export interface ProductQuery {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);

  // Categories and brands rarely change, so cache them for the session.
  private categories$ = this.http.get<ListResponse<Category>>(`${API}/categories`).pipe(map((r) => r.data), shareReplay(1));
  private brands$ = this.http.get<ListResponse<Brand>>(`${API}/brands`, { params: { limit: 100 } }).pipe(map((r) => r.data), shareReplay(1));

  getProducts(q: ProductQuery = {}) {
    let params = new HttpParams();
    if (q.page) params = params.set('page', q.page);
    if (q.limit) params = params.set('limit', q.limit);
    if (q.sort) params = params.set('sort', q.sort);
    if (q.category) params = params.set('category[in]', q.category);
    if (q.subcategory) params = params.set('subcategory', q.subcategory);
    if (q.brand) params = params.set('brand', q.brand);
    if (q.minPrice != null) params = params.set('price[gte]', q.minPrice);
    if (q.maxPrice != null) params = params.set('price[lte]', q.maxPrice);
    return this.http.get<ListResponse<Product>>(`${API}/products`, { params });
  }

  getProduct(id: string) {
    return this.http.get<{ data: Product }>(`${API}/products/${id}`).pipe(map((r) => r.data));
  }

  getReviews(productId: string) {
    return this.http.get<ListResponse<Review>>(`${API}/products/${productId}/reviews`).pipe(map((r) => r.data));
  }

  addReview(productId: string, review: string, rating: number) {
    return this.http.post<{ data: Review }>(`${API}/products/${productId}/reviews`, { review, rating });
  }

  getCategories() { return this.categories$; }

  getCategory(id: string) {
    return this.http.get<{ data: Category }>(`${API}/categories/${id}`).pipe(map((r) => r.data));
  }

  getSubcategories(categoryId: string) {
    return this.http.get<ListResponse<SubCategory>>(`${API}/categories/${categoryId}/subcategories`).pipe(map((r) => r.data));
  }

  getAllSubcategories() {
    return this.http.get<ListResponse<SubCategory>>(`${API}/subcategories`, { params: { limit: 100 } }).pipe(map((r) => r.data));
  }

  getBrands() { return this.brands$; }

  getBrand(id: string) {
    return this.http.get<{ data: Brand }>(`${API}/brands/${id}`).pipe(map((r) => r.data));
  }
}
