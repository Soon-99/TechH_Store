import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { OrderDTO } from '../../dtos/order/order.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderResponse } from '../../responses/order/order.response';
import { environment } from '../../../environments/environment';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
interface OrderDetail {
  id: number;
  userId: number;
  userName: string;
  status: string;
  createdDate: number;
  totalAmount: number;
  paymentMethod: string;
  items: OrderItem[];
  trackingStatus?: string;
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
  selector: 'app-order-detail',
  templateUrl: './order.detail.component.html',
  styleUrls: ['./order.detail.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule
  ]
})
export class OrderDetailComponent implements OnInit {  
  orderItem : OrderItem[] = [];
  order: OrderDetail | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const orderId = params.get('id');
      if (orderId) {
        this.fetchOrderDetails(+orderId);
      }
    });
  }

  fetchOrderDetails(orderId: number): void {
    this.isLoading = true;
    this.orderService.getOrderDetails(orderId).subscribe({
      next: (response: any) => {
        this.orderItem = response?.data || [];
        console.log(this.orderItem)
      },
      error: (error) => {
        this.orderItem = [];
        this.isLoading = false;
      },
     
    });
  }

  private mapToOrderDetail(apiResponse: any): OrderDetail {
    return {
      id: apiResponse.id,
      userId: apiResponse.userId,
      userName: apiResponse.userName,
      status: apiResponse.status,
      createdDate: apiResponse.createdDate,
      totalAmount: this.calculateTotalAmount(apiResponse.orderDetails || []),
      paymentMethod: apiResponse.paymentMethod,
      trackingStatus: this.determineTrackingStatus(apiResponse.status),
      items: this.mapOrderItems(apiResponse.orderDetails || [])
    };
  }
  
  private mapOrderItems(orderDetails: any[] | undefined): OrderItem[] {
    if (!orderDetails || orderDetails.length === 0) {
      return [];
    }
    return orderDetails.map(detail => ({
      id: detail.id,
      productName: detail.productName,
      productImage: detail.productImage,
      quantity: detail.quantity,
      price: detail.price,
      productId: detail.productId
    }));
  }
  private calculateTotalAmount(orderDetails: any[] | undefined): number {
    if (!orderDetails || orderDetails.length === 0) {
      return 0;
    }
    return orderDetails.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  private determineTrackingStatus(status: string): string {
    switch(status) {
      case 'PENDING': return 'PLACED';
      case 'PROCESSING': return 'SHIPPED';
      case 'COMPLETED': return 'DELIVERED';
      default: return 'PLACED';
    }
  }

  trackOrder(): void {
    console.log('Tracking order', this.order?.id);
  }

  cancelOrder(): void {
    if (!this.order) return;

    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(this.order.id).subscribe({
        next: () => {
          alert('Đơn hàng đã được huỷ');
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          alert('Failed to cancel order');
        }
      });
    }
  }

  prePay(): void {
    console.log('Pre-pay for order', this.order?.id);
  }
  goBackToOrders() {
    this.router.navigate(['/orders']);
  }
}