import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { UserResponse } from '../../responses/user/user.response';

import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';  
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [    
    CommonModule,
    NgbModule,
    RouterModule
  ]
})
export class HeaderComponent implements OnInit{
  userResponse?:UserResponse | null;
  showUserMenu = false;
  isPopoverOpen = false;
  activeNavItem: number = 0;
  total: number = 0;
  cartResponse: CartItemResponse[] =[]

  constructor(
    private userService: UserService,       
    private tokenService: TokenService,    
    private cartService: CartService,
    private router: Router,
  ) {
    
   }
  ngOnInit() {
    this.userResponse = this.userService.getUserResponseFromLocalStorage();    
    this.getCarts();
    console.log(this.userResponse)
  }  

  togglePopover(event: Event): void {
    event.preventDefault();
    this.isPopoverOpen = !this.isPopoverOpen;
  }
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }
  handleItemClick(index: number): void {
    //alert(`Clicked on "${index}"`);
    if(index === 0) {
      debugger
      this.router.navigate(['/user-profile']);                      
    } else if (index === 2) {
      this.userService.removeUserFromLocalStorage();
      this.tokenService.removeToken();
      this.userResponse = this.userService.getUserResponseFromLocalStorage();    
    }
    this.isPopoverOpen = false; // Close the popover after clicking an item    
  }

  logout() {
    this.userService.removeUserFromLocalStorage();
    this.router.navigate(['/login']);
  }
  navigateToLogin() {
    this.showUserMenu = false;
    this.router.navigate(['/login']);
  }
  setActiveNavItem(index: number) {    
    this.activeNavItem = index;
  }  
  closeUserMenu() {
    this.showUserMenu = false;
  }
  getCarts() {
    this.cartService.getCart().subscribe({
      next: (response: any) => {
        this.cartResponse = response?.data?.data || [];
        this.total = this.cartResponse.reduce((sum: number, item: any) => sum + item.quantity, 0);

      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }
    });
  }
  
  
}
