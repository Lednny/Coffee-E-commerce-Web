export interface UserProfile {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    preferences?: UserPreferences;
}

export interface UserPreferences {
    currency: string;
    language: string;
    theme: string;
    notifications: {
        email: boolean;
        push: boolean;
        offers: boolean;
        newProducts: boolean;
    };
}

export interface UpdateUserProfile {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    preferences?: UserPreferences;
}