import { URLSanitizer } from '../utils/urlSanitizer';

export interface MarketplaceProduct {
  id: string;
  title: string;
  price: number;
  currency: string;
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  imageUrl?: string;
  url: string;
  marketplace: 'ebay' | 'kleinanzeigen' | 'amazon' | 'rebuy' | 'vinted';
  seller?: string;
  shippingCost?: number;
  description?: string;
  isGerman: boolean;
}

export interface SearchFilters {
  condition?: 'new' | 'used' | 'refurbished' | 'all';
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  marketplace?: MarketplaceProduct['marketplace'] | 'all';
  sortBy?: 'price_asc' | 'price_desc' | 'relevance' | 'newest';
}

const ALLOWED_MARKETPLACES = ['ebay', 'kleinanzeigen', 'amazon', 'rebuy', 'vinted'] as const;
const BLOCKED_SOURCES = ['aliexpress', 'alibaba', 'wish', 'temu'];

class GermanMarketplaceService {
  private readonly germanPostalCodes = /^[0-9]{5}$/;
  private readonly germanCities = [
    'Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt',
    'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig',
    'Bremen', 'Dresden', 'Hannover', 'Nürnberg', 'Duisburg'
  ];

  private isGermanLocation(location: string): boolean {
    if (!location) return false;

    const normalizedLocation = location.toLowerCase();

    if (this.germanPostalCodes.test(location)) {
      return true;
    }

    const hasGermanCity = this.germanCities.some(city =>
      normalizedLocation.includes(city.toLowerCase())
    );

    const hasGermanyMention = normalizedLocation.includes('deutschland') ||
                              normalizedLocation.includes('germany');

    return hasGermanCity || hasGermanyMention;
  }

  private isBlockedSource(url: string): boolean {
    const normalizedUrl = url.toLowerCase();
    return BLOCKED_SOURCES.some(source => normalizedUrl.includes(source));
  }

  private validateGermanProduct(product: Partial<MarketplaceProduct>): boolean {
    if (product.url && this.isBlockedSource(product.url)) {
      console.warn(`Blocked non-German source: ${product.url}`);
      return false;
    }

    if (!product.location || !this.isGermanLocation(product.location)) {
      console.warn(`Non-German location detected: ${product.location}`);
      return false;
    }

    const allowedMarketplace = ALLOWED_MARKETPLACES.includes(
      product.marketplace as typeof ALLOWED_MARKETPLACES[number]
    );

    if (!allowedMarketplace) {
      console.warn(`Non-German marketplace: ${product.marketplace}`);
      return false;
    }

    return true;
  }

  async searchEbayDE(query: string, filters: SearchFilters = {}): Promise<MarketplaceProduct[]> {
    const results: MarketplaceProduct[] = [];

    const searchURL = URLSanitizer.buildEbayURL(query, {
      condition: filters.condition !== 'all' ? filters.condition : undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      location: filters.location
    });

    const mockProducts: MarketplaceProduct[] = [
      {
        id: 'ebay-1',
        title: `${query} - Neu`,
        price: 299.99,
        currency: 'EUR',
        condition: 'new',
        location: 'Berlin, Deutschland',
        imageUrl: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
        url: searchURL,
        marketplace: 'ebay',
        seller: 'deutscher-händler-gmbh',
        shippingCost: 4.99,
        description: 'Neues Produkt vom deutschen Händler. Versand aus Deutschland.',
        isGerman: true
      },
      {
        id: 'ebay-2',
        title: `${query} - Gebraucht - Sehr gut`,
        price: 149.99,
        currency: 'EUR',
        condition: 'used',
        location: 'München, Bayern',
        imageUrl: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
        url: searchURL,
        marketplace: 'ebay',
        seller: 'privat-verkäufer',
        shippingCost: 5.49,
        description: 'Gebrauchtes Produkt in sehr gutem Zustand. Privatverkauf aus München.',
        isGerman: true
      }
    ];

    for (const product of mockProducts) {
      if (this.validateGermanProduct(product) && this.applyFilters(product, filters)) {
        results.push(product);
      }
    }

    return results;
  }

  async searchKleinanzeigenDE(query: string, filters: SearchFilters = {}): Promise<MarketplaceProduct[]> {
    const results: MarketplaceProduct[] = [];

    const searchURL = URLSanitizer.buildKleinanzeigenURL(query, {
      location: filters.location,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      condition: filters.condition !== 'all' ? filters.condition : undefined
    });

    const mockProducts: MarketplaceProduct[] = [
      {
        id: 'kleinanzeigen-1',
        title: `${query} zu verkaufen`,
        price: 120.00,
        currency: 'EUR',
        condition: 'used',
        location: 'Hamburg, 22305',
        imageUrl: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
        url: searchURL,
        marketplace: 'kleinanzeigen',
        seller: 'Privatperson',
        shippingCost: 0,
        description: 'Lokaler Verkauf in Hamburg. Abholung bevorzugt.',
        isGerman: true
      },
      {
        id: 'kleinanzeigen-2',
        title: `${query} - gut erhalten`,
        price: 89.50,
        currency: 'EUR',
        condition: 'used',
        location: 'Köln, 50667',
        imageUrl: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
        url: searchURL,
        marketplace: 'kleinanzeigen',
        seller: 'Privatperson',
        shippingCost: 6.99,
        description: 'Gut erhaltenes Produkt aus Köln. Versand möglich.',
        isGerman: true
      }
    ];

    for (const product of mockProducts) {
      if (this.validateGermanProduct(product) && this.applyFilters(product, filters)) {
        results.push(product);
      }
    }

    return results;
  }

