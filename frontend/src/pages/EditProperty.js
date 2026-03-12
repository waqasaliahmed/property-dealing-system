import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyAPI } from '../utils/api';
import '../styles/AddProperty.css';

const EditProperty = () => {
  const { id } = useParams();
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
  const [existingImages, setExistingImages] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newDocuments, setNewDocuments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const fetchProperty = useCallback(async () => {
    try {
      setFetching(true);
      const response = await propertyAPI.getById(id);
      const p = response.data.property;

      // Check ownership
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'admin' && p.createdBy?._id !== userId && p.createdBy !== userId) {
        setError('You are not authorized to edit this property');
        setTimeout(() => navigate(-1), 2000);
        return;
      }

      setFormData({
        title: p.title || 'Plot',
        ownerName: p.ownerName || '',
        ownerEmail: p.ownerEmail || '',
        ownerPhone: p.ownerPhone || '',
        areaValue: p.area?.value || '',
        areaUnit: p.area?.unit || 'Marla',
        city: p.location?.city || '',
        area: p.location?.area || '',
        address: p.location?.address || '',
        price: p.price || '',
        description: p.description || '',
        amenities: p.amenities?.join(', ') || '',
      });
      setExistingImages(p.images || []);
      setExistingDocuments(p.documents || []);
    } catch (err) {
      setError('Error loading property');
    } finally {
      setFetching(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProperty();
  }, [navigate, fetchProperty]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setError('');
    if (files.length > 10) { setError('Maximum 10 images allowed'); return; }
    const maxSize = 5 * 1024 * 1024;
    const invalidFiles = files.filter(f => f.size > maxSize);
    if (invalidFiles.length > 0) {
      setError(`Some files exceed 5MB limit: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }
    setNewImages(files);
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setError('');
    if (files.length > 5) { setError('Maximum 5 documents allowed'); return; }
    const maxSize = 10 * 1024 * 1024;
    const invalidFiles = files.filter(f => f.size > maxSize);
    if (invalidFiles.length > 0) {
      setError(`Some files exceed 10MB limit: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }
    setNewDocuments(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const errors = {};
    if (!formData.ownerName.trim()) errors.ownerName = 'Owner name is required';
    if (!formData.ownerPhone.trim()) errors.ownerPhone = 'Phone number is required';
    if (!formData.areaValue) errors.areaValue = 'Area value is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.area.trim()) errors.area = 'Area/Neighborhood is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.price) errors.price = 'Price is required';

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
      formDataToSend.append('area', JSON.stringify({ value: parseFloat(formData.areaValue), unit: formData.areaUnit }));
      formDataToSend.append('location', JSON.stringify({ city: formData.city, area: formData.area, address: formData.address }));
      const amenities = formData.amenities.split(',').map(a => a.trim()).filter(a => a);
      formDataToSend.append('amenities', JSON.stringify(amenities));

      newImages.forEach((img) => formDataToSend.append('images', img));
      newDocuments.forEach((doc) => formDataToSend.append('documents', doc));

      await propertyAPI.update(id, formDataToSend);

      const userRole = localStorage.getItem('userRole');
      const msg = userRole === 'admin'
        ? 'Property updated successfully!'
        : 'Property updated! It will be re-reviewed by admin.';
      setSuccess(msg);
      localStorage.setItem('successMessage', msg);

      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating property');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="add-property-container">
        <div className="add-property-form">
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading property...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-property-container">
      <div className="add-property-form">
        <div className="add-property-header">
          <h1><i className="fas fa-edit"></i> Edit Property</h1>
          <p>Update the property details below. Changes will require admin re-approval.</p>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
            <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible fade show">
            <i className="fas fa-check-circle"></i>
            <span>{success}</span>
            <button type="button" className="btn-close" onClick={() => setSuccess('')} aria-label="Close"></button>
          </div>
        )}

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><i className="fas fa-list"></i> Property Type <span className="required"></span></label>
              <select name="title" value={formData.title} onChange={handleChange} required className="form-control">
                <option value="Plot">Plot</option>
                <option value="House">House</option>
                <option value="Land">Land</option>
                <option value="Apartment">Apartment</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <h3 className="form-section-title"><i className="fas fa-user"></i> Owner Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label className={fieldErrors.ownerName ? 'has-error' : ''}><i className="fas fa-user-circle"></i> Owner Name <span className="required"></span></label>
                <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} className={fieldErrors.ownerName ? 'form-control error' : 'form-control'} required />
                {fieldErrors.ownerName && <span className="field-error">{fieldErrors.ownerName}</span>}
              </div>
              <div className="form-group">
                <label className={fieldErrors.ownerPhone ? 'has-error' : ''}><i className="fas fa-phone"></i> Owner Phone <span className="required"></span></label>
                <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} className={fieldErrors.ownerPhone ? 'form-control error' : 'form-control'} required />
                {fieldErrors.ownerPhone && <span className="field-error">{fieldErrors.ownerPhone}</span>}
              </div>
            </div>
            <div className="form-group">
              <label><i className="fas fa-envelope"></i> Owner Email</label>
              <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleChange} className="form-control" />
            </div>

            <h3 className="form-section-title"><i className="fas fa-info-circle"></i> Property Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label className={fieldErrors.areaValue ? 'has-error' : ''}><i className="fas fa-expand"></i> Area Value <span className="required"></span></label>
                <input type="number" name="areaValue" value={formData.areaValue} onChange={handleChange} className={fieldErrors.areaValue ? 'form-control error' : 'form-control'} required />
                {fieldErrors.areaValue && <span className="field-error">{fieldErrors.areaValue}</span>}
              </div>
              <div className="form-group">
                <label><i className="fas fa-ruler"></i> Area Unit <span className="required"></span></label>
                <select name="areaUnit" value={formData.areaUnit} onChange={handleChange} required className="form-control">
                  <option value="Marla">Marla</option>
                  <option value="Kanal">Kanal</option>
                  <option value="Acre">Acre</option>
                  <option value="Square Feet">Square Feet</option>
                  <option value="Square Meters">Square Meters</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className={fieldErrors.price ? 'has-error' : ''}><i className="fas fa-money-bill-wave"></i> Price (PKR) <span className="required"></span></label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className={fieldErrors.price ? 'form-control error' : 'form-control'} required />
              {fieldErrors.price && <span className="field-error">{fieldErrors.price}</span>}
            </div>
            <div className="form-group">
              <label><i className="fas fa-file-alt"></i> Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="form-control"></textarea>
            </div>
            <div className="form-group">
              <label><i className="fas fa-tags"></i> Amenities (comma-separated)</label>
              <input type="text" name="amenities" value={formData.amenities} onChange={handleChange} className="form-control" />
            </div>

            <h3 className="form-section-title"><i className="fas fa-map-marker-alt"></i> Location</h3>
            <div className="form-row">
              <div className="form-group">
                <label className={fieldErrors.city ? 'has-error' : ''}><i className="fas fa-city"></i> City <span className="required"></span></label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className={fieldErrors.city ? 'form-control error' : 'form-control'} required />
                {fieldErrors.city && <span className="field-error">{fieldErrors.city}</span>}
              </div>
              <div className="form-group">
                <label className={fieldErrors.area ? 'has-error' : ''}><i className="fas fa-location-dot"></i> Area/Neighborhood <span className="required"></span></label>
                <input type="text" name="area" value={formData.area} onChange={handleChange} className={fieldErrors.area ? 'form-control error' : 'form-control'} required />
                {fieldErrors.area && <span className="field-error">{fieldErrors.area}</span>}
              </div>
            </div>
            <div className="form-group">
              <label className={fieldErrors.address ? 'has-error' : ''}><i className="fas fa-address-card"></i> Complete Address <span className="required"></span></label>
              <textarea name="address" value={formData.address} onChange={handleChange} className={fieldErrors.address ? 'form-control error' : 'form-control'} required></textarea>
              {fieldErrors.address && <span className="field-error">{fieldErrors.address}</span>}
            </div>

            <h3 className="form-section-title"><i className="fas fa-images"></i> Property Images</h3>
            <div className="form-group">
              {existingImages.length > 0 && (
                <div className="existing-files">
                  <p><strong>Current Images ({existingImages.length}):</strong></p>
                  <div className="existing-thumbnails">
                    {existingImages.map((img, i) => (
                      <img key={i} src={img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`} alt={`Existing ${i + 1}`} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, marginRight: 8 }} />
                    ))}
                  </div>
                </div>
              )}
              <label>Add More Images (optional)</label>
              <div className="image-input-wrapper">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} id="imageInput" />
                <label htmlFor="imageInput" className="image-input-label">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <div>Click to upload additional images</div>
                </label>
              </div>
              {newImages.length > 0 && <div className="image-count"><i className="fas fa-check-circle"></i> {newImages.length} new image(s) selected</div>}
            </div>

            <h3 className="form-section-title"><i className="fas fa-file-contract"></i> Government Verified Documents</h3>
            <div className="form-group">
              {existingDocuments.length > 0 && (
                <div className="existing-files">
                  <p><strong>Current Documents ({existingDocuments.length}):</strong></p>
                  {existingDocuments.map((doc, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>
                      📎 <a href={doc.fileUrl?.startsWith('http') ? doc.fileUrl : `http://localhost:5000${doc.fileUrl}`} target="_blank" rel="noopener noreferrer">{doc.name || `Document ${i + 1}`}</a>
                    </div>
                  ))}
                </div>
              )}
              <label>Add More Documents (optional)</label>
              <div className="image-input-wrapper">
                <input type="file" multiple accept=".pdf,image/*" onChange={handleDocumentChange} id="documentInput" />
                <label htmlFor="documentInput" className="image-input-label">
                  <i className="fas fa-file-upload"></i>
                  <div>Upload additional documents</div>
                </label>
              </div>
              {newDocuments.length > 0 && <div className="image-count"><i className="fas fa-check-circle"></i> {newDocuments.length} new document(s) selected</div>}
            </div>

            <div className="form-actions">
              <button type="submit" className="form-btn btn-submit" disabled={loading}>
                <i className="fas fa-save"></i>
                {loading ? 'Updating...' : 'Update Property'}
              </button>
              <button type="button" className="form-btn btn-cancel" onClick={() => navigate(-1)} disabled={loading}>
                <i className="fas fa-times-circle"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;
