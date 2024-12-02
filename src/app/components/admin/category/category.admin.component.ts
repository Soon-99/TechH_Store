import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatagoryRequest, CatagoryResponse } from '../../../responses/catagory.response';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-admin',
  templateUrl: './category.admin.component.html',
  styleUrls: ['./category.admin.component.scss'],
  standalone: true,
  imports: [   
    CommonModule,
    FormsModule,
  ]
})
export class CategoryAdminComponent implements OnInit {
  categories: CatagoryResponse[] = []; 
  
  // State for create/update modal
  isModalOpen = false;
  modalMode: 'create' | 'update' = 'create';
  currentCategory: CatagoryRequest = {
    name: '',
    description: '',
    brandId: 0
  };
  selectedCategoryId: number | null = null;

  constructor(    
    private categoryService: CategoryService,    
    private toastr: ToastrService,
    private router: Router
  ) {}
    
  ngOnInit() {      
    this.getCategories();
  }

  getCategories() {
    this.categoryService.adminGetAllCategory().subscribe({
      next: (response: any) => {
        this.categories = response?.data || [];
        console.log(this.categories);
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.categories = [];
      }
    });
  }

  openCreateModal() {
    this.modalMode = 'create';
    this.currentCategory = {
      name: '',
      description: '',
      brandId: 0
    };
    this.selectedCategoryId = null;
    this.isModalOpen = true;
  }

  openUpdateModal(category: CatagoryResponse) {
    this.modalMode = 'update';
    this.currentCategory = {
      name: category.name,
      description: category.description,
      brandId: category.brandId
    };
    this.selectedCategoryId = category.id;
    this.isModalOpen = true;
  }

  saveCategory() {
    if (this.modalMode === 'create') {
      this.insertCategory(this.currentCategory);
    } else {
      if (this.selectedCategoryId) {
        const updateData = {
          ...this.currentCategory,
          id: this.selectedCategoryId
        };
        this.updateCategory(updateData);
      } else {
        this.toastr.error('Category ID is missing');
      }
    }
  }

  insertCategory(category: CatagoryRequest) {
    this.categoryService.adminCreateCategory(category).subscribe({
      next: (response) => {
          this.toastr.success('Category created successfully');
          this.getCategories();
          this.isModalOpen = false;

      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Failed to create category');
      }
    });
  } 

  updateCategory(category: CatagoryRequest & { id: number }) {
    this.categoryService.adminUpdateCategory(category).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.toastr.success('Category updated successfully');
          this.getCategories();
          this.isModalOpen = false;
        } else {
          this.toastr.error(response.message || 'Failed to update category');
        }
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Failed to update category');
      }
    });
  }  

  deleteCategory(category: CatagoryResponse) {    
    if (!category.id) {
      this.toastr.error('Invalid category ID');
      return;
    }

    // Use ngx-toastr confirmation or create a custom confirmation dialog
    if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      this.categoryService.adminDeleteCategory(category.id).subscribe({
        next: (response) => {
            this.toastr.success('Category deleted successfully');
            this.getCategories();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.toastr.error(error.error?.message || 'Failed to delete category');
        }
      });
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }
}