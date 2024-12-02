import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { TokenService } from '../../services/token.service';
import { environment } from '../../../environments/environment';
import { OrderDTO, OrderRequest } from '../../dtos/order/order.dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Order } from '../../models/order';

import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { ToastrService } from 'ngx-toastr';


interface CartResponse {
  errorCode: number;
  message: string;
  status: string;
  data: {
    totalAmount: number;
    data: CartItemResponse[];
  };
}

interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
  originalQuantity: number;
}
interface Address {
  id?: number;
  userId?: number;
  toName?: number;
  phoneNumber: number;
  address?:string;
  deleted?: boolean;
  
}
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    FormsModule,    
    ReactiveFormsModule,
  ]
})
export class CartComponent implements OnInit {
  orderForm: FormGroup;
  addresss : Address[] = [];
  cartItems: CartItem[] = [];
  temporaryCartItems: CartItem[] = [];
  isChangesPending: boolean = false;
  totalAmount: number = 0;
  selectedAddressId: number | null = null;

  paymentMenthods = [
    { value: 'COD', label: 'Thanh Toán Khi Giao Hàng' },
    { value: 'CARD', label: 'Thanh Toán Bằng Thẻ' },
    { value: 'PAY_LATER', label: 'Trả Sau' }
  ];

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.orderForm = this.formBuilder.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.email]],
      phone_number: ['', [Validators.required, Validators.minLength(6)]],
      address: [null, Validators.required],
      note: [''],
      shipping_method: ['express'],
      paymentMenthod: ['COD', Validators.required],
      monthsToPay: [1, Validators.required],
      voucherId: [null],
    });
  }
  
  ngOnInit(): void {  
    this.cartService.getCart().subscribe({
      next: (cartResponse: CartResponse) => {            
        this.cartItems = cartResponse.data.data.map(cartItem => ({
          id: cartItem.id, // Include the cart item ID
          product: {
            id: cartItem.productId,
            name: cartItem.productName,
            categoryId: 0,
            quantity: cartItem.quantity,
            importPrice: cartItem.price,
            salePrice: cartItem.price,
            description: '',
            image: cartItem.productImage,
            createdBy: '',
            deleted: cartItem.deleted,
            brandName: '',
            code: null,
            rating: 0,
            categoryName: ''
          },
          quantity: cartItem.quantity,
          originalQuantity: cartItem.quantity
        }));
        this.temporaryCartItems = JSON.parse(JSON.stringify(this.cartItems));
        this.calculateTotal();
        this.loadAddresses();
      },
      error: (error: any) => {
        console.error('Error fetching cart:', error);
      }
    });        
  }
  
  loadAddresses(): void {
    this.orderService.getAddress().subscribe({
      next: (response: any) => {
        this.addresss = response?.data || [];
        console.log(this.addresss)
      },
      error: (error) => {
        this.addresss = [];
      },
     
    });
  }
  calculateTotal(): void {
    // Ensure totalAmount is explicitly consverted to a number
    this.totalAmount = this.temporaryCartItems.reduce(
      (total, item) => total + (Number(item.product.salePrice) * Number(item.quantity)),
      0
    );
  }
  prepareIncreaseQuantity(item: CartItem): void {
    const index = this.temporaryCartItems.indexOf(item);
    if (index !== -1) {
      this.temporaryCartItems[index].quantity += 1;
      this.calculateTotal();
      this.isChangesPending = true;
    }
  }

  prepareDecreaseQuantity(item: CartItem): void {
    const index = this.temporaryCartItems.indexOf(item);
    if (index !== -1 && this.temporaryCartItems[index].quantity > 1) {
      this.temporaryCartItems[index].quantity -= 1;
      this.calculateTotal();
      this.isChangesPending = true;
    }
  }

  prepareRemoveItem(item: CartItem): void {
    const index = this.temporaryCartItems.indexOf(item);
    if (index !== -1) {
      this.temporaryCartItems.splice(index, 1);
      this.calculateTotal();
      this.isChangesPending = true;
    }
  }

  confirmChanges(): void {
    if (this.isChangesPending) {
      // Determine changes and call services
      const addedItems = this.temporaryCartItems.filter(
        temp => !this.cartItems.some(orig => orig.product.id === temp.product.id)
      );
      const removedItems = this.cartItems.filter(
        orig => !this.temporaryCartItems.some(temp => temp.product.id === orig.product.id)
      );
      const modifiedItems = this.temporaryCartItems.filter(temp => 
        this.cartItems.some(orig => 
          orig.product.id === temp.product.id && orig.quantity !== temp.quantity
        )
      );

      // Call services for each type of change
      removedItems.forEach(item => {
        this.cartService.deleteProductCart(item.product.id).subscribe();
      });

      modifiedItems.forEach(item => {
        this.cartService.updateCart(item.product.id, item.quantity).subscribe();
      });

      // Update original cart items
      this.cartItems = JSON.parse(JSON.stringify(this.temporaryCartItems));
      this.isChangesPending = false;
    }
  }

  cancelChanges(): void {
    if (this.isChangesPending) {
      // Revert to original cart items
      this.temporaryCartItems = JSON.parse(JSON.stringify(this.cartItems));
      this.calculateTotal();
      this.isChangesPending = false;
    }
  }
  placeOrder(): void {
    if (!this.orderForm.valid) {
      // Prepare cart item IDs
      const orderRequest: OrderRequest = {
        monthsToPay: this.orderForm.get('monthsToPay')?.value,
        paymentMenthod: this.orderForm.get('paymentMenthod')?.value,
        voucherId: this.orderForm.get('voucherId')?.value || null,
        point: 10,
        cartItemIds: this.cartItems
          .filter(item => item.id !== undefined)
          .map(item => item.id!) 
          .filter(id => id !== null),
        addressIds: [this.orderForm.get('address')?.value]
      };
      console.log(this.orderForm)

      this.orderService.createOrder(orderRequest).subscribe({
        next: (response) => {
          // Handle different payment methods
         if (orderRequest.paymentMenthod != 'COD'){ 
          if (response.data.urlVnpay) {
          window.open(response.data.urlVnpay, '_blank');
        } else {
          console.error('No payment URL provided');
          alert('Error processing payment. Please try again.');
        }}
        alert("Đơn hàng đẵ được đặt")
        },
        error: (error) => {
          console.error('Order placement error', error);
        }
      });
    } else {
      // Mark form as touched to show validation errors
      Object.keys(this.orderForm.controls).forEach(key => {
        const control = this.orderForm.get(key);
        control?.markAsTouched();
      });
    }
  }
  navigateToAddress(): void {
    console.log('Navigating to address page...');
    this.router.navigate(['/address']);
  }
  
}
  