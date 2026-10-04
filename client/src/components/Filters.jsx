import { useState } from 'react';
import { LISTING_TYPES, PROPERTY_TYPES } from '../utils/constants';

export const EMPTY_FILTERS = {
  city: '',
  listingType: '',
  propertyType: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
};

// Holds the filter inputs locally and only reports them when "Apply" is pressed,
// so the property list is not refetched on every keystroke.
export function Filters({ initialValues, onApply, onReset }) {
  const [values, setValues] = useState(initialValues);

  function handleChange(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onApply(values);
  }

  function handleReset() {
    setValues(EMPTY_FILTERS);
    onReset();
  }

  return (
    <form className="filters" onSubmit={handleSubmit}>
      <label>
        City
        <input name="city" value={values.city} onChange={handleChange} placeholder="Any city" />
      </label>

      <label>
        Listing
        <select name="listingType" value={values.listingType} onChange={handleChange}>
          <option value="">Sale or rent</option>
          {LISTING_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Property type
        <select name="propertyType" value={values.propertyType} onChange={handleChange}>
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <div className="filter-row">
        <label>
          Min price (₹)
          <input
            type="number"
            name="minPrice"
            min="0"
            value={values.minPrice}
            onChange={handleChange}
            placeholder="0"
          />
        </label>
        <label>
          Max price (₹)
          <input
            type="number"
            name="maxPrice"
            min="0"
            value={values.maxPrice}
            onChange={handleChange}
            placeholder="Any"
          />
        </label>
      </div>

      <label>
        Bedrooms
        <select name="bedrooms" value={values.bedrooms} onChange={handleChange}>
          <option value="">Any</option>
          {[1, 2, 3, 4].map((count) => (
            <option key={count} value={count}>
              {count}+
            </option>
          ))}
        </select>
      </label>

      <div className="filter-actions">
        <button type="submit" className="btn">
          Apply filters
        </button>
        <button type="button" className="btn btn-outline" onClick={handleReset}>
          Reset
        </button>
      </div>
    </form>
  );
}
