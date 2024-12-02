import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterDTO } from '../dtos/user/register.dto';
import { LoginDTO } from '../dtos/user/login.dto';
import { environment } from '../../environments/environment';
import { HttpUtilService } from './http.util.service';
import { UserResponse } from '../responses/user/user.response';
import { UpdateUserDTO } from '../dtos/user/update.user.dto';
import { DOCUMENT } from '@angular/common';
import { ActiveAccountDTO } from '../dtos/user/active.dto';
import { ActiveAccountResponse } from '../responses/user/active.response';
import { LoginResponse } from '../responses/user/login.response';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiRegister = `${environment.apiBaseUrl}/auth/register`;
  private apiLogin = `${environment.apiBaseUrl}/auth/login`;
  private apiUserDetail = `${environment.apiBaseUrl}/auth/active`;
  localStorage?:Storage;

  private apiConfig = {
    headers: this.httpUtilService.createHeaders(),
  }

  constructor(
    private http: HttpClient,
    private httpUtilService: HttpUtilService,
    private tokenService: TokenService,
    @Inject(DOCUMENT) private document: Document
  ) { 
    this.localStorage = document.defaultView?.localStorage;
  }

  register(registerDTO: RegisterDTO):Observable<any> {
    return this.http.post(this.apiRegister, registerDTO, this.apiConfig);
  }

  login(loginDTO: LoginDTO): Observable<LoginResponse> {    
    return this.http.post<LoginResponse>(this.apiLogin, loginDTO, this.apiConfig);
  }
  activeAccount(activeAccountDTO: ActiveAccountDTO): Observable<ActiveAccountResponse> {
    return this.http.post<ActiveAccountResponse>(this.apiUserDetail, activeAccountDTO, this.apiConfig);
  }
  getUserDetail(id: number) {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get(`${environment.apiBaseUrl}/user/findById/${id}`,{headers})

  }
  updateUserDetail(token: string, updateUserDTO: UpdateUserDTO) {
    debugger
    let userResponse = this.getUserResponseFromLocalStorage();        
    return this.http.put(`${this.apiUserDetail}/${userResponse?.id}`,updateUserDTO,{
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    })
  }
  saveUserResponseToLocalStorage(userResponse?: UserResponse) {
    try {
      debugger
      if(userResponse == null || !userResponse) {
        return;
      }
      // Convert the userResponse object to a JSON string
      const userResponseJSON = JSON.stringify(userResponse);  
      console.log(userResponseJSON)
      // Save the JSON string to local storage with a key (e.g., "userResponse")
      this.localStorage?.setItem('user',userResponseJSON)
      console.log('User response saved to local storage.');
    } catch (error) {
      console.error('Error saving user response to local storage:', error);
    }
  }
  getUserResponseFromLocalStorage():UserResponse | null {
    try {
      // Retrieve the JSON string from local storage using the key
      const userResponseJSON = this.localStorage?.getItem('user'); 
      if(userResponseJSON == null || userResponseJSON == undefined) {
        return null;
      }
      // Parse the JSON string back to an object
      const userResponse = JSON.parse(userResponseJSON!);  
      console.log('User response retrieved from local storage.');
      return userResponse;
    } catch (error) {
      console.error('Error retrieving user response from local storage:', error);
      return null; // Return null or handle the error as needed
    }
  }
  removeUserFromLocalStorage():void {
    try {
      // Remove the user data from local storage using the key
      localStorage.clear();
      console.log('User data removed from local storage.');
    } catch (error) {
      console.error('Error removing user data from local storage:', error);
      // Handle the error as needed
    }
  }
  
  changePassword(oldPassword : string,newPassword :string){
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${environment.apiBaseUrl}/user/changePassword`,{oldPassword,newPassword},{headers})
  }
}
