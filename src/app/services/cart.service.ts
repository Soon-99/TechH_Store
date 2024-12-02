import { Injectable, Inject } from '@angular/core';
import { Product } from '../models/product';
import { CommonModule, DOCUMENT } from '@angular/common';
import { TokenService } from './token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CartService {
  private apiBaseUrl = environment.apiBaseUrl;
  
  constructor(
    private http: HttpClient,
    private tokenService: TokenService

  ) { }

  addToCart(productId: number, quantity: number = 1): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    const body = { productId, quantity };
    return this.http.post<any>(`${this.apiBaseUrl}/client/cartItem/addToCart`, body, { headers });
  }
getCart(): Observable<any> {
  const token = this.tokenService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.get<any>(`${this.apiBaseUrl}/client/cartItem/getList`, { headers });
}
updateCart(productId: number, quantity: number = 1): Observable<any> {
  const token = this.tokenService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  const body = { productId, quantity };
  return this.http.post<any>(`${this.apiBaseUrl}/client/cartItem/update`, body, { headers });
}
deleteProductCart(productId: number): Observable<any> {
  const token = this.tokenService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
console.log(productId)
  return this.http.post<any>(`${this.apiBaseUrl}/client/cartItem/deletedById/${productId}`, { headers });
}
}
