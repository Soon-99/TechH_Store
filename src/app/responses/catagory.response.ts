export interface CatagoryResponse {
    id :number ;
    name: string ;
    description: string ;
    deleted: boolean ;
    brandId: number ;
    brandName :number ;
    
  }
  export interface CatagoryRequest {
    name: String ;
    description: string ;
    brandId: number ;
  }