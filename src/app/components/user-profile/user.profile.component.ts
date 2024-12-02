import { Component, OnInit } from '@angular/core';
import { 
  FormBuilder, 
  FormGroup, 
  Validators,
  ValidationErrors, 
  ValidatorFn, 
  AbstractControl
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TokenService } from '../../services/token.service';
import { UserResponse } from '../../responses/user/user.response';

import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'user-profile',
  templateUrl: './user.profile.component.html',
  styleUrls: ['./user.profile.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,   
  ],
})
export class UserProfileComponent implements OnInit {
  userResponse?: UserResponse;
  passwordForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {        
    this.passwordForm = this.formBuilder.group({
      oldPass: ['', [Validators.required, Validators.minLength(3)]],           
      password: ['', [Validators.required, Validators.minLength(3)]], 
      retype_password: ['', [Validators.required, Validators.minLength(3)]],      
    }, {
      validators: this.passwordMatchValidator
    });
  }
  
  ngOnInit(): void {  
    const userResponse = this.userService.getUserResponseFromLocalStorage();
    if (userResponse && userResponse.id) {
      this.userService.getUserDetail(userResponse.id).subscribe({
        next: (response: any) => {
          this.userResponse = response?.data;
        },
        error: (error: any) => {
          this.toastr.error( 'Có lỗi xảy ra');
        }
      });
    } else {
      this.toastr.error('Không tìm thấy thông tin người dùng');
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get('password')?.value;
      const retypedPassword = formGroup.get('retype_password')?.value;
      if (password !== retypedPassword) {
        return { passwordMismatch: true };
      }
      return null;
    };
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      const oldPassword = this.passwordForm.get('oldPass')?.value;
      const newPassword = this.passwordForm.get('password')?.value;
      this.userService.changePassword(oldPassword, newPassword).subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.errorCode === 0) {
            this.toastr.success('Đổi mật khẩu thành công', 'Thành công!', {
              timeOut: 5000, // Thời gian toast hiển thị (5000ms = 5s)
            });
            setTimeout(() => {
              this.userService.removeUserFromLocalStorage();
              this.router.navigate(['/login']);
            }, 3000);
          } else {
            this.toastr.error('Đổi mật khẩu không thành công');
          }
        },
        error: (error: any) => {
          this.toastr.error( 'Có lỗi xảy ra khi đổi mật khẩu');
        }
      });
    } else {
      Object.keys(this.passwordForm.controls).forEach(key => {
        const control = this.passwordForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });

      if (this.passwordForm.hasError('passwordMismatch')) {        
        this.toastr.error('Mật khẩu và mật khẩu gõ lại chưa chính xác');
      }
    }
  }
}