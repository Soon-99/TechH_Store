import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { CatagoryResponse } from '../../responses/catagory.response';
import { CategoryService } from '../../services/category.service';
import { ToastrService, ToastNoAnimation } from 'ngx-toastr';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    FormsModule,
  ]
})
export class ShopComponent implements OnInit {
  products: Product[] = [];
  catagory: CatagoryResponse[] = [];
  isLoading: boolean = true;

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 8;
  totalPages: number = 0;
  totalProducts: number = 0;

  searchKeyword: string = '';
  selectedPriceRange: string = '';
  selectedCategory: number | null = null;

  // Price ranges remain the same
  priceRanges = [
    { label: 'Tất cả', min: null, max: null },
    { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
    { label: '1 - 5 triệu', min: 1000000, max: 5000000 },
    { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
    { label: 'Trên 10 triệu', min: 10000000, max: null }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getProducts();
    this.getCatagory();
  }

  getProducts(page: number = 0, pageSize: number = 8): void {
    this.isLoading = true;
    console.log(`Fetching products - Page: ${page}, Page Size: ${pageSize}`);
    
    this.productService.getProducts(page, pageSize).subscribe({
      next: (response: any) => {
        console.log(response)
        this.products = response?.data?.data || [];
        this.totalProducts = response?.data?.total || 0;
        this.totalPages = Math.ceil(this.totalProducts / pageSize);
        this.currentPage = page;
        console.log('Fetched Products:', this.products);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.products = [];
        this.isLoading = false;
      }
    });
  }
  searchAndFilterProducts() {
    const searchParams: any = {
      page: this.currentPage,  // Thay đổi từ pageNumber
      page_size: this.pageSize // Thay đổi từ pageSize
    };
  
    // Các điều kiện lọc khác vẫn giữ nguyên
    if (this.searchKeyword.trim()) {
      searchParams.productName = this.searchKeyword.trim();
    }
  
    if (this.selectedPriceRange) {
      const selectedRange = this.priceRanges.find(range => 
        range.label === this.selectedPriceRange
      );
      
      if (selectedRange) {
        if (selectedRange.min !== null) {
          searchParams.fromSalePrice = selectedRange.min;
        }
        if (selectedRange.max !== null) {
          searchParams.toSalePrice = selectedRange.max;
        }
      }
    }
  
    if (this.selectedCategory) {
      searchParams.categoryId = +this.selectedCategory;
    }
  
    this.isLoading = true;
    console.log('Search Params:', searchParams);
  
    this.productService.searchProducts(searchParams).subscribe({
      next: (response: any) => {
        this.products = response?.data?.data || [];
        this.totalProducts = response?.data?.total || 0;
        this.totalPages = Math.ceil(this.totalProducts / this.pageSize);
        this.isLoading = false;
        console.log('Search Results:', this.products);
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.products = [];
        this.isLoading = false;
      }
    });
  }
  // New pagination methods
  changePage(page: number) {
    this.getProducts(page, 8)
  }
  
  // Thêm phương thức mới để tải sản phẩm
  loadProducts() {
    // Kiểm tra xem có đang áp dụng bộ lọc không
    if (this.searchKeyword || this.selectedPriceRange || this.selectedCategory) {
      this.searchAndFilterProducts();
    } else {
      this.getProducts(this.currentPage, this.pageSize);
    }
  }

  getPaginationRange(): number[] {
    const range: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }

  onSearch() {
    this.currentPage = 0;
    this.searchAndFilterProducts();
  }

  // Existing methods remain the same (getCatagory, onProductClick, addToCart, buyNow)
  getCatagory() {
    this.categoryService.getCatagoryList().subscribe({
      next: (response: any) => {
        this.catagory = response?.data || [];
        console.log(this.catagory);
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.catagory = [];
      }
    });
  }

  onProductClick(productId: any) {
    this.router.navigate(['/products', productId]);
  }

  addToCart(productId: number): void {
    if (this.products) {
      this.cartService.addToCart(productId, 1)
        .subscribe({
          next: (response) => {
            console.log('Added to cart successfully', response);
            this.toastr.success('Đơn hàng đã được thêm thành công!', 'Thành công!', {
              timeOut: 5000, // Thời gian toast hiển thị (5000ms = 5s)
            });
          
          },
          error: (err) => {
            console.error('Failed to add to cart', err);
          }
        });
    }
  }

  buyNow(productId: any): void {
    if (this.products) {
      this.cartService.addToCart(productId, 1)
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
}