
export interface Order {
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
