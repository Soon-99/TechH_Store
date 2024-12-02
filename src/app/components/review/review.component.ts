import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order';

interface Review {
  productId?: number;
  rating: number;
  description: string;
  image?: string;
}
interface OrderItem {
  id: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  productId: number;
}
@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    HttpClientModule
  ]
})
export class ReviewComponent implements OnInit {
  // Danh sách reviews
   productMap: { [productId: number]: any } = {};
  reviews: any[] = [];
  productIds : number[]=[]
  // Biến điều khiển modal
  showCreateReviewModal: boolean = false;
  
  // Biến lưu productId
  productId: number = 0;
  orderItem : OrderItem[] = [];
  // Form review mới
  newReview: Review = {
    rating: 0,
    description: ''
  };
  stars: number[] = [1, 2, 3, 4, 5];
  selectedValue: number = 0;
  isMouseover = true;
  orders: Order[] = [];
userName : string = '';
  // Để upload ảnh
  selectedFile: File | null = null;
  selectedImageFileName: string = '';

  constructor(
    private route: ActivatedRoute,
    private userService :UserService,
    private orderService :OrderService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    // Lấy ID sản phẩm từ route
    this.route.paramMap.subscribe(params => {
      this.productId = Number(params.get('id'));
      if (this.productId) {
        // Tải danh sách review
        this.loadReviews();
      }
    });
    this.userName = this.userService.getUserResponseFromLocalStorage()?.fullName ?? '';
console.log(this.userName)
  }

  // Mở modal tạo review
  openCreateReviewModal(): void {
    this.showCreateReviewModal = true;
    // Reset form khi mở modal
    this.newReview = {
      rating: 0,
      description: ''
    };
    this.selectedFile = null;
    this.selectedImageFileName = '';
  }

  // Xử lý upload ảnh
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedImageFileName = file.name;
    }
  }

  // Tải danh sách review
  loadReviews(): void {
    this.productService.voteReview(this.productId).subscribe({
      next: (response) => {
        this.reviews = response.data || [];
        console.log(this.reviews)
      },
      error: (error) => {
        console.error('Lỗi tải review', error);
      }
    });
  }

  // Gửi review mới
  createReview(): void {
    // Validate
    if (this.newReview.rating === 0) {
      alert('Vui lòng chọn đánh giá sao');
      return;
    }

    // Gán productId vào review
    this.newReview.productId = this.productId;

    // Nếu có ảnh, upload trước
    if (this.selectedFile) {
      this.productService.uploadImage(this.selectedFile).subscribe({
        next: (imageUrl) => {
          this.newReview.image = imageUrl.data.secure_url;
          this.submitReview();
        },
        error: (error) => {
          console.error('Lỗi upload ảnh', error);
        }
      });
    } else {
      this.submitReview();
    }
  }

  // Submit review sau khi upload ảnh (nếu có)
  private submitReview(): void {
    this.productService.voteCreate(
      this.productId, 
      this.newReview.rating, 
      this.newReview.description, 
      this.newReview.image || ''
    ).subscribe({
      next: (response) => {
        // Làm mới danh sách review
        this.loadReviews();
        
        // Đóng modal
        this.showCreateReviewModal = false;
      },
      error: (error) => {
        console.error('Lỗi tạo review', error);
      }
    });
  }

  countStar(star: number) {
    this.isMouseover = false;
    this.selectedValue = star;
    this.newReview.rating = star; // Add this line to set the rating in the form
  }
  
   addClass(star: number) {
    if (this.isMouseover) {
      this.selectedValue = star;
    }
   }
  
   removeClass() {
     if (this.isMouseover) {
        this.selectedValue = 0;
     }
}
}
