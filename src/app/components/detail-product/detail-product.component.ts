import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CommonModule, registerLocaleData } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import localeFr from '@angular/common/locales/fr';
import { HttpErrorResponse } from '@angular/common/http';

registerLocaleData(localeFr, 'vi');

@Component({
  selector: 'app-detail-product',
  templateUrl: './detail-product.component.html',
  styleUrls: ['./detail-product.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    NgbModule
  ]
})
export class DetailProductComponent implements OnInit {
  product?: Product;
  productId: number = 0;
  quantity: number = 1;
  isPressedAddToCart: boolean = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    if (idParam !== null) {
      this.productId = +idParam;
      this.fetchProductDetails();
    }
  }

  fetchProductDetails() {
    this.productService.getProductsByIds(this.productId).subscribe({
      next: (response: any) => {
        this.product = response?.data;
        console.log("Product details:", this.product);
      },
      error: (error: any) => {
        console.error('Error fetching detail:', error);
      }
    });
  }

  getStars(): string[] {
    const rating = this.product?.rating || 0;
    return Array(5).fill(0).map((_, index) => 
      index < rating ? 'fa fa-star' : 'fa fa-star-o'
    );
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.quantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product.id, this.quantity)
        .subscribe({
          next: (response) => {
            console.log('Added to cart successfully', response);
            alert('Đã thêm sản phẩm thành công!');
          },
          error: (err) => {
            console.error('Failed to add to cart', err);
          }
        });
    }
  }
  buyNow(): void {
    if (this.product) {
      this.cartService.addToCart(this.product.id, this.quantity)
        .subscribe({
          next: (response) => {
            console.log('Added to cart successfully', response);
            this.router.navigate(['/cart']);
          },
          error: (err) => {
            console.error('Failed to add to cart', err);
          }
        });
    }

  }
  onProductClick(productId: any) {
    this.router.navigate(['/review', productId]);
  }

}