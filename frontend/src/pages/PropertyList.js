import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../utils/api';
import PropertyCard from '../components/PropertyCard';
import '../styles/Dashboard.css';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [areaUnit, setAreaUnit] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getAll({});
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProperties = () => {
    let filtered = properties;
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.location?.city?.toLowerCase().includes(search) ||
        p.location?.area?.toLowerCase().includes(search) ||
        p.ownerName?.toLowerCase().includes(search) ||
        p.title?.toLowerCase().includes(search)
      );
    }
    if (minPrice) filtered = filtered.filter(p => p.price >= parseInt(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= parseInt(maxPrice));
    if (areaUnit) filtered = filtered.filter(p => p.area?.unit === areaUnit);
    if (propertyType) filtered = filtered.filter(p => p.title === propertyType);
    return filtered;
  };

  const handleClear = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setAreaUnit('');
    setPropertyType('');
  };

  const filtered = getFilteredProperties();

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="welcome-section">
          <div className="welcome-left">
            <h1>🏘️ Browse Properties</h1>
            <p className="subtitle">Explore all verified property listings</p>
          </div>
        </div>

        <div className="search-filter-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by location, city, owner, or property type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? '✕ Hide' : '⚙ Filters'}
            </button>
          </div>

          {showFilters && (
            <div className="advanced-filters">
              <div className="filter-row">
                <div className="filter-group">
                  <label>Min Price</label>
                  <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                </div>
                <div className="filter-group">
                  <label>Max Price</label>
                  <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                </div>
                <div className="filter-group">
                  <label>Area Unit</label>
                  <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)}>
                    <option value="">All</option>
                    <option value="Marla">Marla</option>
                    <option value="Kanal">Kanal</option>
                    <option value="Acre">Acre</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Type</label>
                  <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                    <option value="">All</option>
                    <option value="Plot">Plot</option>
                    <option value="House">House</option>
                    <option value="Land">Land</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-secondary btn-small" onClick={handleClear}>Clear Filters</button>
            </div>
          )}
        </div>

        <div className="results-summary">
          <p>Found <strong>{filtered.length}</strong> properties</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading properties...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No properties found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn btn-primary" onClick={handleClear}>Clear Filters</button>
          </div>
        ) : (
          <div className="properties-grid">
            {filtered.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                isAdmin={false}
                onView={() => navigate(`/property/${property._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyList;
