export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  name: {
    firstname: string;
    lastname: string;
  };
}

// Authentication Types
export interface AuthResponse<T = any> {
  success: boolean;
  message: string;
  errorCode: string;
  data: T | null;
  timestamp: string;
}

export interface AuthData {
  accessToken: string;
  tokenType: string;
  userId: number;
  username: string;
  emailAddress: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  emailAddress: string;
  phoneNumber: string;
  password: string;
}

export interface AuthUser {
  userId: number;
  username: string;
  emailAddress: string;
  role: string;
  accessToken: string;
}

