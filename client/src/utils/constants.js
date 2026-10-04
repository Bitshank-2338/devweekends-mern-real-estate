// Must match the enums in the server models.
export const PROPERTY_TYPES = ['Apartment', 'Villa', 'House', 'Studio', 'Commercial', 'Land'];

export const LISTING_TYPES = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
];

export const INQUIRY_STATUSES = ['new', 'contacted', 'closed'];

export const APPOINTMENT_STATUSES = ['requested', 'confirmed', 'completed', 'cancelled'];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
];