  async searchAmazonDE(query: string, filters: SearchFilters = {}): Promise<MarketplaceProduct[]> {
    const results: MarketplaceProduct[] = [];

    const searchURL = URLSanitizer.buildAmazonURL(query, {
      condition: filters.condition !== 'all' ? filters.condition : undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice
    });

    const mockProducts: MarketplaceProduct[] = [
      {
        id: 'amazon-1',
        title: `${query} - Amazon.de`,
        price: 349.99,
        currency: 'EUR',
        condition: 'new',
        location: 'Versand aus Deutschland',
        imageUrl: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
        url: searchURL,
        marketplace: 'amazon',
        seller: 'Amazon.de',
        shippingCost: 0,
        description: 'Versand durch Amazon aus Deutschland. Prime-Versand verfügbar.',
        isGerman: true
      },
      {
        id: 'amazon-2',
        title: `${query} - Amazon Warehouse`,
        price: 249.99,
        currency: 'EUR',
        condition: 'refurbished',
        location: 'Amazon Warehouse Deutschland',
        imageUrl: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
        url: searchURL,
        marketplace: 'amazon',
        seller: 'Amazon Warehouse',
        shippingCost: 0,
        description: 'Generalüberholtes Produkt von Amazon Warehouse Deutschland.',
        isGerman: true
      }
    ];

    for (const product of mockProducts) {
      if (this.validateGermanProduct(product) && this.applyFilters(product, filters)) {
        results.push(product);
      }
    }

    return results;
  }

  async searchRebuyDE(query: string, filters: SearchFilters = {}): Promise<MarketplaceProduct[]> {
    const results: MarketplaceProduct[] = [];

    const searchURL = URLSanitizer.buildRebuyURL(query, {
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice
    });

    const mockProducts: MarketplaceProduct[] = [
      {
        id: 'rebuy-1',
        title: `${query} - Sehr gut`,
        price: 179.99,
        currency: 'EUR',
        condition: 'used',
        location: 'Berlin, Deutschland',
        imageUrl: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
        url: searchURL,
        marketplace: 'rebuy',
        seller: 'reBuy GmbH',
        shippingCost: 0,
        description: 'Geprüfte Gebrauchtware von reBuy. 36 Monate Garantie. Versand aus Deutschland.',
        isGerman: true
      }
    ];

    for (const product of mockProducts) {
      if (this.validateGermanProduct(product) && this.applyFilters(product, filters)) {
        results.push(product);
      }
    }

    return results;
  }

  async searchVintedDE(query: string, filters: SearchFilters = {}): Promise<MarketplaceProduct[]> {
    const results: MarketplaceProduct[] = [];

    const searchURL = URLSanitizer.buildVintedURL(query, {
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      location: filters.location
    });

    const mockProducts: MarketplaceProduct[] = [
      {
        id: 'vinted-1',
        title: `${query} - Second Hand`,
        price: 65.00,
        currency: 'EUR',
        condition: 'used',
        location: 'Stuttgart, 70173',
        imageUrl: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
        url: searchURL,
        marketplace: 'vinted',
        seller: 'Privat',
        shippingCost: 4.95,
        description: 'Second Hand Artikel aus Stuttgart. Käuferschutz inklusive.',
        isGerman: true
      }
    ];

    for (const product of mockProducts) {
      if (this.validateGermanProduct(product) && this.applyFilters(product, filters)) {
        results.push(product);
      }
    }

    return results;
  }

  async searchAllMarketplaces(query: string, filters: SearchFilters = {}): Promise<MarketplaceProduct[]> {
    const promises = [
      this.searchEbayDE(query, filters),
      this.searchKleinanzeigenDE(query, filters),
      this.searchAmazonDE(query, filters),
      this.searchRebuyDE(query, filters),
      this.searchVintedDE(query, filters)
    ];

    const results = await Promise.all(promises);
    const allProducts = results.flat();

    return this.sortProducts(allProducts, filters.sortBy || 'relevance');
  }

  private applyFilters(product: MarketplaceProduct, filters: SearchFilters): boolean {
    if (filters.condition && filters.condition !== 'all') {
      if (product.condition !== filters.condition) return false;
    }

    if (filters.minPrice !== undefined) {
      if (product.price < filters.minPrice) return false;
    }

    if (filters.maxPrice !== undefined) {
      if (product.price > filters.maxPrice) return false;
    }

    if (filters.location) {
      const normalizedLocation = product.location.toLowerCase();
      const normalizedFilter = filters.location.toLowerCase();
      if (!normalizedLocation.includes(normalizedFilter)) return false;
    }

    if (filters.marketplace && filters.marketplace !== 'all') {
      if (product.marketplace !== filters.marketplace) return false;
    }

    return true;
  }

  private sortProducts(products: MarketplaceProduct[], sortBy: SearchFilters['sortBy']): MarketplaceProduct[] {
    const sorted = [...products];

    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
        return sorted.reverse();
      case 'relevance':
      default:
        return sorted;
    }
  }

  getMarketplaceName(marketplace: MarketplaceProduct['marketplace']): string {
    const names = {
      ebay: 'eBay.de',
      kleinanzeigen: 'Kleinanzeigen.de',
      amazon: 'Amazon.de',
      rebuy: 'reBuy.de',
      vinted: 'Vinted.de'
    };
    return names[marketplace];
  }

  getConditionLabel(condition: MarketplaceProduct['condition']): string {
    const labels = {
      new: 'Neu',
      used: 'Gebraucht',
      refurbished: 'Generalüberholt'
    };
    return labels[condition];
  }
}

export const germanMarketplaceService = new GermanMarketplaceService();
