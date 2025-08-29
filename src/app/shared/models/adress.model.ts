export interface Address {
    id?: number;
    userId?: string;
    name: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    country: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface CreateAddressRequest {
    name: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    country: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface UpdateAddressRequest {
    name?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    country?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}