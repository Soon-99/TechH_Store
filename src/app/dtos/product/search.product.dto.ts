// product-search.dto.ts
export class ProductSearch {
    productName?: string;
    categoryName?: string;
    toSalePrice?: number;
    fromSalePrice?: number;
    toImportPrice?: number;
    fromImportPrice?: number;
    categoryId?: number;
    pageNumber?: number = 0;
    pageSize?: number = 10;
    sorting?: string;
    from?: string; // ISO date string
    to?: string;   // ISO date string
  }