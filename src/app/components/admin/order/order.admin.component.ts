import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Order } from '../../../models/order';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-order-admin',
  templateUrl: './order.admin.component.html',
  styleUrls: ['./order.admin.component.scss'],
  standalone: true,
  imports: [   
    CommonModule,
    FormsModule,
  ]
})
export class OrderAdminComponent implements OnInit {  
  // Order management properties
  orders: Order[] = []; 
  isLoading: boolean = false;
  error: string | null = null;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  visiblePages: number[] = [];
  totalOrders: number = 0;
  
  // Filtering
  keyword: string = "";
  status: string = "";

  // Order statuses aligned with existing interface
  orderStatuses = [
    { value: '', label: 'All Status' },
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'CONFIRMED', label: 'Xác nhận' },
    { value: 'DELIVERED', label: 'Đang giao' },
    { value: 'SHIPPED', label: 'Đã giao' },
    { value: 'CANCELLED', label: 'Huỷ Bỏ' }
  ];

  constructor(private orderService: OrderService) {}
    
  ngOnInit() {      
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.error = null;

    this.orderService.adminGetAllOrders(this.currentPage - 1, this.itemsPerPage, this.status).subscribe({
      next: (response: any) => {
        this.orders = response.data.data || [];
        this.totalOrders = response?.meta.total || 0;
        this.totalPages = Math.ceil(this.totalOrders / this.itemsPerPage);
        console.log(this.totalPages)
        this.calculateVisiblePages();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
        this.error = 'Failed to load orders. Please try again.';
        this.orders = [];
        this.isLoading = false;
      }
    });
  }

  // Confirm Order Action (from PENDING to CONFIRMED)
  confirmOrder(order: Order) {
    if (!order.id) {
      this.error = 'Invalid order ID';
      return;
    }
  
    if (confirm(`Xác nhận đơn hàng ${order.id}?`)) {
      this.orderService.adminConfirmrOrders(order.id).subscribe({
        next: (response) => {
          if (response.status === 200) {
            alert('Đơn hàng đã được xác nhận');
            this.loadOrders();
          } else {
            this.error = response.message || 'Failed to confirm order';
          } 
        },
        error: (error) => {
          console.error('Error confirming order:', error);
          this.error = error.error?.message || 'Failed to confirm order';
        }
      });
    }
  }
  
  // Deliver Order Action (from CONFIRMED to DELIVERED)
  deliverOrder(order: Order) {
    if (!order.id) {
      this.error = 'Invalid order ID';
      return;
    }
  
    if (confirm(`Chuyển đơn hàng ${order.id} sang trạng thái đang giao?`)) {
      this.orderService.adminDeliverdOrder(order.id).subscribe({
        next: (response) => {
          if (response.status === 200) {
            alert('Đơn hàng đang được giao');
            this.loadOrders();
          } else {
            this.error = response.message || 'Failed to mark order as delivered';
          }
        },
        error: (error) => {
          console.error('Error delivering order:', error);
          this.error = error.error?.message || 'Failed to mark order as delivered';
        }
      });
    }
  }
  
  // Ship Order Action (from DELIVERED to SHIPPED)
  shipOrder(order: Order) {
    if (!order.id) {
      this.error = 'Invalid order ID';
      return;
    }
  
    if (confirm(`Hoàn tất đơn hàng ${order.id}?`)) {
      this.orderService.adminShippingOrders(order.id).subscribe({
        next: (response) => {
          if (response.status === 200) {
            alert('Đơn hàng đã được giao thành công');
            this.loadOrders();
          } else {
            this.error = response.message || 'Failed to mark order as shipped';
          }
        },
        error: (error) => {
          console.error('Error shipping order:', error);
          this.error = error.error?.message || 'Failed to mark order as shipped';
        }
      });
    }
  }

  // Cancel Order Action (for any status except SHIPPED and CANCELLED)
  cancelOrder(order: Order) {
    if (!order.id) {
      this.error = 'Invalid order ID';
      return;
    }

    if (confirm(`Tiến hành huỷ đơn hàng ${order.id}?`)) {
      this.orderService.adminCancerOrders(order.id).subscribe({
        next: (response) => {
          if (response.status === 200) {
            alert('Đơn hàng đã huỷ thành công');
            this.loadOrders();
          } else {
            this.error = response.message || 'Failed to cancel order';
          }
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          this.error = error.error?.message || 'Failed to cancel order';
        }
      });
    }
  }



  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }
  getOrderStatusLabel(status: string): string {
    const statusObj = this.orderStatuses.find(item => item.value === status);
    return statusObj ? statusObj.label : 'Trạng thái không hợp lệ';
  }
  changePage(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }
  calculateVisiblePages(): void {
    this.visiblePages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
  
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
  
   
  for (let i = startPage; i <= endPage; i++) {
    this.visiblePages.push(i);
  }

  }
  getPaginationRange(): number[] {
    const range: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
  
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }
}