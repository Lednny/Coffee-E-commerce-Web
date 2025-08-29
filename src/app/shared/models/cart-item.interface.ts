
export interface CartItem {
    id?: number;
    productId: number;
    productName: string;
    productDescription: string;
    productImageUrl: string;
    productPrice: number;
    productCategory: string;
    quantity: number;
}