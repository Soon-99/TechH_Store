import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Address } from '../../models/address';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    FormsModule,    
    ReactiveFormsModule
  ]
})
export class AddressComponent implements OnInit {
  addressForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.addressForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.email]],
      additionalInformation: ['']
    });
  }

  createTransaction(): void {
    // Reset previous messages
    this.successMessage = '';
    this.errorMessage = '';

    if (this.addressForm.invalid) {
      Object.keys(this.addressForm.controls).forEach(field => {
        const control = this.addressForm.get(field);
        control?.markAsTouched();
      });
      return;
    }

    const addressData: Address = {
      toName: `${this.addressForm.value.firstName} ${this.addressForm.value.lastName}`,
      phoneNumber: this.addressForm.value.phoneNumber,
      address: this.addressForm.value.address
    };

    this.orderService.addRess(addressData).subscribe({
      next: (response) => {
        // Set success message
        this.successMessage = 'Address created successfully!';
        
        // Reset the form
        this.addressForm.reset();
      },
      error: (error) => {
        // Set error message
        this.errorMessage = 'Failed to create address. Please try again.';
        console.error('Address creation error', error);
      }
    });
  }

  // Getter methods remain the same as before
  get firstName(): AbstractControl {
    const control = this.addressForm.get('firstName');
    if (!control) {
      throw new Error('Form control not found');
    }
    return control;
  }

  get lastName(): AbstractControl {
    const control = this.addressForm.get('lastName');
    if (!control) {
      throw new Error('Form control not found');
    }
    return control;
  }

  get phoneNumber(): AbstractControl {
    const control = this.addressForm.get('phoneNumber');
    if (!control) {
      throw new Error('Form control not found');
    }
    return control;
  }

  get address(): AbstractControl {
    const control = this.addressForm.get('address');
    if (!control) {
      throw new Error('Form control not found');
    }
    return control;
  }
}