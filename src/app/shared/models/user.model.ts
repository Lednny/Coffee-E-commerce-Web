export interface UserProfile {
    id: string;
    username: string;
    email: string;
    role: string;
}

export interface UpdateUserProfile{
    username?: string;
    email?: string;
}