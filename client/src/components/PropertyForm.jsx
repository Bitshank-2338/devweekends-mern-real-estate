import { useState } from 'react';
import { ErrorMessage } from './ErrorMessage';
import { LISTING_TYPES, PROPERTY_TYPES } from '../utils/constants';

const EMPTY_PROPERTY = {
  title: '',
  description: '',
  propertyType: 'Apartment',
  listingType: 'sale',
  price: '',
  city: '',
  state: '',
  address: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  images: '',
  amenities: '',
  featured: false,
};

// Lists are edited as text (one image URL per line, amenities comma-separated).
function toFormValues(property) {
  if (!property) return EMPTY_PROPERTY;

  return {
    ...EMPTY_PROPERTY,
    ...property,
    images: property.images.join('\n'),
    amenities: property.amenities.join(', '),
  };
}

function toPayload(values) {
  return {
    title: values.title,
    description: values.description,
    propertyType: values.propertyType,
    listingType: values.listingType,
    price: Number(values.price),
    city: values.city,
    state: values.state,
    address: values.address,
    bedrooms: Number(values.bedrooms || 0),
    bathrooms: Number(values.bathrooms || 0),
    area: Number(values.area),
    images: values.images.split('\n').map((url) => url.trim()).filter(Boolean),
    amenities: values.amenities.split(',').map((item) => item.trim()).filter(Boolean),
    featured: values.featured,
  };
}

export function PropertyForm({ property, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(property));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onSubmit(toPayload(values));
    } catch (submitError) {
      setError(submitError.message);
      setSubmitting(false);
    }
  }

  return (
    <form className="card form property-form" onSubmit={handleSubmit}>
      <h3>{property ? 'Edit property' : 'Add a new property'}</h3>
      <ErrorMessage message={error} />

      <label>
        Title
        <input name="title" value={values.title} onChange={handleChange} required maxLength={100} />
      </label>

      <label>
        Description
        <textarea
          name="description"
          rows="4"
          value={values.description}
          onChange={handleChange}
          required
          maxLength={2000}
        />
      </label>

      <div className="form-grid">
        <label>
          Property type
          <select name="propertyType" value={values.propertyType} onChange={handleChange}>
            {PROPERTY_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          Listing type
          <select name="listingType" value={values.listingType} onChange={handleChange}>
            {LISTING_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          {values.listingType === 'rent' ? 'Monthly rent (₹)' : 'Price (₹)'}
          <input type="number" name="price" min="1" value={values.price} onChange={handleChange} required />
        </label>
        <label>
          Area (sq ft)
          <input type="number" name="area" min="1" value={values.area} onChange={handleChange} required />
        </label>
        <label>
          Bedrooms
          <input type="number" name="bedrooms" min="0" value={values.bedrooms} onChange={handleChange} />
        </label>
        <label>
          Bathrooms
          <input type="number" name="bathrooms" min="0" value={values.bathrooms} onChange={handleChange} />
        </label>
        <label>
          City
          <input name="city" value={values.city} onChange={handleChange} required />
        </label>
        <label>
          State
          <input name="state" value={values.state} onChange={handleChange} required />
        </label>
      </div>

      <label>
        Address
        <input name="address" value={values.address} onChange={handleChange} required />
      </label>

      <label>
        Image URLs <span className="muted small">(one per line, up to 8)</span>
        <textarea
          name="images"
          rows="3"
          value={values.images}
          onChange={handleChange}
          placeholder="https://images.unsplash.com/..."
        />
      </label>

      <label>
        Amenities <span className="muted small">(comma separated)</span>
        <input
          name="amenities"
          value={values.amenities}
          onChange={handleChange}
          placeholder="Parking, Gym, Lift"
        />
      </label>

      <label className="checkbox">
        <input type="checkbox" name="featured" checked={values.featured} onChange={handleChange} />
        Show as a featured listing on the homepage
      </label>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Saving...' : property ? 'Save changes' : 'Create property'}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
