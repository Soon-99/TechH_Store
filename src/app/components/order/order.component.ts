import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { FormsModule } from '@angular/forms';

interface Order {
  id: number;
  userId: number;
  userName: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdDate: number;
  totalAmount: number;
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryInfo: string;
}

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    FormsModule,
  ]
})
export class OrderComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchKeyword: string = '';
  isLoading: boolean = true;
  error: string | null = null;

  // Pagination
  currentPage: number = 0;
  totalPages: number = 1;
  itemsPerPage: number = 10;

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.isLoading = true;
    this.orderService.getOrder(this.searchKeyword, this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (response: any) => {
          this.orders = response.data.data;
          this.filteredOrders = [...this.orders];
          console.log(this.orders)
          // Set pagination details
          const meta = response.data.meta;
          this.currentPage = meta.currentPage;
          this.totalPages = meta.totalPage;
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching orders:', error);
          this.error = 'Unable to load orders';
          this.isLoading = false;
        }
      });
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(order => 
      order.userName.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
      order.id.toString().includes(this.searchKeyword) ||
      order.paymentMethod.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
      order.status.toLowerCase().includes(this.searchKeyword.toLowerCase())
    );
  }

  viewOrderDetails(orderId: number): void {
    // Navigate to order details page
    console.log('View order details for order ID:', orderId);
  }

  cancelOrder(orderId: number): void {
    if (confirm(`Are you sure you want to cancel order ${orderId}?`)) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          alert('Order cancelled successfully');
          this.fetchOrders(); // Refresh the orders list
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          alert('Failed to cancel order');
        }
      });
    }
  }

  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchOrders();
    }
  }

  getPageArray(): number[] {
    const pageArray = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pageArray.push(i);
    }
    return pageArray;
  }

  paymentMethods = [
    { value: 'COD', label: 'Thanh Toán Khi Giao Hàng' },
    { value: 'CARD', label: 'Thanh Toán Bằng Thẻ' },
    { value: 'PAY_LATER', label: 'Trả Sau' }
  ];

  getPaymentMethodLabel(methodValue: string): string {
    const method = this.paymentMethods.find(m => m.value === methodValue);
    return method ? method.label : 'Không xác định';
  }

  onOrderClick(orderId: any) {
    this.router.navigate([`/orders/${orderId}`]);
  }
}