<<<<<<< HEAD
// frontend/src/components/FilterComponent.js
// Filter component for data preview

import React, { useState } from 'react';
import { Form, Row, Col, Button, InputGroup } from 'react-bootstrap';
import { FaFilter, FaTimes, FaSearch } from 'react-icons/fa';

const FilterComponent = ({ onFilter, records, onClear }) => {
  const [filters, setFilters] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    confidenceMin: '',
    confidenceMax: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilter = () => {
    onFilter(filters);
  };

  const handleClear = () => {
    setFilters({
      businessName: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      confidenceMin: '',
      confidenceMax: ''
    });
    onClear();
  };

  // Get unique values for filter options
  const getUniqueValues = (field) => {
    if (!records) return [];
    const values = records
      .map(record => record[field])
      .filter(value => value && value.trim() !== '')
      .map(value => value.trim());
    return [...new Set(values)];
  };

  return (
    <div className="mb-4 p-3 border rounded">
      <h5>
        <FaFilter className="me-2" />
        Filter Results
      </h5>
      <p className="text-muted">Filter the data based on your criteria</p>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Business Name</Form.Label>
            <Form.Control
              type="text"
              name="businessName"
              value={filters.businessName}
              onChange={handleInputChange}
              placeholder="Search business names"
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="text"
              name="email"
              value={filters.email}
              onChange={handleInputChange}
              placeholder="Search emails"
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={filters.phone}
              onChange={handleInputChange}
              placeholder="Search phone numbers"
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={filters.address}
              onChange={handleInputChange}
              placeholder="Search addresses"
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Website</Form.Label>
            <Form.Control
              type="text"
              name="website"
              value={filters.website}
              onChange={handleInputChange}
              placeholder="Search websites"
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Confidence Score</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                name="confidenceMin"
                value={filters.confidenceMin}
                onChange={handleInputChange}
                placeholder="Min (0-100)"
                min="0"
                max="100"
              />
              <InputGroup.Text>-</InputGroup.Text>
              <Form.Control
                type="number"
                name="confidenceMax"
                value={filters.confidenceMax}
                onChange={handleInputChange}
                placeholder="Max (0-100)"
                min="0"
                max="100"
              />
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>
      
      <div className="d-flex justify-content-end">
        <Button 
          variant="outline-secondary" 
          className="me-2"
          onClick={handleClear}
        >
          <FaTimes className="me-2" />
          Clear
        </Button>
        <Button 
          variant="primary" 
          onClick={handleFilter}
        >
          <FaSearch className="me-2" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

=======
// frontend/src/components/FilterComponent.js
// Filter component for data preview

import React, { useState } from 'react';
import { Form, Row, Col, Button, InputGroup } from 'react-bootstrap';
import { FaFilter, FaTimes, FaSearch } from 'react-icons/fa';

const FilterComponent = ({ onFilter, records, onClear }) => {
  const [filters, setFilters] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    confidenceMin: '',
    confidenceMax: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilter = () => {
    onFilter(filters);
  };

  const handleClear = () => {
    setFilters({
      businessName: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      confidenceMin: '',
      confidenceMax: ''
    });
    onClear();
  };

  // Get unique values for filter options
  const getUniqueValues = (field) => {
    if (!records) return [];
    const values = records
      .map(record => record[field])
      .filter(value => value && value.trim() !== '')
      .map(value => value.trim());
    return [...new Set(values)];
  };

  return (
    <div className="mb-4 p-3 border rounded">
      <h5>
        <FaFilter className="me-2" />
        Filter Results
      </h5>
      <p className="text-muted">Filter the data based on your criteria</p>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Business Name</Form.Label>
            <Form.Control
              type="text"
              name="businessName"
              value={filters.businessName}
              onChange={handleInputChange}
              placeholder="Search business names"
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="text"
              name="email"
              value={filters.email}
              onChange={handleInputChange}
              placeholder="Search emails"
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={filters.phone}
              onChange={handleInputChange}
              placeholder="Search phone numbers"
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={filters.address}
              onChange={handleInputChange}
              placeholder="Search addresses"
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Website</Form.Label>
            <Form.Control
              type="text"
              name="website"
              value={filters.website}
              onChange={handleInputChange}
              placeholder="Search websites"
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Confidence Score</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                name="confidenceMin"
                value={filters.confidenceMin}
                onChange={handleInputChange}
                placeholder="Min (0-100)"
                min="0"
                max="100"
              />
              <InputGroup.Text>-</InputGroup.Text>
              <Form.Control
                type="number"
                name="confidenceMax"
                value={filters.confidenceMax}
                onChange={handleInputChange}
                placeholder="Max (0-100)"
                min="0"
                max="100"
              />
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>
      
      <div className="d-flex justify-content-end">
        <Button 
          variant="outline-secondary" 
          className="me-2"
          onClick={handleClear}
        >
          <FaTimes className="me-2" />
          Clear
        </Button>
        <Button 
          variant="primary" 
          onClick={handleFilter}
        >
          <FaSearch className="me-2" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

>>>>>>> e5d4683 (Initial commit)
export default FilterComponent;