import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../models/category';
import { UpdateCategoryDTO } from '../dtos/category/update.category.dto';
import { InsertCategoryDTO } from '../dtos/category/insert.category.dto';
import { CatagoryRequest, CatagoryResponse } from '../responses/catagory.response';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiBaseUrl = environment.apiBaseUrl;
  constructor(
    private http: HttpClient,
    private tokenService: TokenService

  ) { }

  getCatagoryList(): Observable<CatagoryResponse[]> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<CatagoryResponse[]>(`${this.apiBaseUrl}/categories`, { headers });
  }
  getCategories(page: number, limit: number):Observable<Category[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());     
      return this.http.get<Category[]>(`${environment.apiBaseUrl}/categories`, { params });           
  }

  adminGetAllCategory(): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<any>(`${this.apiBaseUrl}/admin/categories`,{headers});
  }
  adminGetDetailCategory(id: number): Observable<Category> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<Category>(`${this.apiBaseUrl}/admin/categories/findById/${id}`,{headers});
  }
  adminUpdateCategory(categories:CatagoryRequest): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put<any>(`${this.apiBaseUrl}/admin/category/update`,categories,{headers});
  }
adminCreateCategory(categories:CatagoryRequest): Observable<any> {
  const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${this.apiBaseUrl}/admin/category/create`,categories,{headers});
}
adminDeleteCategory(id: number): Observable<any> {
  const token = this.tokenService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  return this.http.get<any>(`${this.apiBaseUrl}/admin/category/deleteById/${id}`,{headers});
}


 
}
