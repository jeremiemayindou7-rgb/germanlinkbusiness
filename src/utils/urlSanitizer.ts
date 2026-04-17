export class URLSanitizer {
  static sanitizeSearchQuery(query: string): string {
    return encodeURIComponent(query.trim());
  }

  static buildKleinanzeigenURL(query: string, filters?: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
  }): string {
    const baseURL = 'https://www.kleinanzeigen.de/s-';
    const params = new URLSearchParams();

    const sanitizedQuery = this.sanitizeSearchQuery(query);

    if (filters?.location) {
      params.append('locationStr', filters.location);
    }

    if (filters?.minPrice !== undefined) {
      params.append('priceFrom', filters.minPrice.toString());
    }

    if (filters?.maxPrice !== undefined) {
      params.append('priceTo', filters.maxPrice.toString());
    }

    const queryString = params.toString();
    const locationPart = filters?.location ?
      `${this.sanitizeSearchQuery(filters.location)}/` : '';

    return `${baseURL}${locationPart}${sanitizedQuery}${queryString ? `?${queryString}` : ''}`;
  }

  static buildEbayURL(query: string, filters?: {
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
  }): string {
    const baseURL = 'https://www.ebay.de/sch/i.html';
    const params = new URLSearchParams();

    params.append('_nkw', query);
    params.append('_sacat', '0');

    if (filters?.condition) {
      switch (filters.condition) {
        case 'new':
          params.append('LH_ItemCondition', '1000');
          break;
        case 'used':
          params.append('LH_ItemCondition', '3000');
          break;
        case 'refurbished':
          params.append('LH_ItemCondition', '2000|2010|2020|2030');
          break;
      }
    }

    if (filters?.minPrice !== undefined) {
      params.append('_udlo', filters.minPrice.toString());
    }

    if (filters?.maxPrice !== undefined) {
      params.append('_udhi', filters.maxPrice.toString());
    }

    if (filters?.location) {
      params.append('_sadis', '50');
      params.append('_stpos', filters.location);
    }

    return `${baseURL}?${params.toString()}`;
  }

  static buildAmazonURL(query: string, filters?: {
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
  }): string {
    const baseURL = 'https://www.amazon.de/s';
    const params = new URLSearchParams();

    params.append('k', query);

    if (filters?.condition === 'new') {
      params.append('rh', 'n:1');
    } else if (filters?.condition === 'used') {
      params.append('rh', 'n:1,p_n_condition-type:2');
    } else if (filters?.condition === 'refurbished') {
      params.append('rh', 'n:1,p_n_condition-type:1');
    }

    if (filters?.minPrice !== undefined) {
      params.append('low-price', filters.minPrice.toString());
    }

    if (filters?.maxPrice !== undefined) {
      params.append('high-price', filters.maxPrice.toString());
    }

    return `${baseURL}?${params.toString()}`;
  }

  static buildRebuyURL(query: string, filters?: {
    minPrice?: number;
    maxPrice?: number;
  }): string {
    const baseURL = 'https://www.rebuy.de/kaufen/suchen';
    const params = new URLSearchParams();

    params.append('q', query);

    if (filters?.minPrice !== undefined) {
      params.append('priceFrom', filters.minPrice.toString());
    }

    if (filters?.maxPrice !== undefined) {
      params.append('priceTo', filters.maxPrice.toString());
    }

    return `${baseURL}?${params.toString()}`;
  }

  static buildVintedURL(query: string, filters?: {
    minPrice?: number;
    maxPrice?: number;
    location?: string;
  }): string {
    const baseURL = 'https://www.vinted.de/vetements';
    const params = new URLSearchParams();

    params.append('search_text', query);

    if (filters?.minPrice !== undefined) {
      params.append('price_from', filters.minPrice.toString());
    }

    if (filters?.maxPrice !== undefined) {
      params.append('price_to', filters.maxPrice.toString());
    }

    return `${baseURL}?${params.toString()}`;
  }

  static validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const allowedHosts = [
        'ebay.de',
        'kleinanzeigen.de',
        'amazon.de',
        'rebuy.de',
        'vinted.de'
      ];

      return allowedHosts.some(host => urlObj.hostname.endsWith(host));
    } catch {
      return false;
    }
  }

  static normalizeURL(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      return url;
    }
  }
}
