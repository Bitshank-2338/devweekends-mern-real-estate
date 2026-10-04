import { Link } from 'react-router';
import { formatPrice, PLACEHOLDER_IMAGE, showPlaceholderImage } from '../utils/format';

// `actions` lets the agent dashboard add Edit/Delete buttons under the card.
export function PropertyCard({ property, actions }) {
  const image = property.images?.[0] || PLACEHOLDER_IMAGE;
  const agentName = property.owner?.name;

  return (
    <article className="property-card">
      <div className="property-card-image">
        <img src={image} alt={property.title} loading="lazy" onError={showPlaceholderImage} />
        <span className={`badge badge-${property.listingType}`}>
          {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
        </span>
        {property.featured && <span className="badge badge-featured">Featured</span>}
      </div>

      <div className="property-card-body">
        <p className="property-card-price">{formatPrice(property.price, property.listingType)}</p>
        <h3>{property.title}</h3>
        <p className="muted">
          {property.city}
          {property.state !== property.city && `, ${property.state}`} · {property.propertyType}
        </p>

        <ul className="property-stats">
          <li>{property.bedrooms} bed</li>
          <li>{property.bathrooms} bath</li>
          <li>{property.area.toLocaleString('en-IN')} sq ft</li>
        </ul>

        <div className="property-card-footer">
          {agentName && <span className="muted small">Listed by {agentName}</span>}
          <Link to={`/properties/${property._id}`} className="btn btn-small">
            View Property
          </Link>
        </div>

        {actions && <div className="card-actions">{actions}</div>}
      </div>
    </article>
  );
}
