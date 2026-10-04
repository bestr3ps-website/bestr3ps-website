export interface Product {
  id: string;
  name: string;
  sourceUrl: string;
  price: string;
  originalPrice?: string;
  discountPercent?: number;
  imageUrl?: string;
  productId?: string;
  category: string;
  brand?: string;
  dateAdded?: string;
}

export type CategoryKey = 
  | 'ALL'
  | 'HOTSALE'
  | 'SNEAKERS'
  | 'T-SHIRTS/SHORTS'
  | 'HOODIE/PANTS'
  | 'DOWNJACKET'
  | 'COATS/JACKETS'
  | 'SUITS'
  | 'ACCESSORIES'
  | 'BAGS'
  | 'JERSEYS';

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  iconName: string;
  description: string;
}

// Exactly the agents requested:
// litbuy, rizzitgo, hipobuy, kakobuy, usfans, oopbuy, CSSBuy, Joyagoo, BoonBuy
export type AgentType = 
  | 'litbuy' 
  | 'rizzitgo' 
  | 'hipobuy' 
  | 'kakobuy' 
  | 'usfans' 
  | 'oopbuy' 
  | 'cssbuy' 
  | 'joyagoo' 
  | 'boonbuy';

export interface AgentConfig {
  id: AgentType;
  name: string;
  tagline: string;
  shortCode: string;
  avatarBg: string;
  avatarColor: string;
  logoUrl?: string;
  websiteUrl?: string;
  enabled?: boolean;
  order?: number;
  buildUrl: (sourceUrl: string, productId?: string) => string;
}

export interface ApiResponse {
  status?: string;
  data?: Record<string, Product[]>;
  DEBUG?: Record<string, number>;
  total?: number;
  timestamp?: string;
  error?: string;
}
