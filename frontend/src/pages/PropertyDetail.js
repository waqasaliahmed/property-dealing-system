import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyAPI } from '../utils/api';
import '../styles/PropertyDetail.css';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    documents: false,
    ownership: false,
    map: false,
    contact: false,
  });
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '', inquiryType: 'general' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getById(id);
      setProperty(response.data.property);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const nextImage = () => {
    if (property?.images?.length) {
      setCurrentImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images?.length) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="property-details-container">
        <div className="details-wrapper">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading property details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="property-details-container">
        <div className="details-wrapper">
          <div className="details-card">
            <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>Property not found.</p>
            <button className="back-button" onClick={() => navigate('/')}>
              ← Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = property.images?.[currentImageIndex]?.url || null;
  const imageUrl = currentImage 
    ? (currentImage.startsWith('http') ? currentImage : `http://localhost:5000${currentImage}`)
    : 'https://via.placeholder.com/800x600?text=No+Image';

  return (
    <div className="property-details-container">
      <div className="details-wrapper">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="details-grid">
          {/* Image Gallery */}
          <div className="image-gallery">
            <div className="main-image-container">
              <img src={imageUrl} alt="Property" className="main-image" />
              {property.images && property.images.length > 1 && (
                <>
                  <div className="image-controls">
                    <button className="image-btn" onClick={prevImage}>← Prev</button>
                    <button className="image-btn" onClick={nextImage}>Next →</button>
                  </div>
                  <div className="image-counter">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </>
              )}
            </div>
            
            {property.images && property.images.length > 1 && (
              <div className="image-thumbnails">
                {property.images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => selectImage(index)}
                  >
                    <img 
                      src={img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`}
                      alt={`Thumbnail ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div className="details-panel">
            {/* Title & Price */}
            <div className="details-card">
              <div className="property-header">
                <div className="property-title-section">
                  <h1>{property.ownerName}</h1>
                  <span className="property-type-badge">{property.title}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="property-price">Rs. {property.price.toLocaleString()}</p>
                  {property.status && property.status !== 'available' && (
                    <div className={`property-deal-status status-${property.status}`}>
                      {property.status === 'dealing' ? '🤝 In Dealing' : '✅ Sold'}
                    </div>
                  )}
                  <div className={`verification-status status-${property.verificationStatus}`}>
                    {property.verificationStatus.charAt(0).toUpperCase() + property.verificationStatus.slice(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Details */}
            <div className="details-card">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">📍 Location</div>
                  <div className="info-value">
                    {property.location.city}, {property.location.area}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">📏 Area</div>
                  <div className="info-value">
                    {property.area.value} {property.area.unit}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">🏘️ Address</div>
                  <div className="info-value">
                    {property.location.address}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">💰 Price/Unit</div>
                  <div className="info-value highlighted">
                    Rs. {(property.price / property.area.value).toLocaleString()}/{property.area.unit}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="details-card">
                <div className="description-section">
                  <h3>📝 Description</h3>
                  <p className="description-text">{property.description}</p>
                </div>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="details-card">
                <div className="amenities-section">
                  <h3>⭐ Amenities</h3>
                  <ul className="amenities-list">
                    {property.amenities.map((amenity, index) => (
                      <li key={index}>✓ {amenity}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Owner/Contact Info */}
            <div className="contact-card">
              <h3>Owner Contact Information</h3>
              <div className="contact-item">
                <span className="contact-label">Owner Name:</span>
                <span className="contact-value">{property.ownerName}</span>
              </div>
              {property.ownerEmail && (
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <span className="contact-value">{property.ownerEmail}</span>
                </div>
              )}
              {property.ownerPhone && (
                <div className="contact-item">
                  <span className="contact-label">Phone:</span>
                  <span className="contact-value">{property.ownerPhone}</span>
                </div>
              )}
              <div className="contact-buttons">
                {property.ownerEmail && (
                  <a 
                    href={`mailto:${property.ownerEmail}`} 
                    className="contact-btn"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    📧 Email Owner
                  </a>
                )}
                {property.ownerPhone && (
                  <a 
                    href={`tel:${property.ownerPhone}`}
                    className="contact-btn"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Call Owner
                  </a>
                )}
              </div>

              {/* Inquiry Contact Form */}
              {isAuthenticated && property.status === 'available' && userRole !== 'admin' && (
                <div className="inquiry-section" style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                  <button 
                    className="section-toggle"
                    onClick={() => toggleSection('contact')}
                    style={{ width: '100%', background: '#3b82f6', color: '#fff', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}
                  >
                    📩 Send Inquiry to Owner {expandedSections.contact ? '▼' : '▶'}
                  </button>
                  {expandedSections.contact && (
                    <div style={{ marginTop: '1rem' }}>
                      {contactSuccess && <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>{contactSuccess}</div>}
                      {contactError && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>{contactError}</div>}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <input type="text" placeholder="Your Name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                        <input type="email" placeholder="Your Email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                        <input type="tel" placeholder="Your Phone" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                        <select value={contactForm.inquiryType} onChange={(e) => setContactForm({ ...contactForm, inquiryType: e.target.value })} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                          <option value="general">General Inquiry</option>
                          <option value="viewing">Request Viewing</option>
                          <option value="purchase">Purchase Interest</option>
                        </select>
                        <textarea placeholder="Your message (min 10 characters)" value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} rows={3} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                        <button 
                          onClick={async () => {
                            setContactError(''); setContactSuccess('');
                            if (!contactForm.name || !contactForm.email || !contactForm.phone || contactForm.message.length < 10) {
                              setContactError('Please fill all fields (message min 10 chars)');
                              return;
                            }
                            setContactLoading(true);
                            try {
                              await propertyAPI.contactOwner(id, contactForm);
                              setContactSuccess('Inquiry sent successfully! Property status changed to dealing.');
                              setContactForm({ name: '', email: '', phone: '', message: '', inquiryType: 'general' });
                              fetchProperty();
                            } catch (err) {
                              setContactError(err.response?.data?.message || 'Error sending inquiry');
                            } finally { setContactLoading(false); }
                          }}
                          disabled={contactLoading}
                          style={{ background: '#10b981', color: '#fff', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}
                        >
                          {contactLoading ? 'Sending...' : '📩 Send Inquiry'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {property.status === 'dealing' && (
                <div style={{ marginTop: '1rem', background: '#fef3c7', color: '#92400e', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
                  🤝 This property is currently in dealing
                </div>
              )}
              {property.status === 'sold' && (
                <div style={{ marginTop: '1rem', background: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
                  ✅ This property has been sold
                </div>
              )}
            </div>

            {/* Ownership History */}
            {property.ownershipHistory && property.ownershipHistory.length > 0 && (
              <div className="details-card expandable-section">
                <button 
                  className="section-toggle"
                  onClick={() => toggleSection('ownership')}
                >
                  <h3>👥 Ownership History {expandedSections.ownership ? '▼' : '▶'}</h3>
                </button>
                {expandedSections.ownership && (
                  <div className="section-content">
                    <div className="ownership-timeline">
                      {property.ownershipHistory.map((entry, index) => (
                        <div key={index} className="ownership-item">
                          <div className="ownership-date">{formatDate(entry.date)}</div>
                          <div className="ownership-details">
                            <p><strong>Owner:</strong> {entry.ownerName || 'N/A'}</p>
                            {entry.transactionType && (
                              <p><strong>Transaction:</strong> {entry.transactionType}</p>
                            )}
                            {entry.notes && (
                              <p><strong>Notes:</strong> {entry.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Documents/Registry Papers */}
            {property.documents && property.documents.length > 0 && (
              <div className="details-card expandable-section">
                <button 
                  className="section-toggle"
                  onClick={() => toggleSection('documents')}
                >
                  <h3>📄 Government Verified Documents {expandedSections.documents ? '▼' : '▶'}</h3>
                </button>
                {expandedSections.documents && (
                  <div className="section-content">
                    <div className="documents-list">
                      {property.documents.map((doc, index) => (
                        <div key={index} className="document-item">
                          <div className="document-info">
                            <div className="document-type">
                              📎 {doc.name || 'Document'}
                            </div>
                            {doc.uploadedAt && (
                              <div className="document-date">
                                {formatDate(doc.uploadedAt)}
                              </div>
                            )}
                          </div>
                          {doc.fileUrl && (
                            <a 
                              href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:5000${doc.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="document-btn"
                            >
                              📥 View/Download
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Google Map Location */}
            {property.location?.coordinates && (
              <div className="details-card expandable-section">
                <button 
                  className="section-toggle"
                  onClick={() => toggleSection('map')}
                >
                  <h3>🗺️ Location Map {expandedSections.map ? '▼' : '▶'}</h3>
                </button>
                {expandedSections.map && (
                  <div className="section-content">
                    <div className="map-container">
                      <iframe
                        title="Property Location Map"
                        width="100%"
                        height="400"
                        style={{ border: 0, borderRadius: '8px' }}
                        loading="lazy"
                        allowFullScreen=""
                        src={`https://www.google.com/maps/embed/v1/place?q=${property.location.coordinates.lat},${property.location.coordinates.lng}&key=AIzaSyBFw0Qbyay-jhXSbF4ZV3A_T4-Zqii3G7c`}
                      />
                      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                        📍 {property.location.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Additional Info */}
            <div className="details-card">
              <h3>ℹ️ Additional Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Listed:</span>
                  <span className="info-value">{formatDate(property.createdAt)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Updated:</span>
                  <span className="info-value">{formatDate(property.updatedAt)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`info-value status-badge status-${property.verificationStatus}`}>
                    {property.verificationStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
