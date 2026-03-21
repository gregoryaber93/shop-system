---
applyTo: "src/**/*.{ts,tsx}"
---
# User Profile And Order History Rules

User profile stores data from UserService. Order history comes from OrderService.

## Data Structure

```typescript
interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderHistoryItem {
  id: string;
  createdAt: string;
  totalPrice: number;
  status: string;
  itemCount: number;
}

type OrderStatus = 'Created' | 'PaymentPending' | 'PaymentAuthorized' | 'PaymentFailed' | 'Fulfilled';
```

## API Client

```typescript
// src/features/user/api/userClient.ts

export const userApiClient = {
  getProfile: async (token: string): Promise<UserProfile> => {
    const response = await axios.get(`${API_BASE}/api/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data;
  },

  updateProfile: async (
    data: Partial<UserProfile>,
    token: string
  ): Promise<UserProfile> => {
    const response = await axios.put(
      `${API_BASE}/api/users/profile`,
      data,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
```

## User Context

```typescript
// src/features/user/context/UserContext.tsx

interface UserContextType {
  profile: UserProfile | null;
  orderHistory: OrderHistoryItem[];
  isLoading: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => (token ? userApiClient.getProfile(token) : Promise.resolve(null)),
    enabled: !!token,
  });

  const {
    data: orderHistory = [],
  } = useQuery({
    queryKey: ['user', 'orders'],
    queryFn: () => (token ? orderApiClient.getMyOrders(token) : Promise.resolve([])),
    enabled: !!token,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) =>
      token ? userApiClient.updateProfile(data, token) : Promise.reject(),
  });

  return (
    <UserContext.Provider
      value={{
        profile: profile || null,
        orderHistory,
        isLoading: profileLoading,
        error: profileError?.message || null,
        refetchProfile: () => refetchProfile().then(() => {}),
        updateProfile: (data) =>
          updateProfileMutation.mutateAsync(data),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
```

## User Profile Component

```typescript
// src/features/user/ui/ProfilePage.tsx

export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, isLoading, error, updateProfile } = useUser();
  const { logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  if (isLoading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Not authenticated</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <form className="profile-form">
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName || ''}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName || ''}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phoneNumber || ''}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
          <button type="button" onClick={handleSave}>
            Save Changes
          </button>
        </form>
      ) : (
        <div className="profile-info">
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
          <p><strong>Phone:</strong> {profile.phoneNumber}</p>
          <p><strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      )}

      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

## Order History

```typescript
// src/features/user/ui/OrderHistory.tsx

export function OrderHistory() {
  const { orderHistory, isLoading } = useUser();

  if (isLoading) return <div>Loading orders...</div>;

  if (!orderHistory.length) {
    return (
      <div className="empty-state">
        <p>You have no orders yet.</p>
      </div>
    );
  }

  return (
    <div className="order-history">
      <h2>Order History</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Items</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orderHistory.map((order) => (
            <tr key={order.id}>
              <td>{order.id.substring(0, 8)}...</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>${order.totalPrice.toFixed(2)}</td>
              <td>{order.itemCount}</td>
              <td>
                <span className={`status status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </td>
              <td>
                <Link to={`/orders/${order.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Polling For Order Status

```typescript
// src/features/orders/hooks/useOrderPolling.ts

export const useOrderPolling = (orderId: string | null, interval = 2000) => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => (orderId && token ? orderApiClient.getById(orderId, token) : null),
    refetchInterval: interval,
    enabled: !!orderId && !!token,
  });
};
```

## Profile Updates

- Email cannot be changed on frontend; it is read-only.
- Validate input data: length, phone format, etc.
- After update, invalidate profile cache and display confirmation.
