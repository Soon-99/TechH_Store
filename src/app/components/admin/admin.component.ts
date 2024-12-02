import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { UserResponse } from '../../responses/user/user.response';
import { TokenService } from '../../services/token.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],  
  standalone: true,
  imports: [       
    CommonModule,    
    RouterModule
  ]
})
export class AdminComponent implements OnInit {
  userResponse?: UserResponse | null;

  constructor(
    private userService: UserService,       
    private tokenService: TokenService,    
    private router: Router,
  ) {}

  ngOnInit() {
    this.userResponse = this.userService.getUserResponseFromLocalStorage();  
    console.log(this.userResponse)  
    
    // Default router
    if (this.router.url === '/admin') {
      this.router.navigate(['/admin/orders']);
    }
  }  

  logout() {
    this.userService.removeUserFromLocalStorage();
    this.router.navigate(['/']);
  }
}