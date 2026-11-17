export const DISPLACEMENT_BANDS = [
  { value: 'all', label: 'Any size', test: () => true },
  { value: 'small', label: 'Up to 150cc', test: (cc) => cc <= 150 },
  { value: 'mid', label: '151–400cc', test: (cc) => cc > 150 && cc <= 400 },
  { value: 'large', label: '401–800cc', test: (cc) => cc > 400 && cc <= 800 },
  { value: 'xl', label: 'Over 800cc', test: (cc) => cc > 800 },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'cc-desc', label: 'Largest engine' },
];

export const DEFAULT_FILTERS = { q: '', band: 'all', maxPrice: '', sort: 'newest' };

// Stored in bikes.specs as { model_year, cylinder, condition }.
export const CONDITIONS = ['Good', 'Some fixes needed', 'Parts only'];

export const STATUS_LABEL = { Active: 'Available', Pending: 'Awaiting approval', Sold: 'Sold' };
