import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product';
import { UpdateProductDTO } from '../dtos/product/update.product.dto';
import { InsertProductDTO } from '../dtos/product/insert.product.dto';
import { TokenService } from './token.service';
import { ProductSearch } from '../dtos/product/search.product.dto';
import { ProductRequest } from '../responses/product.request';
import { ProductResponse } from '../responses/product.response';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiBaseUrl = environment.apiBaseUrl;
  
  constructor(
    private http: HttpClient,
    private tokenService: TokenService

  ) { }

  getProducts(page: number = 0, pageSize: number = 8): Observable<any> {
    // Create an object to hold query parameters
    const params: { [key: string]: string } = {
      'page': page.toString(),
      'page_size': pageSize.toString()
    };
  
    // Get the authentication token
    const token = this.tokenService.getToken();
  
    // Create headers with authorization
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    // Make the HTTP GET request with params and headers
    return this.http.get(`${this.apiBaseUrl}/products`, {
      params,
      headers
    });
  }
  getProductsByIds(productId: number): Observable<Product[]> {
    const params = new HttpParams().append("id",productId);
    return this.http.get<Product[]>(`${this.apiBaseUrl}/client/product/findById`, { params });
  }
  searchProducts(searchParams: ProductSearch): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    return this.http.post<any>(
      `${this.apiBaseUrl}/client/product/search`, 
      searchParams, 
      { headers }
    );
  }
  deleteProducts(id : number): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    return this.http.post<any>(
      `${this.apiBaseUrl}/admin/product/deleteById/${id}`, 
      { headers }
    );
  }
  createProduct(product : ProductRequest): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    return this.http.post<ProductRequest>(
      `${this.apiBaseUrl}/admin/product/create`, product,
      { headers }
    );
  }
  updateProduct(product : ProductResponse): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    return this.http.post<ProductRequest>(
      `${this.apiBaseUrl}/admin/product/update`, product,
      { headers }
    );
  }
  uploadImage(file: File): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    const formData = new FormData();
    formData.append('image', file);
  
    return this.http.post<any>(
      `${this.apiBaseUrl}/upload/image`, 
      formData, 
      { 
        headers: headers 
      }
    );
  }
  voteCreate(productId:number,rating:number,description:string,image:string): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
  
    return this.http.post<any>(
      `${this.apiBaseUrl}/client/vote/create`, 
      {productId,rating,description,image}, 
      { 
        headers: headers 
      }
    );
  }
  voteReview(id:number): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
  
    return this.http.get<any>(
      `${this.apiBaseUrl}/client/vote/getByProduct/${id}`, 

      { 
        headers: headers 
      }
    );
  }
}
//update.category.admin.component.html