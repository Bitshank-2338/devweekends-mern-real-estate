import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-brand">EstateNest</p>
          <p className="muted">Find a place that feels like home.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link to="/properties?listingType=sale">Buy</Link>
          <Link to="/properties?listingType=rent">Rent</Link>
          <Link to="/agents">Agents</Link>
          <Link to="/register">List a property</Link>
        </nav>
        <p className="footer-note muted">
          A Dev Weekends Fellowship project. All listings, agents and agencies are fictional.
        </p>
      </div>
    </footer>
  );
}
