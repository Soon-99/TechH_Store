import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RegisterResponse } from '../../responses/user/register.response';
import { ToastrService, ToastNoAnimation } from 'ngx-toastr';
// Update DTO to match API structure
interface RegisterDTO {
  userName: string;
  email: string;
  address: string;
  fullName: string;
  password: string;
  dateOfBirth: string;
  avatar?: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent
  ]
})
export class RegisterComponent {
  @ViewChild('registerForm', { static: false }) registerForm!: NgForm;
  
  userName: string;
  email: string;
  password: string;
  retypePassword: string;
  fullName: string;
  address: string;
  isAccepted: boolean;
  dateOfBirth: string;
  showPassword: boolean = false;

  constructor(
    private router: Router, 
    private userService: UserService,
    private toastr: ToastrService,
    ) {
    this.userName = '';
    this.email = '';
    this.password = '';
    this.retypePassword = '';
    this.fullName = '';
    this.address = '';
    this.isAccepted = false;
    
    // Set default date to 18 years ago
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    this.dateOfBirth = date.toISOString().split('T')[0];
  }

  onUserNameChange() {
    const userNameControl = this.registerForm.form.controls['userName'];
    if (userNameControl) {
      if (this.registerForm.form.touched && this.userName.length < 6) {
        userNameControl.setErrors({ 'minlength': true });
      } else {
        userNameControl.setErrors(null);
      }
    }
  }
  

  register() {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.controls[key];
        if (control.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }
  

    const registerDTO: RegisterDTO = {
        userName: this.userName,
        email: this.email,
        address: this.address,
        fullName: this.fullName,
        password: this.password,
        dateOfBirth: this.dateOfBirth,
    };

    this.userService.register(registerDTO).subscribe({
        next: (response: RegisterResponse) => {
            if (response.status === 'success') {
                // Clear toàn bộ localStorage trước
                localStorage.clear();
                
                // Lưu username mới để dùng cho trang active
                localStorage.setItem('registeredUsername', this.userName);
                
                // Thông báo đăng ký thành công
                this.toastr.success('Đăng ký thành công! Vui lòng kiểm tra email và nhập mã kích hoạt!', 'Thành công!', {
                  timeOut: 5000, // Thời gian toast hiển thị (5000ms = 5s)
                });
                
                // Chuyển hướng đến trang active
                this.router.navigate(['/active']);
            } else {
              this.toastr.error(response.message || 'Đăng ký không thành công', 'Thất  bại!', {
                timeOut: 5000, // Thời gian toast hiển thị (5000ms = 5s)
              });
            }
        },
        error: (error: any) => {
            this.toastr.error(error?.error?.message  || 'Đăng ký không thành công', 'Thất  bại!', {
              timeOut: 5000, // Thời gian toast hiển thị (5000ms = 5s)
            });
        }
    });
}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  checkPasswordsMatch() {
    if (this.password !== this.retypePassword) {
      this.registerForm.form.controls['retypePassword'].setErrors({ 'passwordMismatch': true });
    } else {
      this.registerForm.form.controls['retypePassword'].setErrors(null);
    }
  }

  checkAge() {
    if (this.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(this.dateOfBirth);
      
      // Kiểm tra ngày sinh trong tương lai
      if (birthDate > today) {
        this.registerForm.form.controls['dateOfBirth'].setErrors({ 'futureBirthDate': true });
        return;
      }
  
      // Tính tuổi chính xác
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
  
      if (age < 18) {
        this.registerForm.form.controls['dateOfBirth'].setErrors({ 'invalidAge': true });
      } else {
        this.registerForm.form.controls['dateOfBirth'].setErrors(null);
      }
    }
  }
  validateEmail() {
    const emailControl = this.registerForm.form.controls['email'];
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const validDomains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
  
    if (this.email) {
      const domain = this.email.split('@')[1];
      if (!emailPattern.test(this.email)) {
        emailControl.setErrors({ 'invalidFormat': true });
      } else if (!validDomains.includes(domain)) {
        emailControl.setErrors({ 'invalidDomain': true });
      } else {
        emailControl.setErrors(null);
      }
    }
  }
  
  validatePassword() {
    const passwordControl = this.registerForm.form.controls['password'];
    if (this.password && this.password.length < 5) {
      passwordControl.setErrors({ 'minlength': true });
    } else {
      passwordControl.setErrors(null);
    }
  }
checkAgeValidity(): boolean {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }

  return age < 18;
}
validateUserName() {
  const userNameControl = this.registerForm.form.controls['userName'];
  if (this.userName && this.userName.length < 6) {
    userNameControl.setErrors({ 'minlength': true });
  } else {
    userNameControl.setErrors(null);
  }
}
}