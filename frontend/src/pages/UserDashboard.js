import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { propertyAPI } from '../utils/api';
import PropertyCard from '../components/PropertyCard';
import '../styles/Dashboard.css';

const UserDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [areaValue, setAreaValue] = useState('');
  const [areaUnit, setAreaUnit] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [saleModal, setSaleModal] = useState(null);
  const [saleForm, setSaleForm] = useState({ buyerName: '', buyerPhone: '', salePrice: '' });
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname === '/my-properties' ? 'my' : 'browse');
  const navigate = useNavigate();

  const fullName = localStorage.getItem('fullName');

  useEffect(() => {
    const successMsg = localStorage.getItem('successMessage');
    if (successMsg) {
      setSuccessMessage(successMsg);
      localStorage.removeItem('successMessage');
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (!token || userRole !== 'user') {
      navigate('/login');
      return;
    }
    fetchProperties();
    fetchMyProperties();
  }, [navigate]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getAll({});
      const verified = response.data.properties?.filter(p => p.verificationStatus === 'verified') || [];
      setProperties(verified);
      setFilteredProperties(verified);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProperties = async () => {
    try {
      const response = await propertyAPI.getMyProperties();
      setMyProperties(response.data.properties || []);
    } catch (error) {
      console.error('Error fetching my properties:', error);
    }
  };

  const handleFilter = () => {
    let filtered = properties;

    if (searchLocation.trim()) {
      filtered = filtered.filter(p => 
        p.location?.city?.toLowerCase().includes(searchLocation.toLowerCase()) ||
        p.location?.area?.toLowerCase().includes(searchLocation.toLowerCase()) ||
        p.location?.address?.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }
    if (minPrice) filtered = filtered.filter(p => p.price >= parseInt(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= parseInt(maxPrice));
    if (areaValue) filtered = filtered.filter(p => p.area?.value >= parseFloat(areaValue));
    if (areaUnit) filtered = filtered.filter(p => p.area?.unit === areaUnit);
    if (propertyType) filtered = filtered.filter(p => p.title === propertyType);

    setFilteredProperties(filtered);
  };

  const handleClearFilters = () => {
    setSearchLocation('');
    setMinPrice('');
    setMaxPrice('');
    setAreaValue('');
    setAreaUnit('');
    setPropertyType('');
    setFilteredProperties(properties);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchLocation, minPrice, maxPrice, areaValue, areaUnit, propertyType]);

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await propertyAPI.updateStatus(propertyId, newStatus);
      setSuccessMessage(`Property status changed to ${newStatus}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchMyProperties();
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const handleRequestSale = async () => {
    if (!saleModal) return;
    try {
      await propertyAPI.requestSale(saleModal._id, {
        buyerName: saleForm.buyerName,
        buyerPhone: saleForm.buyerPhone,
        salePrice: saleForm.salePrice ? parseFloat(saleForm.salePrice) : saleModal.price,
      });
      setSaleModal(null);
      setSaleForm({ buyerName: '', buyerPhone: '', salePrice: '' });
      setSuccessMessage('Sale request sent to admin!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchMyProperties();
    } catch (error) {
      console.error('Error requesting sale:', error);
    }
  };

  const totalProperties = properties.length;
  const myPending = myProperties.filter(p => p.verificationStatus === 'pending').length;
  const myRejected = myProperties.filter(p => p.verificationStatus === 'rejected').length;
  const myVerified = myProperties.filter(p => p.verificationStatus === 'verified').length;

  const getApprovalStatusInfo = (status) => {
    switch (status) {
      case 'verified': return { icon: '✅', label: 'Approved', className: 'approval-approved' };
      case 'rejected': return { icon: '❌', label: 'Not Approved', className: 'approval-rejected' };
      case 'pending': return { icon: '⏳', label: 'Pending Approval', className: 'approval-pending' };
      default: return { icon: '❓', label: status, className: '' };
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) return `Rs. ${(price / 10000000).toFixed(1)} Crore`;
    if (price >= 100000) return `Rs. ${(price / 100000).toFixed(1)} Lac`;
    return `Rs. ${price?.toLocaleString()}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {successMessage && (
          <div className="success-toast">
            <div className="toast-content">
              <span className="toast-icon">✓</span>
              <span>{successMessage}</span>
            </div>
            <button className="toast-close" onClick={() => setSuccessMessage('')}>×</button>
          </div>
        )}

        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-left">
            <h1>Welcome, {fullName} 👋</h1>
            <p className="subtitle">Find your perfect property or manage your own listings.</p>
          </div>
          <div className="welcome-actions">
            <button className="btn btn-primary btn-add" onClick={() => navigate('/add-property')}>
              + Add My Property
            </button>
            <button className="btn btn-secondary btn-add" onClick={() => navigate('/properties')}>
              🏘️ All Properties
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            🏘️ Browse Properties ({totalProperties})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            📋 My Properties ({myProperties.length})
          </button>
        </div>

        {/* ===== Property History / Overview ===== */}
        <div className="history-section">
          <div className="history-header">
            <h2>📊 Property History & Overview</h2>
          </div>
          <div className="history-grid">
            <div className="history-card history-available">
              <div className="history-card-icon">🏘️</div>
              <div className="history-card-info">
                <span className="history-card-number">{properties.filter(p => p.status === 'available').length}</span>
                <span className="history-card-label">Available for Sale</span>
              </div>
            </div>
            <div className="history-card history-dealing">
              <div className="history-card-icon">🤝</div>
              <div className="history-card-info">
                <span className="history-card-number">{properties.filter(p => p.status === 'dealing').length}</span>
                <span className="history-card-label">Currently in Dealing</span>
              </div>
            </div>
            <div className="history-card history-sold">
              <div className="history-card-icon">✅</div>
              <div className="history-card-info">
                <span className="history-card-number">{properties.filter(p => p.status === 'sold').length}</span>
                <span className="history-card-label">Properties Sold</span>
              </div>
            </div>
            <div className="history-card history-my">
              <div className="history-card-icon">📋</div>
              <div className="history-card-info">
                <span className="history-card-number">{myProperties.length}</span>
                <span className="history-card-label">My Listings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <>
            {/* Stats */}
            <div className="stats-grid stats-grid-3">
              <div className="stat-card total">
                <div className="stat-icon">🏘️</div>
                <div className="stat-info">
                  <div className="stat-number">{totalProperties}</div>
                  <div className="stat-label">Available</div>
                </div>
              </div>
              <div className="stat-card verified">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <div className="stat-number">Rs. {totalProperties > 0 ? ((properties.reduce((a,b) => a + b.price, 0) / totalProperties) / 100000).toFixed(1) : 0}L</div>
                  <div className="stat-label">Avg Price</div>
                </div>
              </div>
              <div className="stat-card pending">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <div className="stat-number">{filteredProperties.length}</div>
                  <div className="stat-label">Showing</div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="search-filter-section">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by location, city, or area..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="search-input"
                />
                <button 
                  className="filter-toggle-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? '✕ Hide' : '⚙ Filters'}
                </button>
              </div>

              {showFilters && (
                <div className="advanced-filters">
                  <div className="filter-row">
                    <div className="filter-group">
                      <label>Min Price (Rs.)</label>
                      <input type="number" placeholder="Min price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                    </div>
                    <div className="filter-group">
                      <label>Max Price (Rs.)</label>
                      <input type="number" placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                    </div>
                    <div className="filter-group">
                      <label>Min Area</label>
                      <input type="number" placeholder="Min area" value={areaValue} onChange={(e) => setAreaValue(e.target.value)} />
                    </div>
                    <div className="filter-group">
                      <label>Area Unit</label>
                      <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)}>
                        <option value="">All Units</option>
                        <option value="Marla">Marla</option>
                        <option value="Kanal">Kanal</option>
                        <option value="Acre">Acre</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Property Type</label>
                      <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="Plot">Plot</option>
                        <option value="House">House</option>
                        <option value="Land">Land</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-small" onClick={handleClearFilters}>Clear All Filters</button>
                </div>
              )}
            </div>

            <div className="results-summary">
              <p>Showing <strong>{filteredProperties.length}</strong> of <strong>{properties.length}</strong> verified properties</p>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading properties...</p>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No properties found</h3>
                <p>Try adjusting your search or filters</p>
                <button className="btn btn-primary" onClick={handleClearFilters}>View All Properties</button>
              </div>
            ) : (
              <div className="properties-grid">
                {filteredProperties.map(property => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    isAdmin={false}
                    onView={() => navigate(`/property/${property._id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* My Properties Tab */}
        {activeTab === 'my' && (
          <>
            {/* My Properties Stats */}
            <div className="stats-grid stats-grid-4">
              <div className="stat-card total">
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <div className="stat-number">{myProperties.length}</div>
                  <div className="stat-label">Total</div>
                </div>
              </div>
              <div className="stat-card verified">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <div className="stat-number">{myVerified}</div>
                  <div className="stat-label">Approved</div>
                </div>
              </div>
              <div className="stat-card pending">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <div className="stat-number">{myPending}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
              <div className="stat-card sold">
                <div className="stat-icon">❌</div>
                <div className="stat-info">
                  <div className="stat-number">{myRejected}</div>
                  <div className="stat-label">Not Approved</div>
                </div>
              </div>
            </div>

            {/* Rejection Notice */}
            {myRejected > 0 && (
              <div className="approval-notice rejection-notice">
                <span className="notice-icon">⚠️</span>
                <div className="notice-content">
                  <strong>{myRejected} {myRejected === 1 ? 'property' : 'properties'} not approved by admin</strong>
                  <p>Rejected properties won't be visible to other users. You may edit and resubmit them.</p>
                </div>
              </div>
            )}

            {myPending > 0 && (
              <div className="approval-notice pending-notice">
                <span className="notice-icon">⏳</span>
                <div className="notice-content">
                  <strong>{myPending} {myPending === 1 ? 'property' : 'properties'} awaiting admin approval</strong>
                  <p>Your properties will be visible to other users once approved by an admin.</p>
                </div>
              </div>
            )}

            {myProperties.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏠</div>
                <h3>No properties yet</h3>
                <p>Add your first property to get started!</p>
                <button className="btn btn-primary" onClick={() => navigate('/add-property')}>+ Add Property</button>
              </div>
            ) : (
              <div className="my-properties-list">
                {myProperties.map(property => {
                  const statusInfo = getApprovalStatusInfo(property.verificationStatus);
                  const imageUrl = property.images?.[0]?.url 
                    ? (property.images[0].url.startsWith('http') ? property.images[0].url : `http://localhost:5000${property.images[0].url}`)
                    : 'https://via.placeholder.com/120x90/e2e8f0/64748b?text=No+Image';
                  return (
                    <div key={property._id} className="my-property-item">
                      <img src={imageUrl} alt={property.title} className="my-property-image" onClick={() => navigate(`/property/${property._id}`)} style={{ cursor: 'pointer' }} />
                      <div className="my-property-info">
                        <div className="my-property-header">
                          <h3 onClick={() => navigate(`/property/${property._id}`)} style={{ cursor: 'pointer' }}>{property.ownerName}'s {property.title}</h3>
                          <span className={`approval-badge ${statusInfo.className}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </div>
                        <div className="my-property-details">
                          <span>📍 {property.location?.city}, {property.location?.area}</span>
                          <span>📐 {property.area?.value} {property.area?.unit}</span>
                          <span className="my-property-price">{formatPrice(property.price)}</span>
                        </div>

                        {/* Property Status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Status:</span>
                          <span style={{ 
                            padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                            background: property.status === 'available' ? '#d1fae5' : property.status === 'dealing' ? '#fef3c7' : '#fee2e2',
                            color: property.status === 'available' ? '#065f46' : property.status === 'dealing' ? '#92400e' : '#991b1b'
                          }}>
                            {property.status === 'available' ? '🏘️ Available' : property.status === 'dealing' ? '🤝 In Dealing' : '✅ Sold'}
                          </span>
                          {property.saleRequest?.requested && (
                            <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, background: '#dbeafe', color: '#1e40af' }}>
                              📋 Sale Request Pending
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                          <button onClick={() => navigate(`/edit-property/${property._id}`)} style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => navigate(`/property/${property._id}`)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                            👁 View
                          </button>
                          {/* Status change: if dealing and deal fell through, owner can set back to available */}
                          {property.status === 'dealing' && (
                            <button onClick={(e) => { e.stopPropagation(); handleStatusChange(property._id, 'available'); }} style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                              🔄 Mark Available
                            </button>
                          )}
                          {/* Request sale: if property is in dealing, owner can request admin to mark as sold */}
                          {property.status === 'dealing' && !property.saleRequest?.requested && (
                            <button onClick={(e) => { e.stopPropagation(); setSaleModal(property); setSaleForm({ buyerName: '', buyerPhone: '', salePrice: String(property.price) }); }} style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                              🏷️ Request Sale Completion
                            </button>
                          )}
                        </div>

                        {property.verificationStatus === 'rejected' && (
                          <div className="my-property-rejection">
                            ❌ This property was not approved by admin. It is not visible to other users.
                          </div>
                        )}
                        {property.verificationStatus === 'pending' && (
                          <div className="my-property-pending">
                            ⏳ Waiting for admin approval. Will be visible once approved.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sale Request Modal */}
      {saleModal && (
        <div className="modal-overlay" onClick={() => setSaleModal(null)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏷️ Request Sale Completion</h2>
            </div>
            <div className="modal-body">
              <p>Submit sale details to admin. Once approved, this property will be marked as sold.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Buyer Name</label>
                  <input type="text" value={saleForm.buyerName} onChange={(e) => setSaleForm({ ...saleForm, buyerName: e.target.value })} placeholder="Enter buyer's name" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Buyer Phone</label>
                  <input type="tel" value={saleForm.buyerPhone} onChange={(e) => setSaleForm({ ...saleForm, buyerPhone: e.target.value })} placeholder="Enter buyer's phone" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Sale Price (PKR)</label>
                  <input type="number" value={saleForm.salePrice} onChange={(e) => setSaleForm({ ...saleForm, salePrice: e.target.value })} placeholder="Enter sale price" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSaleModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRequestSale}>Submit Sale Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
