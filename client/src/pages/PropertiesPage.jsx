import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { api } from '../api/api';
import { EMPTY_FILTERS, Filters } from '../components/Filters';
import { PropertyCard } from '../components/PropertyCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { SORT_OPTIONS } from '../utils/constants';

// The URL query string is the single source of truth for filters, so a
// filtered search can be bookmarked, shared or refreshed.
export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const queryString = searchParams.toString();
  const sort = searchParams.get('sort') || 'newest';

  const currentFilters = Object.fromEntries(
    Object.keys(EMPTY_FILTERS).map((key) => [key, searchParams.get(key) || ''])
  );

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await api.get(`/api/properties?${queryString}`);
      setProperties(data.properties);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  function handleApplyFilters(values) {
    const params = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
      if (String(value).trim()) params.set(key, String(value).trim());
    });
    if (sort !== 'newest') params.set('sort', sort);

    setSearchParams(params);
    setShowFilters(false);
  }

  function handleSortChange(event) {
    const params = new URLSearchParams(searchParams);
    params.set('sort', event.target.value);
    setSearchParams(params);
  }

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Properties</h1>
        <p className="muted">Homes, plots and offices for sale and rent.</p>
      </header>

      <div className="listing-layout">
        <aside className={`filters-panel ${showFilters ? 'open' : ''}`}>
          {/* key resets the form when the URL changes, e.g. from the homepage search */}
          <Filters
            key={queryString}
            initialValues={currentFilters}
            onApply={handleApplyFilters}
            onReset={() => setSearchParams({})}
          />
        </aside>

        <section>
          <div className="results-bar">
            <p>
              <strong>{loading ? '...' : properties.length}</strong>{' '}
              {properties.length === 1 ? 'property' : 'properties'} found
            </p>
            <div className="results-controls">
              <button
                type="button"
                className="btn btn-small btn-outline filters-toggle"
                aria-expanded={showFilters}
                onClick={() => setShowFilters((open) => !open)}
              >
                {showFilters ? 'Hide filters' : 'Filters'}
              </button>
              <label className="sort-select">
                <span className="visually-hidden">Sort by</span>
                <select value={sort} onChange={handleSortChange}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {loading && <LoadingState text="Finding properties..." />}
          <ErrorMessage message={error} onRetry={loadProperties} />

          {!loading && !error && properties.length === 0 && (
            <div className="empty-state">
              <h3>No properties match these filters</h3>
              <p className="muted">Try a different city or widen the price range.</p>
            </div>
          )}

          {!loading && !error && (
            <div className="property-grid">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
