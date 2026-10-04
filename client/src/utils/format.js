const CRORE = 10000000;
const LAKH = 100000;

function trimZeros(number) {
  return number.toFixed(2).replace(/\.?0+$/, '');
}

// 13500000 -> "₹1.35 Cr", 9500000 -> "₹95 L", 28000 -> "₹28,000"
export function formatPrice(price, listingType) {
  let text;

  if (price >= CRORE) text = `₹${trimZeros(price / CRORE)} Cr`;
  else if (price >= LAKH) text = `₹${trimZeros(price / LAKH)} L`;
  else text = `₹${price.toLocaleString('en-IN')}`;

  return listingType === 'rent' ? `${text}/mo` : text;
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// "2026-10-09T00:00:00.000Z" -> "2026-10-09", the format <input type="date"> expects.
export function toDateInputValue(value) {
  return new Date(value).toISOString().slice(0, 10);
}

export function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export const PLACEHOLDER_IMAGE = '/placeholder-home.svg';

// Use on <img onError> so a broken image link shows a neutral placeholder.
export function showPlaceholderImage(event) {
  if (!event.currentTarget.src.endsWith(PLACEHOLDER_IMAGE)) {
    event.currentTarget.src = PLACEHOLDER_IMAGE;
  }
}
