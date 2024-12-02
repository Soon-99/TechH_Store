import { Component, OnInit, Inject } from '@angular/core';
import { Product } from '../../../models/product';
import { Category } from '../../../models/category';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CategoryService } from '../../../services/category.service';
import { ProductService } from '../../../services/product.service';
import { TokenService } from '../../../services/token.service';

import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    FormsModule
  ]
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  isLoading: boolean = true;

 
  constructor(
    private productService: ProductService,
    private router: Router
  ) {}
 
  ngOnInit() {
    this.getProducts();
  }
  getProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        this.products = response?.data?.data || [];
      },
      error: (error) => {
        console.log("Error")
        console.error('Error fetching products:', error);
        this.products = [];
        this.isLoading = false;
      },
     
    });
  }

  onProductClick(productId: any) {
    this.router.navigate(['/products', productId]);
  }

 }