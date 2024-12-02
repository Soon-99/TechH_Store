import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Product } from '../../../models/product';
import { ProductService } from '../../../services/product.service';
import { CatagoryResponse } from '../../../responses/catagory.response';
import { ProductResponse } from '../../../responses/product.response';
import { ProductRequest } from '../../../responses/product.request';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-product-admin',
  templateUrl: './product.admin.component.html',
  styleUrls: ['./product.admin.component.scss'],
  standalone: true,
  imports: [   
    CommonModule,
    FormsModule,
  ]
})
export class ProductAdminComponent implements OnInit {
  products: Product[] = [];
  categories: CatagoryResponse[] = [];
  isLoading: boolean = true;
  showCreateProductModal: boolean = false;
  
  // Image upload properties
  selectedImageFile: File | null = null;
  selectedImageFileName: string = '';

  // New product form model
  newProduct: ProductRequest = {
    name: '',
    categoryId: 0,
    quantity: 0,
    importPrice: 0,
    salePrice: 0,
    description: '',
    image: '',
    createdBy: 0,
    code: ''
  };

  constructor(
    private productService: ProductService,      
    private categoryService: CategoryService,   
    private router: Router
  ) {}

  ngOnInit() {
    this.getProducts();
    this.getCategories();
  }    

  getProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        this.products = response?.data?.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.products = [];
        this.isLoading = false;
      }
    });
  }

  getCategories() {
    this.categoryService.getCatagoryList().subscribe({
      next: (response: any) => {
        this.categories = response?.data || [];
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  openCreateProductModal() {
    // Reset form when opening
    this.newProduct = {
      name: '',
      categoryId: 0,
      quantity: 0,
      importPrice: 0,
      salePrice: 0,
      description: '',
      image: '',
      createdBy: 0,
      code: ''
    };
    this.selectedImageFile = null;
    this.selectedImageFileName = '';
    this.showCreateProductModal = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
      this.selectedImageFileName = file.name;
    }
  }

  createProduct() {
    // Validate form before submission
    if (!this.validateProductForm()) {
      return;
    }

    if (confirm('Are you sure you want to create this product?')) {
      // If an image is selected, upload it first
      if (this.selectedImageFile) {
        this.productService.uploadImage(this.selectedImageFile).subscribe({
          next: (uploadResponse) => {
            // Set the image URL from the upload response
            this.newProduct.image = uploadResponse.data.secure_url;
            
            // Then create the product
            this.submitProductCreation();
          },
          error: (uploadError) => {
            console.error('Error uploading image:', uploadError);
            alert('Failed to upload image. Please try again.');
          }
        });
      } else {
        // If no image is selected, create the product directly
        this.submitProductCreation();
      }
    }
  }

  private submitProductCreation() {
    this.productService.createProduct(this.newProduct).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.getProducts();
          this.showCreateProductModal = false;
          alert('Product created successfully');
        } else {
          alert(response.message);
        }
      },
      error: (error) => {
        console.error('Error creating product:', error);
        alert(error.error?.message || 'Failed to create product');
      }
    });
  }

  validateProductForm(): boolean {
    // Basic form validation
    if (!this.newProduct.name) {
      alert('Please enter product name');
      return false;
    }
    if (this.newProduct.categoryId <= 0) {
      alert('Please select a category');
      return false;
    }
    if (this.newProduct.salePrice <= 0) {
      alert('Please enter a valid sale price');
      return false;
    }
    return true;
  }

  deleteProduct(id: number) {
    if (confirm(`Are you sure you want to delete this product?`)) {
      this.productService.deleteProducts(id).subscribe({
        next: (response) => {
          if (response.status === 200) {
            alert('Product deleted successfully');
            this.getProducts();
          } else {
            alert(response.message);
          }
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert(error.error?.message || 'Failed to delete product');
        }
      });
    }
  }

  updateProduct(product: ProductResponse) {
    this.productService.updateProduct(product).subscribe({
      next: (response) => {
        if (response.status === 200) {
          alert('Product updated successfully');
          this.getProducts();
        } else {
          alert(response.message);
        }
      },
      error: (error) => {
        console.error('Error updating product:', error);
        alert(error.error?.message || 'Failed to update product');
      }
    });
  }

  productById(id: number) {
    this.productService.getProductsByIds(id).subscribe({
      next: (response: any) => {
        this.products = response?.data?.data || [];
      },
      error: (error) => {
        console.error('Error updating product:', error);
        alert(error.error?.message || 'Failed to update product');
      }
    });
  }
}