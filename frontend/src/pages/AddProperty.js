import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../utils/api';
import '../styles/AddProperty.css';

const AddProperty = () => {
  const [formData, setFormData] = useState({
    title: 'Plot',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    areaValue: '',
    areaUnit: 'Marla',
    city: '',
    area: '',
    address: '',
    price: '',
    description: '',
    amenities: '',
  });
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Please login first to add a property');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Clear previous errors
    setError('');
    
    // Validate file count
    if (files.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    // Validate file sizes
    const maxSize = 5 * 1024 * 1024; // 5MB
    const invalidFiles = files.filter(f => f.size > maxSize);
    if (invalidFiles.length > 0) {
      setError(`Some files exceed 5MB limit: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setImages(files);
    setSuccess(`${files.length} image(s) selected`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setError('');
    if (files.length > 5) {
      setError('Maximum 5 documents allowed');
      return;
    }
    const maxSize = 10 * 1024 * 1024;
    const invalidFiles = files.filter(f => f.size > maxSize);
    if (invalidFiles.length > 0) {
      setError(`Some files exceed 10MB limit: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }
    setDocuments(files);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.ownerName.trim()) errors.ownerName = 'Owner name is required';
    if (!formData.ownerPhone.trim()) errors.ownerPhone = 'Phone number is required';
    if (!formData.areaValue) errors.areaValue = 'Area value is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.area.trim()) errors.area = 'Area/Neighborhood is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.price) errors.price = 'Price is required';

    if (formData.areaValue && (isNaN(formData.areaValue) || formData.areaValue <= 0)) {
      errors.areaValue = 'Area value must be a positive number';
    }

    if (formData.price && (isNaN(formData.price) || formData.price <= 0)) {
      errors.price = 'Price must be a positive number';
    }

    if (formData.ownerEmail && !isValidEmail(formData.ownerEmail)) {
      errors.ownerEmail = 'Invalid email format';
    }

    if (images.length === 0) {
      errors.images = 'Please upload at least one image';
    }

    if (documents.length === 0) {
      errors.documents = 'Please upload government verified property documents (PDF or images)';
    }

    return errors;
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors below');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title);
      formDataToSend.append('ownerName', formData.ownerName);
      formDataToSend.append('ownerEmail', formData.ownerEmail);
      formDataToSend.append('ownerPhone', formData.ownerPhone);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);

      // Area object
      const area = {
        value: parseFloat(formData.areaValue),
        unit: formData.areaUnit,
      };
      formDataToSend.append('area', JSON.stringify(area));

      // Location object
      const location = {
        city: formData.city,
        area: formData.area,
        address: formData.address,
      };
      formDataToSend.append('location', JSON.stringify(location));

      // Amenities array
      const amenities = formData.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a);
      formDataToSend.append('amenities', JSON.stringify(amenities));

      // Images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      // Documents
      documents.forEach((doc) => {
        formDataToSend.append('documents', doc);
      });

      await propertyAPI.create(formDataToSend);
      
      const userRole = localStorage.getItem('userRole');
      const msg = userRole === 'admin' 
        ? 'Property added successfully! (Auto-verified)'
        : 'Property added successfully! It will be visible after admin approval.';
      
      setSuccess(msg);
      
      // Clear form
      setFormData({
        title: 'Plot',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        areaValue: '',
        areaUnit: 'Marla',
        city: '',
        area: '',
        address: '',
        price: '',
        description: '',
        amenities: '',
      });
      setImages([]);
      setDocuments([]);
      setFieldErrors({});

      // Store message for the dashboard to show
      localStorage.setItem('successMessage', msg);

      setTimeout(() => {
        navigate(userRole === 'admin' ? '/admin/dashboard' : '/');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error creating property';
      console.error('Property creation error:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-property-container">
      <div className="add-property-form">
        <div className="add-property-header">
          <h1>
            <i className="fas fa-home"></i> Add New Property
          </h1>
          <p>Fill in the details below to add a new property to the system</p>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError('')}
              aria-label="Close"
            ></button>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success alert-dismissible fade show">
            <i className="fas fa-check-circle"></i>
            <span>{success}</span>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccess('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            {/* Property Title */}
            <div className="form-group">
              <label className={fieldErrors.title ? 'has-error' : ''}>
                <i className="fas fa-list"></i> Property Type <span className="required"></span>
              </label>
              <select 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required
                className={fieldErrors.title ? 'form-control error' : 'form-control'}
              >
                <option value="Plot">Plot</option>
                <option value="House">House</option>
                <option value="Land">Land</option>
                <option value="Apartment">Apartment</option>
                <option value="Commercial">Commercial</option>
              </select>
              {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
            </div>

            {/* Owner Information Section */}
            <h3 className="form-section-title">
              <i className="fas fa-user"></i> Owner Information
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className={fieldErrors.ownerName ? 'has-error' : ''}>
                  <i className="fas fa-user-circle"></i> Owner Name <span className="required"></span>
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Enter owner's full name"
                  className={fieldErrors.ownerName ? 'form-control error' : 'form-control'}
                  required
                />
                {fieldErrors.ownerName && <span className="field-error">{fieldErrors.ownerName}</span>}
              </div>

              <div className="form-group">
                <label className={fieldErrors.ownerPhone ? 'has-error' : ''}>
                  <i className="fas fa-phone"></i> Owner Phone <span className="required"></span>
                </label>
                <input
                  type="tel"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  placeholder="e.g., 03XX-XXXXXXX"
                  className={fieldErrors.ownerPhone ? 'form-control error' : 'form-control'}
                  required
                />
                {fieldErrors.ownerPhone && <span className="field-error">{fieldErrors.ownerPhone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className={fieldErrors.ownerEmail ? 'has-error' : ''}>
                <i className="fas fa-envelope"></i> Owner Email
              </label>
              <input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleChange}
                placeholder="owner@example.com (optional)"
                className={fieldErrors.ownerEmail ? 'form-control error' : 'form-control'}
              />
              {fieldErrors.ownerEmail && <span className="field-error">{fieldErrors.ownerEmail}</span>}
            </div>

            {/* Property Details Section */}
            <h3 className="form-section-title">
              <i className="fas fa-info-circle"></i> Property Details
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className={fieldErrors.areaValue ? 'has-error' : ''}>
                  <i className="fas fa-expand"></i> Area Value <span className="required"></span>
                </label>
                <input
                  type="number"
                  name="areaValue"
                  value={formData.areaValue}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  className={fieldErrors.areaValue ? 'form-control error' : 'form-control'}
                  required
                />
                {fieldErrors.areaValue && <span className="field-error">{fieldErrors.areaValue}</span>}
              </div>

              <div className="form-group">
                <label className={fieldErrors.areaUnit ? 'has-error' : ''}>
                  <i className="fas fa-ruler"></i> Area Unit <span className="required"></span>
                </label>
                <select 
                  name="areaUnit" 
                  value={formData.areaUnit} 
                  onChange={handleChange} 
                  required
                  className={fieldErrors.areaUnit ? 'form-control error' : 'form-control'}
                >
                  <option value="Marla">Marla</option>
                  <option value="Kanal">Kanal</option>
                  <option value="Acre">Acre</option>
                  <option value="Square Feet">Square Feet</option>
                  <option value="Square Meters">Square Meters</option>
                </select>
                {fieldErrors.areaUnit && <span className="field-error">{fieldErrors.areaUnit}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className={fieldErrors.price ? 'has-error' : ''}>
                <i className="fas fa-money-bill-wave"></i> Price (PKR) <span className="required"></span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 5000000"
                className={fieldErrors.price ? 'form-control error' : 'form-control'}
                required
              />
              {fieldErrors.price && <span className="field-error">{fieldErrors.price}</span>}
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-file-alt"></i> Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the property features and amenities..."
                className="form-control"
              ></textarea>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-tags"></i> Amenities (comma-separated)
              </label>
              <input
                type="text"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                placeholder="e.g., Parking, Garden, Swimming Pool, Security Gate"
                className="form-control"
              />
              <span className="form-help">Separate each amenity with a comma</span>
            </div>

            {/* Location Information Section */}
            <h3 className="form-section-title">
              <i className="fas fa-map-marker-alt"></i> Location
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className={fieldErrors.city ? 'has-error' : ''}>
                  <i className="fas fa-city"></i> City <span className="required"></span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., Lahore, Karachi"
                  className={fieldErrors.city ? 'form-control error' : 'form-control'}
                  required
                />
                {fieldErrors.city && <span className="field-error">{fieldErrors.city}</span>}
              </div>

              <div className="form-group">
                <label className={fieldErrors.area ? 'has-error' : ''}>
                  <i className="fas fa-location-dot"></i> Area/Neighborhood <span className="required"></span>
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g., Defence, Gulberg"
                  className={fieldErrors.area ? 'form-control error' : 'form-control'}
                  required
                />
                {fieldErrors.area && <span className="field-error">{fieldErrors.area}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className={fieldErrors.address ? 'has-error' : ''}>
                <i className="fas fa-address-card"></i> Complete Address <span className="required"></span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter the complete address with street number, phase, sector, etc."
                className={fieldErrors.address ? 'form-control error' : 'form-control'}
                required
              ></textarea>
              {fieldErrors.address && <span className="field-error">{fieldErrors.address}</span>}
            </div>

            {/* Images Section */}
            <h3 className="form-section-title">
              <i className="fas fa-images"></i> Property Images
            </h3>
            
            <div className="form-group">
              <label className={fieldErrors.images ? 'has-error' : ''}>
                Property Images (up to 10, max 5MB each) <span className="required"></span>
              </label>
              <div className="image-input-wrapper">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  id="imageInput"
                />
                <label htmlFor="imageInput" className="image-input-label">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <div>Click to upload or drag and drop</div>
                  <span className="image-input-hint">PNG, JPG, GIF up to 5MB (maximum 10 images)</span>
                </label>
              </div>
              {images.length > 0 && (
                <div className="image-count">
                  <i className="fas fa-check-circle"></i> {images.length} image(s) selected
                </div>
              )}
              {fieldErrors.images && <span className="field-error">{fieldErrors.images}</span>}
            </div>

            {/* Government Documents Section */}
            <h3 className="form-section-title">
              <i className="fas fa-file-contract"></i> Government Verified Documents
            </h3>
            
            <div className="form-group">
              <label className={fieldErrors.documents ? 'has-error' : ''}>
                Property Documents (PDF or Images, up to 5 files, max 10MB each) <span className="required"></span>
              </label>
              <div className="image-input-wrapper">
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={handleDocumentChange}
                  id="documentInput"
                />
                <label htmlFor="documentInput" className="image-input-label">
                  <i className="fas fa-file-upload"></i>
                  <div>Upload Government Verified Documents</div>
                  <span className="image-input-hint">Registry papers, ownership deed, NOC, etc. (PDF or Images up to 10MB)</span>
                </label>
              </div>
              {documents.length > 0 && (
                <div className="image-count">
                  <i className="fas fa-check-circle"></i> {documents.length} document(s) selected: {documents.map(d => d.name).join(', ')}
                </div>
              )}
              {fieldErrors.documents && <span className="field-error">{fieldErrors.documents}</span>}
            </div>

            {/* Submit Buttons */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="form-btn btn-submit" 
                disabled={loading}
              >
                <i className="fas fa-plus-circle"></i>
                {loading ? 'Creating Property...' : 'Create Property'}
              </button>
              <button 
                type="button" 
                className="form-btn btn-cancel"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                <i className="fas fa-times-circle"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
