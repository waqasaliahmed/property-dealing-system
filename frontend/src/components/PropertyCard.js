import React from 'react';
import '../styles/PropertyCard.css';

const PropertyCard = ({ property, isAdmin, onView, onVerify, onDelete, onStatusChange }) => {
  const imageUrl = property.images?.[0]?.url 
    ? (property.images[0].url.startsWith('http') ? property.images[0].url : `http://localhost:5000${property.images[0].url}`)
    : 'https://via.placeholder.com/400x300/e2e8f0/64748b?text=No+Image';

  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getPropertyStatusColor = (status) => {
    switch(status) {
      case 'available': return '#10b981';
      case 'dealing': return '#f59e0b';
      case 'sold': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) return `Rs. ${(price / 10000000).toFixed(1)} Crore`;
    if (price >= 100000) return `Rs. ${(price / 100000).toFixed(1)} Lac`;
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <div className="property-card" onClick={() => onView && onView()}>
      <div className="property-image-container">
        <img src={imageUrl} alt={property.title} className="property-image" loading="lazy" />
        <div className="property-badge">{property.title}</div>
        {property.status && property.status !== 'available' && (
          <div className="property-status-badge" style={{ backgroundColor: getPropertyStatusColor(property.status) }}>
            {property.status === 'dealing' ? '🤝 In Deal' : '✅ Sold'}
          </div>
        )}
        {isAdmin && (
          <div className="verification-badge" style={{ backgroundColor: getStatusColor(property.verificationStatus) }}>
            {property.verificationStatus?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="property-content">
        <div className="property-price-row">
          <span className="property-price">{formatPrice(property.price)}</span>
          <span className="property-area-tag">{property.area?.value} {property.area?.unit}</span>
        </div>
        
        <h3 className="property-title">{property.ownerName}'s {property.title}</h3>
        
        <div className="property-location">
          <span className="location-icon">📍</span>
          {property.location?.city}, {property.location?.area}
        </div>

        <div className="property-meta">
          <div className="meta-item">
            <span className="meta-label">Size</span>
            <span className="meta-value">{property.area?.value} {property.area?.unit}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Type</span>
            <span className="meta-value">{property.title}</span>
          </div>
        </div>

        {property.description && (
          <p className="property-description">{property.description.substring(0, 80)}...</p>
        )}

        <div className="property-actions" onClick={(e) => e.stopPropagation()}>
          {isAdmin ? (
            <>
              <button className="btn-card btn-view" onClick={() => onView()}>
                View
              </button>
              {property.verificationStatus === 'pending' && (
                <>
                  <button className="btn-card btn-verify" onClick={() => onVerify(property._id, 'verified')}>
                    ✓ Verify
                  </button>
                  <button className="btn-card btn-reject" onClick={() => onVerify(property._id, 'rejected')}>
                    ✗ Reject
                  </button>
                </>
              )}
              {onStatusChange && property.verificationStatus === 'verified' && (
                <select 
                  className="status-select"
                  value={property.status || 'available'}
                  onChange={(e) => onStatusChange(property._id, e.target.value)}
                >
                  <option value="available">Available</option>
                  <option value="dealing">In Dealing</option>
                  <option value="sold">Sold</option>
                </select>
              )}
              <button className="btn-card btn-delete" onClick={() => onDelete(property)}>
                🗑
              </button>
            </>
          ) : (
            <button className="btn-card btn-view full-width" onClick={() => onView()}>
              View Details →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
