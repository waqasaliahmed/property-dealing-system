import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../utils/api';
import PropertyCard from '../components/PropertyCard';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [admin] = useState({
    fullName: localStorage.getItem('fullName'),
    profilePicture: localStorage.getItem('profilePicture'),
    email: localStorage.getItem('email') || 'admin@property.com'
  });
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingVerification: 0,
    verifiedProperties: 0,
    inDealing: 0,
    sold: 0,
    saleRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

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
    if (!token || userRole !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAllProperties();
  }, [navigate]);

  const fetchAllProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getAll({ all: 'true' });
      const allProperties = response.data.properties || [];
      setProperties(allProperties);
      
      setStats({
        totalProperties: allProperties.length,
        pendingVerification: allProperties.filter(p => p.verificationStatus === 'pending').length,
        verifiedProperties: allProperties.filter(p => p.verificationStatus === 'verified').length,
        inDealing: allProperties.filter(p => p.status === 'dealing').length,
        sold: allProperties.filter(p => p.status === 'sold').length,
        saleRequests: allProperties.filter(p => p.saleRequest?.requested).length,
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await propertyAPI.verify(id, status);
      setSuccessMessage(`Property ${status} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchAllProperties();
    } catch (error) {
      console.error('Error verifying property:', error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await propertyAPI.updateStatus(id, status);
      setSuccessMessage(`Property marked as ${status}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchAllProperties();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const confirmDelete = (property) => {
    setDeleteConfirm(property);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await propertyAPI.delete(deleteConfirm._id);
      setDeleteConfirm(null);
      setSuccessMessage('Property deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchAllProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const handleApproveSale = async (id) => {
    try {
      await propertyAPI.approveSale(id);
      setSuccessMessage('Sale approved! Property marked as sold.');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchAllProperties();
    } catch (error) {
      console.error('Error approving sale:', error);
    }
  };

  const handleRejectSale = async (id) => {
    try {
      await propertyAPI.rejectSale(id);
      setSuccessMessage('Sale request rejected.');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchAllProperties();
    } catch (error) {
      console.error('Error rejecting sale:', error);
    }
  };

  const getFilteredProperties = () => {
    let filtered = properties;
    if (filter === 'pending') filtered = filtered.filter(p => p.verificationStatus === 'pending');
    else if (filter === 'verified') filtered = filtered.filter(p => p.verificationStatus === 'verified');
    else if (filter === 'rejected') filtered = filtered.filter(p => p.verificationStatus === 'rejected');
    else if (filter === 'dealing') filtered = filtered.filter(p => p.status === 'dealing');
    else if (filter === 'sold') filtered = filtered.filter(p => p.status === 'sold');
    else if (filter === 'sale-requests') filtered = filtered.filter(p => p.saleRequest?.requested);

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.ownerName?.toLowerCase().includes(search) ||
        p.location?.city?.toLowerCase().includes(search) ||
        p.location?.area?.toLowerCase().includes(search) ||
        p.title?.toLowerCase().includes(search)
      );
    }
    return filtered;
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
            <h1>Welcome back, {admin.fullName} 👋</h1>
            <p className="subtitle">Here's what's happening with your properties today.</p>
          </div>
          <div className="welcome-actions">
            <button className="btn btn-primary btn-add" onClick={() => navigate('/admin/add-property')}>
              + Add New Property
            </button>
            <button className="btn btn-secondary btn-add" onClick={() => navigate('/properties')}>
              🏘️ All Properties
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card total" onClick={() => setFilter('all')}>
            <div className="stat-icon">🏘️</div>
            <div className="stat-info">
              <div className="stat-number">{stats.totalProperties}</div>
              <div className="stat-label">Total Properties</div>
            </div>
          </div>
          <div className="stat-card pending" onClick={() => setFilter('pending')}>
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <div className="stat-number">{stats.pendingVerification}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card verified" onClick={() => setFilter('verified')}>
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-number">{stats.verifiedProperties}</div>
              <div className="stat-label">Verified</div>
            </div>
          </div>
          <div className="stat-card dealing" onClick={() => setFilter('dealing')}>
            <div className="stat-icon">🤝</div>
            <div className="stat-info">
              <div className="stat-number">{stats.inDealing}</div>
              <div className="stat-label">In Dealing</div>
            </div>
          </div>
          <div className="stat-card sold" onClick={() => setFilter('sold')}>
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <div className="stat-number">{stats.sold}</div>
              <div className="stat-label">Sold</div>
            </div>
          </div>
          {stats.saleRequests > 0 && (
            <div className="stat-card dealing" onClick={() => setFilter('sale-requests')} style={{ border: '2px solid #f59e0b' }}>
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <div className="stat-number">{stats.saleRequests}</div>
                <div className="stat-label">Sale Requests</div>
              </div>
            </div>
          )}
        </div>

        {/* ===== Sale Requests Section ===== */}
        {properties.filter(p => p.saleRequest?.requested).length > 0 && (
          <div className="pending-approvals-section" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div className="pending-section-header">
              <div className="pending-title-row">
                <span className="pending-title-icon">📋</span>
                <h2>Sale Completion Requests ({properties.filter(p => p.saleRequest?.requested).length})</h2>
              </div>
              <p className="pending-subtitle">Property owners have requested these properties to be marked as sold.</p>
            </div>
            <div className="pending-list">
              {properties.filter(p => p.saleRequest?.requested).map(property => {
                const imageUrl = property.images?.[0]?.url 
                  ? (property.images[0].url.startsWith('http') ? property.images[0].url : `http://localhost:5000${property.images[0].url}`)
                  : 'https://via.placeholder.com/100x80/e2e8f0/64748b?text=No+Image';
                const formatPriceLocal = (price) => {
                  if (price >= 10000000) return `Rs. ${(price / 10000000).toFixed(1)} Crore`;
                  if (price >= 100000) return `Rs. ${(price / 100000).toFixed(1)} Lac`;
                  return `Rs. ${price?.toLocaleString()}`;
                };
                return (
                  <div key={property._id} className="pending-item">
                    <img src={imageUrl} alt={property.title} className="pending-item-image" />
                    <div className="pending-item-info">
                      <h3 className="pending-item-title">{property.ownerName}'s {property.title}</h3>
                      <div className="pending-item-meta">
                        <span>📍 {property.location?.city}, {property.location?.area}</span>
                        <span>📐 {property.area?.value} {property.area?.unit}</span>
                        <span className="pending-item-price">{formatPriceLocal(property.price)}</span>
                      </div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
                        {property.saleRequest?.buyerName && <span><strong>Buyer:</strong> {property.saleRequest.buyerName} </span>}
                        {property.saleRequest?.buyerPhone && <span>| <strong>Phone:</strong> {property.saleRequest.buyerPhone} </span>}
                        {property.saleRequest?.salePrice && <span>| <strong>Sale Price:</strong> {formatPriceLocal(property.saleRequest.salePrice)}</span>}
                      </div>
                    </div>
                    <div className="pending-item-actions">
                      <button className="btn-approve" onClick={() => handleApproveSale(property._id)}>
                        ✓ Approve Sale
                      </button>
                      <button className="btn-reject-action" onClick={() => handleRejectSale(property._id)}>
                        ✗ Reject
                      </button>
                      <button className="btn-view-small" onClick={() => navigate(`/property/${property._id}`)}>
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== Pending Approvals Section ===== */}
        {properties.filter(p => p.verificationStatus === 'pending').length > 0 && (
          <div className="pending-approvals-section">
            <div className="pending-section-header">
              <div className="pending-title-row">
                <span className="pending-title-icon">⏳</span>
                <h2>Pending Approvals ({properties.filter(p => p.verificationStatus === 'pending').length})</h2>
              </div>
              <p className="pending-subtitle">These properties are waiting for your review. Approve or reject them below.</p>
            </div>
            <div className="pending-list">
              {properties.filter(p => p.verificationStatus === 'pending').map(property => {
                const imageUrl = property.images?.[0]?.url 
                  ? (property.images[0].url.startsWith('http') ? property.images[0].url : `http://localhost:5000${property.images[0].url}`)
                  : 'https://via.placeholder.com/100x80/e2e8f0/64748b?text=No+Image';
                const formatPrice = (price) => {
                  if (price >= 10000000) return `Rs. ${(price / 10000000).toFixed(1)} Crore`;
                  if (price >= 100000) return `Rs. ${(price / 100000).toFixed(1)} Lac`;
                  return `Rs. ${price?.toLocaleString()}`;
                };
                return (
                  <div key={property._id} className="pending-item">
                    <img src={imageUrl} alt={property.title} className="pending-item-image" />
                    <div className="pending-item-info">
                      <h3 className="pending-item-title">{property.ownerName}'s {property.title}</h3>
                      <div className="pending-item-meta">
                        <span>📍 {property.location?.city}, {property.location?.area}</span>
                        <span>📐 {property.area?.value} {property.area?.unit}</span>
                        <span className="pending-item-price">{formatPrice(property.price)}</span>
                      </div>
                      {property.description && (
                        <p className="pending-item-desc">{property.description.substring(0, 100)}...</p>
                      )}
                    </div>
                    <div className="pending-item-actions">
                      <button className="btn-approve" onClick={() => handleVerify(property._id, 'verified')}>
                        ✓ Approve
                      </button>
                      <button className="btn-reject-action" onClick={() => handleVerify(property._id, 'rejected')}>
                        ✗ Reject
                      </button>
                      <button className="btn-view-small" onClick={() => navigate(`/property/${property._id}`)}>
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="search-filter-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by owner, city, area, or property type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm('')}>✕</button>
            )}
          </div>

          <div className="filter-buttons">
            {['all', 'pending', 'verified', 'rejected', 'dealing', 'sold', 'sale-requests'].map(f => (
              <button 
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'sale-requests' ? 'Sale Requests' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
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
                <span className="history-card-number">{properties.filter(p => p.verificationStatus === 'verified' && p.status === 'available').length}</span>
                <span className="history-card-label">Available for Sale</span>
              </div>
            </div>
            <div className="history-card history-dealing">
              <div className="history-card-icon">🤝</div>
              <div className="history-card-info">
                <span className="history-card-number">{stats.inDealing}</span>
                <span className="history-card-label">Currently in Dealing</span>
              </div>
            </div>
            <div className="history-card history-sold">
              <div className="history-card-icon">✅</div>
              <div className="history-card-info">
                <span className="history-card-number">{stats.sold}</span>
                <span className="history-card-label">Properties Sold</span>
              </div>
            </div>
            <div className="history-card history-rejected">
              <div className="history-card-icon">🚫</div>
              <div className="history-card-info">
                <span className="history-card-number">{properties.filter(p => p.verificationStatus === 'rejected').length}</span>
                <span className="history-card-label">Rejected</span>
              </div>
            </div>
          </div>
          {/* Sold Properties List */}
          {properties.filter(p => p.status === 'sold').length > 0 && (
            <div className="history-list">
              <h3 className="history-list-title">🏷️ Sold Properties</h3>
              {properties.filter(p => p.status === 'sold').map(property => (
                <div key={property._id} className="history-list-item">
                  <div className="history-list-info">
                    <span className="history-list-name">{property.ownerName}'s {property.title}</span>
                    <span className="history-list-location">📍 {property.location?.city}, {property.location?.area}</span>
                  </div>
                  <span className="history-list-price">Rs. {property.price?.toLocaleString()}</span>
                  <span className="history-list-badge sold-badge">Sold</span>
                  <button className="btn-view-small" onClick={() => navigate(`/property/${property._id}`)}>View</button>
                  <button className="btn-delete-small" onClick={() => confirmDelete(property)}>🗑</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Properties Grid */}
        <div className="properties-section">
          <div className="section-header">
            <h2>All Properties ({getFilteredProperties().length})</h2>
          </div>
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading properties...</p>
            </div>
          ) : getFilteredProperties().length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏠</div>
              <h3>No properties found</h3>
              <p>Try adjusting your filters or add a new property</p>
              <button className="btn btn-primary" onClick={() => navigate('/admin/add-property')}>
                Add Property
              </button>
            </div>
          ) : (
            <div className="properties-grid">
              {getFilteredProperties().map(property => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  isAdmin={true}
                  onVerify={handleVerify}
                  onDelete={confirmDelete}
                  onView={() => navigate(`/property/${property._id}`)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Confirm Delete</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this property?</p>
              <div className="delete-preview">
                <p><strong>Owner:</strong> {deleteConfirm.ownerName}</p>
                <p><strong>Type:</strong> {deleteConfirm.title}</p>
                <p><strong>Location:</strong> {deleteConfirm.location?.city}, {deleteConfirm.location?.area}</p>
                <p><strong>Price:</strong> Rs. {deleteConfirm.price?.toLocaleString()}</p>
              </div>
              <p className="delete-warning">⚠️ This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete Property</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
