import { Product } from '../types/product';
import rawSheetProducts from './sheetProducts.json';

// Automatically detect brand from actual spreadsheet product name
function detectBrand(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('nike') || n.includes('air max') || n.includes('dunk') || n.includes('af1') || n.includes('air force')) return 'Nike';
  if (n.includes('jordan') || n.includes('aj4') || n.includes('aj1') || n.includes('aj11')) return 'Jordan';
  if (n.includes('adidas') || n.includes('samba') || n.includes('spezial') || n.includes('campus') || n.includes('yeezy')) return 'Adidas';
  if (n.includes('balenciaga')) return 'Balenciaga';
  if (n.includes('louis vuitton') || n.includes('lv ') || n.includes('lv')) return 'Louis Vuitton';
  if (n.includes('stone island')) return 'Stone Island';
  if (n.includes('ralph lauren') || n.includes('polo')) return 'Ralph Lauren';
  if (n.includes('corteiz')) return 'Corteiz';
  if (n.includes('travis scott') || n.includes('utopia')) return 'Travis Scott';
  if (n.includes('sp5der') || n.includes('555555')) return 'Sp5der';
  if (n.includes('essentials') || n.includes('fog')) return 'Essentials';
  if (n.includes('hellstar')) return 'Hellstar';
  if (n.includes('trapstar')) return 'Trapstar';
  if (n.includes('syna') || n.includes('syna world')) return 'Syna World';
  if (n.includes('denim tears')) return 'Denim Tears';
  if (n.includes('gallery dept')) return 'Gallery Dept';
  if (n.includes('palm angels')) return 'Palm Angels';
  if (n.includes('stussy')) return 'Stussy';
  if (n.includes('burberry')) return 'Burberry';
  if (n.includes('chrome hearts')) return 'Chrome Hearts';
  if (n.includes('goyard')) return 'Goyard';
  if (n.includes('dior')) return 'Dior';
  if (n.includes('moncler')) return 'Moncler';
  if (n.includes('new balance')) return 'New Balance';
  if (n.includes('asics')) return 'Asics';
  if (n.includes('ami')) return 'Ami Paris';
  if (n.includes('gucci')) return 'Gucci';
  if (n.includes('prada')) return 'Prada';
  if (n.includes('hermes') || n.includes('hermès')) return 'Hermes';
  if (n.includes('cartier')) return 'Cartier';
  return 'Streetwear';
}

export const SHEET_PRODUCTS: Product[] = (rawSheetProducts as any[]).map(p => ({
  ...p,
  brand: detectBrand(p.name)
}));
