import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CheckoutData {
  cartItems: number[];
  totalAmount: number;
  paymentMethod: string;
  shippingMethod: string;
  couponCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
    private checkoutDataSource = new BehaviorSubject<CheckoutData | null>(null);
    
    checkoutData$ = this.checkoutDataSource.asObservable();
  
    setCheckoutData(data: CheckoutData) {
      this.checkoutDataSource.next(data);
    }
  
    clearCheckoutData() {
      this.checkoutDataSource.next(null);
    }
  }