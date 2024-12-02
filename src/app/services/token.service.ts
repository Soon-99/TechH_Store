import { Inject, Injectable } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
    private readonly TOKEN_KEY = 'token';
    private jwtHelperService = new JwtHelperService();
    localStorage?:Storage;

    constructor(@Inject(DOCUMENT) private document: Document){
        this.localStorage = document.defaultView?.localStorage;
    }
    //getter/setter
    getToken():string {
        return this.localStorage?.getItem(this.TOKEN_KEY) ?? '';
    }
    setToken(token: string): void {        
        this.localStorage?.setItem(this.TOKEN_KEY, token);             
    }
getUserName(): string {
    let token = this.getToken();
    if (!token) {
        return '';  // Nếu không có token, trả về chuỗi rỗng.
    }

    let userObject = this.jwtHelperService.decodeToken(token);
    
    // Kiểm tra nếu thuộc tính 'sub' tồn tại và có giá trị hợp lệ.
    if ('sub' in userObject && userObject['sub']) {
        return userObject['sub'].toString();  // Trả về giá trị của 'sub' dưới dạng chuỗi.
    } else {
        return '';  // Nếu không có giá trị hợp lệ cho 'sub', trả về chuỗi rỗng.
    }
}
    
      
    removeToken(): void {
        this.localStorage?.removeItem(this.TOKEN_KEY);
    }              
    isTokenExpired(): boolean { 
        const token = this.getToken();
    
        try {
            // Additional detailed logging
            const decodedToken = this.jwtHelperService.decodeToken(token);
    
            if (!token) {
                return true;
            }
    
            const isExpired = this.jwtHelperService.isTokenExpired(token);
    
            return isExpired;
        } catch (error) {
            return true; // Treat invalid tokens as expired
        }
    }
}
