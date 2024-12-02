import { Component, ViewChild } from '@angular/core';
import { LoginDTO } from '../../dtos/user/login.dto';
import { UserService } from '../../services/user.service';
import { TokenService } from '../../services/token.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LoginResponse } from '../../responses/user/login.response';
import { CartService } from '../../services/cart.service';

import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    FormsModule
  ]
})
export class LoginComponent {
  @ViewChild('loginForm') loginForm!: NgForm;

  userName: string = '';
  password: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = true;
  isLoading: boolean = false;
  errorMessage: string = '';

  onPhoneNumberChange() {
    console.log(`Phone typed: ${this.userName}`);
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private tokenService: TokenService,
    private cartService: CartService,
    private toastr: ToastrService 
  ) { }

  createAccount() {
    this.router.navigate(['/register']); 
  }

  navigateBasedOnRole(role: string) {
    switch (role) {

      case "ADMIN":
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  login() {
    const loginDTO: LoginDTO = {
      userName: this.userName,
      password: this.password
    };
  
    this.isLoading = true; // Show loading state
    this.errorMessage = ''; // Clear previous error messages
  
    this.userService.login(loginDTO).subscribe({
      next: (response: LoginResponse) => {
        console.log('Login successful:', response);
        const { token, user } = response.data;
        this.tokenService.setToken(token);
        this.userService.saveUserResponseToLocalStorage(user);
        
        this.navigateBasedOnRole(user.role);
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = error.error.message || 'Login failed';
        this.isLoading = false;
        this.toastr.error('Tài khoản hoặc mật khẩu không đúng.', 'Lỗi', {
          timeOut: 5000,
        });
      }
    });
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}