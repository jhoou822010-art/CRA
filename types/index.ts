export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  affiliate_url: string;
  image_url: string;
  gallery: string[];
  videos: string[];
  badge: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_offer: boolean;
  is_new: boolean;
  category_id: string | null;
  categories?: {
    name: string;
    slug: string;
  } | null;
  stores?: {
    name: string;
    logo_url: string | null;
  } | null;
};

export type CartItem = {
  id: Product["id"];
  title: Product["title"];
  price: Product["price"];
  image_url: Product["image_url"];
  affiliate_url: Product["affiliate_url"];
  quantity: number;
};
