import { Keyable, BaseFilters, FilteredResponse } from './types.js';

const snakeCaseToCamelCase = (string: string): string =>
  string.replace(/(_[a-z])/gi, ($1) =>
    $1.toUpperCase().replace('-', '').replace('_', ''),
  );

export const cameliseKeys = (object: object): object =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [snakeCaseToCamelCase(key), value]),
  );

// Text search utility
export const performTextSearch = (
  text: string,
  searchTerm: string,
  caseSensitive = false
): boolean => {
  if (!text || !searchTerm) return false;
  
  const searchText = caseSensitive ? text : text.toLowerCase();
  const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();
  
  return searchText.includes(term);
};

// Enhanced filtering function
export const filterData = <T extends Keyable>(
  data: T[],
  filters: Keyable
): T[] => {
  return data.filter((item) => {
    // Text search across multiple fields
    if (filters.query) {
      const searchFields = Object.values(item).filter(value => 
        typeof value === 'string'
      );
      const matchesQuery = searchFields.some(field =>
        performTextSearch(field, filters.query)
      );
      if (!matchesQuery) return false;
    }

    // Exact field matches
    for (const [key, value] of Object.entries(filters)) {
      if (key === 'query' || value === undefined) continue;
      
      // Handle range filters
      if (key.startsWith('min') && typeof value === 'number') {
        const fieldName = key.replace('min', '').toLowerCase();
        const itemValue = item[fieldName];
        if (typeof itemValue === 'number' && itemValue < value) return false;
        continue;
      }
      
      if (key.startsWith('max') && typeof value === 'number') {
        const fieldName = key.replace('max', '').toLowerCase();
        const itemValue = item[fieldName];
        if (typeof itemValue === 'number' && itemValue > value) return false;
        continue;
      }
      
      // Handle boolean filters (existence checks)
      if (key.startsWith('has') && typeof value === 'boolean') {
        const fieldName = key.replace('has', '').toLowerCase();
        const hasField = item[fieldName] !== null && item[fieldName] !== undefined && item[fieldName] !== '';
        if (hasField !== value) return false;
        continue;
      }
      
      // Handle exact matches and partial matches
      const itemValue = item[key];
      if (itemValue === undefined) return false;
      
      // String partial matching
      if (typeof value === 'string' && typeof itemValue === 'string') {
        if (!performTextSearch(itemValue, value)) return false;
      }
      // Exact value matching
      else if (itemValue !== value) {
        return false;
      }
    }
    
    return true;
  });
};

// Sorting utility
export const sortData = <T extends Keyable>(
  data: T[],
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] => {
  if (!sortBy) return data;
  
  return [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    // Handle null/undefined values
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    // String comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    }
    
    // Number comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return sortOrder === 'asc' ? comparison : -comparison;
    }
    
    // Fallback to string comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    const comparison = aStr.localeCompare(bStr);
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

// Pagination utility
export const paginateData = <T>(
  data: T[],
  limit = 100,
  offset = 0
): { data: T[]; total: number; hasNext: boolean; hasPrevious: boolean } => {
  const total = data.length;
  const start = Math.max(0, offset);
  const end = start + Math.max(1, limit);
  
  return {
    data: data.slice(start, end),
    total,
    hasNext: end < total,
    hasPrevious: start > 0,
  };
};

// Main filtering function with comprehensive support
export const applyFilters = <T extends Keyable>(
  data: T[],
  filters: BaseFilters & Keyable,
  availableFilters: string[]
): FilteredResponse<T> => {
  // Extract pagination and sorting parameters
  const { limit = 100, offset = 0, sortBy, sortOrder = 'asc', ...searchFilters } = filters;
  
  // Apply search filters
  let filteredData = filterData(data, searchFilters);
  
  // Apply sorting
  filteredData = sortData(filteredData, sortBy, sortOrder);
  
  // Apply pagination
  const paginatedResult = paginateData(filteredData, limit, offset);
  
  // Build response
  return {
    data: paginatedResult.data,
    pagination: {
      total: paginatedResult.total,
      limit,
      offset,
      hasNext: paginatedResult.hasNext,
      hasPrevious: paginatedResult.hasPrevious,
    },
    filters: {
      applied: searchFilters,
      available: availableFilters,
    },
  };
};

// Utility to extract manufacturer from aircraft name
export const extractManufacturer = (aircraftName: string): string => {
  if (!aircraftName) return '';
  
  const commonManufacturers = [
    'Airbus', 'Boeing', 'Bombardier', 'Embraer', 'ATR', 'Cessna', 
    'Gulfstream', 'Hawker', 'Learjet', 'Fokker', 'Antonov', 'Tupolev',
    'Sukhoi', 'Comac', 'Mitsubishi', 'Saab', 'De Havilland', 'BAE Systems'
  ];
  
  for (const manufacturer of commonManufacturers) {
    if (aircraftName.toLowerCase().includes(manufacturer.toLowerCase())) {
      return manufacturer;
    }
  }
  
  // Try to extract first word as manufacturer
  const firstWord = aircraftName.split(' ')[0];
  if (firstWord && firstWord.length > 2) {
    return firstWord;
  }
  
  return '';
};

// Legacy filtering function for backward compatibility
export const filterObjectsByPartialIataCode = (
  objects: Keyable[],
  partialIataCode: string,
  iataCodeLength: number,
): Keyable[] => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  } else {
    return objects.filter((object) =>
      object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
    );
  }
};
