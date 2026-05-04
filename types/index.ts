// types/index.ts

export type UserRole     = 'buyer' | 'seller' | 'admin';
export type OrderStatus  = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type ProductStatus = 'draft' | 'active' | 'archived';

export interface Profile {
  id:          string;
  role:        UserRole;
  full_name:   string | null;
  avatar_url:  string | null;
  phone:       string | null;
  address:     ShippingAddress | null;
  is_verified: boolean;
  created_at:  string;
  updated_at:  string;
}

export interface ShippingAddress {
  city:    string;
  street:  string;
  zip:     string;
  country: string;
}

export interface Category {
  id:          string;
  name:        string;
  slug:        string;
  icon:        string | null;
  description: string | null;
  image_url:   string | null;
  parent_id:   string | null;
  product_count?: number;
  sort_order:  number;
  is_active:   boolean;
  created_at:  string;
}

export interface Banner {
  id:           string;
  title:        string;
  subtitle:     string;
  badge?:       string;
  cta:          string;
  href:         string;
  bg_gradient:  string;
  accent_color: string;
  tag?:         string;
  image?:       string;
  image_alt?:   string;
  visual_category?: string;
  visual_scale?: number;
}

export interface SpecTemplate {
  id:          string;
  category_id: string;
  key:         string;
  label:       string;
  unit:        string | null;
  data_type:   'text' | 'number' | 'boolean' | 'enum';
  options:     string[] | null;
  is_required: boolean;
  sort_order:  number;
}

export type ProductSpecs = Record<string, string | number | boolean>;

export interface Product {
  id:           string;
  seller_id:    string;
  category_id:  string | null;
  name:         string;
  slug:         string;
  description:  string | null;
  price:        number;
  old_price:    number | null;
  images:       string[];
  brand:        string | null;
  sku:          string | null;
  stock_qty:    number;
  status:       ProductStatus;
  is_featured:  boolean;
  rating:       number;
  review_count: number;
  specs:        ProductSpecs;
  created_at:   string;
  updated_at:   string;
  category_name?:   string;
  category_slug?:   string;
  category_icon?:   string;
  seller_name?:     string;
  seller_verified?: boolean;
}

export interface Review {
  id:          string;
  product_id:  string;
  user_id:     string;
  rating:      number;
  title:       string | null;
  comment:     string | null;
  is_verified: boolean;
  created_at:  string;
  user?:       Pick<Profile, 'full_name' | 'avatar_url'>;
}

export interface CartItem {
  id:              string;
  user_id:         string;
  product_id:      string;
  quantity:        number;
  created_at:      string;
  product_name?:   string;
  price?:          number;
  old_price?:      number | null;
  images?:         string[];
  brand?:          string;
  stock_qty?:      number;
  product_status?: ProductStatus;
  line_total?:     number;
}

export interface Order {
  id:             string;
  buyer_id:       string;
  status:         OrderStatus;
  total_price:    number;
  shipping_addr:  ShippingAddress | null;
  payment_method: string;
  payment_status: string;
  notes:          string | null;
  created_at:     string;
  updated_at:     string;
  items?:         OrderItem[];
}

export interface OrderItem {
  id:               string;
  order_id:         string;
  product_id:       string | null;
  seller_id:        string | null;
  quantity:         number;
  unit_price:       number;
  product_snapshot: Product | null;
}

export interface LoginForm   { email: string; password: string; }
export interface RegisterForm { email: string; password: string; full_name: string; role: UserRole; }

export interface ProductForm {
  name:        string;
  description: string;
  price:       number;
  old_price?:  number;
  category_id: string;
  brand:       string;
  stock_qty:   number;
  specs:       ProductSpecs;
  images:      string[];
  status:      ProductStatus;
}

export interface ActionResult<T = void> { data?: T; error?: string; }

export interface ProductFilters {
  category?: string;
  brand?:    string;
  minPrice?: number;
  maxPrice?: number;
  inStock?:  boolean;
  search?:   string;
  sortBy?:   'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
  page?:     number;
  limit?:    number;
}
