import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LISTING_TYPES, PROPERTY_TYPES } from '../utils/constants';

// Hero search on the homepage. It only builds a URL like
// /properties?city=Pune&listingType=rent; the properties page does the fetching.
export function SearchBar() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ city: '', listingType: '', propertyType: '' });

  function handleChange(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
      if (value.trim()) params.set(key, value.trim());
    });

    navigate(`/properties?${params}`);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <label>
        <span>Location</span>
        <input
          name="city"
          value={values.city}
          onChange={handleChange}
          placeholder="Pune, Goa, Bengaluru..."
        />
      </label>
      <label>
        <span>Looking to</span>
        <select name="listingType" value={values.listingType} onChange={handleChange}>
          <option value="">Buy or rent</option>
          {LISTING_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.value === 'sale' ? 'Buy' : 'Rent'}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Property type</span>
        <select name="propertyType" value={values.propertyType} onChange={handleChange}>
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn">
        Search
      </button>
    </form>
  );
}
