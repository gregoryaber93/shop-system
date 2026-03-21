export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistoryItem {
  id: string;
  createdAt: string;
  totalPrice: number;
  status: string;
  itemCount: number;
}

export interface UserContextType {
  profile: UserProfile | null;
  orderHistory: OrderHistoryItem[];
  isLoading: boolean;
  isUpdating: boolean;
  errorMessage: string | null;
  updateErrorMessage: string | null;
  updateSuccessMessage: string | null;
  refetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}
