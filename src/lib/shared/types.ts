export type Id = string;
export type Idr = number; // Whole rupiah >= 0
export type IsoDateTime = string;
export type IsoDate = string; // YYYY-MM-DD

export type Role = 'CUSTOMER' | 'ADMIN';
export type ProductStatus = 'ACTIVE' | 'INACTIVE';
export type ProductKind = 'DEVICE' | 'ADDON';
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_ASSIGNMENT'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
export type OrderLineType = 'DEVICE' | 'INSTALLATION' | 'ADDON';
export type TechnicianAvailability = 'AVAILABLE' | 'UNAVAILABLE';

export type ErrorCode =
  | 'VALIDATION_FAILED'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'EMAIL_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'RATE_LIMITED'
  | 'ALREADY_IN_CART'
  | 'PRODUCT_INACTIVE'
  | 'CART_EMPTY'
  | 'ADDRESS_NOT_FOUND'
  | 'INVALID_STATE'
  | 'TECHNICIAN_UNAVAILABLE'
  | 'TECHNICIAN_OUT_OF_AREA'
  | 'PAYMENT_PROVIDER_ERROR'
  | 'IDEMPOTENCY_CONFLICT'
  | 'INTERNAL';

export interface ApiError {
  error: {
    code: ErrorCode;
    message: string;
    fields?: Record<string, string>;
    requestId: string;
  };
}

export interface UserDto {
  id: Id;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
}

export interface AuthResponse {
  user: UserDto;
}

export interface CategoryDto {
  id: Id;
  slug: string;
  name: string;
  sortOrder: number;
}

export interface ProductDto {
  id: Id;
  slug: string;
  name: string;
  description: string;
  priceIdr: Idr;
  imageUrl: string;
  kind: ProductKind;
  status: ProductStatus;
  isFeatured: boolean;
  featuredRank: number | null;
  category: CategoryDto;
}

export interface HomeCatalogResponse {
  featured: ProductDto[];
  sections: {
    category: CategoryDto;
    products: ProductDto[];
  }[];
}

export interface CartItemDto {
  id: Id;
  productId: Id;
  quantity: number;
  available: boolean;
  product: ProductDto;
}

export interface CartResponse {
  items: CartItemDto[];
  subtotalIdr: Idr;
  itemCount: number;
}

export interface AddressDto {
  id: Id;
  province: string;
  city: string;
  district: string;
  addressLine: string;
  postalCode: string;
  notes: string | null;
  isDefault: boolean;
}

export interface CheckoutOptions {
  includeInstallation: boolean;
  includeHub: boolean;
  preferredDate?: IsoDate | null;
  specialInstructions?: string | null;
}

export interface QuoteRequest extends CheckoutOptions {}

export interface QuoteResponse {
  deviceCount: number;
  devicesSubtotalIdr: Idr;
  installationFeeIdr: Idr;
  addOnsIdr: Idr;
  totalIdr: Idr;
  lines: { label: string; quantity: number; amountIdr: Idr }[];
}

export interface CreateOrderRequest extends CheckoutOptions {
  addressId: Id;
}

export interface OrderLineDto {
  lineType: OrderLineType;
  name: string;
  imageUrl: string | null;
  unitPriceIdr: Idr;
  quantity: number;
  lineTotalIdr: Idr;
}

export interface TechnicianSummaryDto {
  id: Id;
  fullName: string;
  avatarUrl: string | null;
  ratingAvg: number;
  city: string;
}

export interface OrderSummaryDto {
  id: Id;
  orderNumber: string;
  status: OrderStatus;
  createdAt: IsoDateTime;
  itemNames: string[];
  totalIdr: Idr;
  technician: TechnicianSummaryDto | null;
}

export interface OrderDetailDto extends OrderSummaryDto {
  address: Omit<AddressDto, 'id' | 'isDefault'>;
  includeInstallation: boolean;
  preferredDate: IsoDate | null;
  specialInstructions: string | null;
  estimatedFinishDate: IsoDate | null;
  lines: OrderLineDto[];
  devicesSubtotalIdr: Idr;
  installationFeeIdr: Idr;
  addOnsIdr: Idr;
}

export interface TechnicianDto {
  id: Id;
  fullName: string;
  avatarUrl: string | null;
  city: string;
  ratingAvg: number;
  ratingCount: number;
  areas: string[];
  highlight: string | null;
  availability: TechnicianAvailability;
}

export interface AdminProductDto extends ProductDto {
  updatedAt: IsoDateTime;
}
