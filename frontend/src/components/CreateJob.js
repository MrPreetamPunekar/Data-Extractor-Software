<<<<<<< HEAD
// frontend/src/components/CreateJob.js
// Create Job component

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useJob } from '../contexts/JobContext';
import { useAuth } from '../contexts/AuthContext';
import { FaPlus, FaSearch, FaUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CreateJob = () => {
  const [jobType, setJobType] = useState('web_search');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { createJob } = useJob();
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (jobType === 'web_search' && (!keyword || !location)) {
      setError('Please enter both keyword and location for web search jobs.');
      return;
    }
    
    if (jobType === 'file_upload' && !file) {
      setError('Please select a file to upload.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let jobData;
      
      if (jobType === 'file_upload') {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('source', 'file_upload');
        
        // In a real implementation, you would upload the file to a separate endpoint
        // For now, we'll just create a job with file_upload source
        jobData = {
          source: 'file_upload'
        };
      } else {
        // Handle web search or API jobs
        jobData = {
          keyword,
          location,
          source: jobType
        };
      }
      
      const newJob = await createJob(jobData, token);
      
      if (newJob) {
        toast.success('Job created successfully!');
        navigate(`/jobs/${newJob.id}`);
      } else {
        setError('Failed to create job. Please try again.');
      }
    } catch (err) {
      console.error('Error creating job:', err);
      setError(err.response?.data?.message || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Create New Job</h1>
          <p className="text-muted">Select the type of job you want to create and provide the required information.</p>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Job Details</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Type</Form.Label>
                  <Form.Select 
                    value={jobType} 
                    onChange={(e) => setJobType(e.target.value)}
                  >
                    <option value="web_search">Web Search</option>
                    <option value="file_upload">File Upload</option>
                    <option value="api">API Integration</option>
                  </Form.Select>
                </Form.Group>

                {jobType === 'web_search' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Keyword</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter keyword (e.g., restaurants, lawyers, plumbers)"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter location (e.g., New York, NY)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </Form.Group>
                  </>
                )}

                {jobType === 'file_upload' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Upload File</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                    />
                    <Form.Text className="text-muted">
                      Supported formats: CSV, Excel (.xlsx, .xls)
                    </Form.Text>
                  </Form.Group>
                )}

                {jobType === 'api' && (
                  <Alert variant="info">
                    <strong>API Integration</strong>
                    <p className="mb-0">
                      API integrations allow you to connect to supported services like Google Places, Yelp, etc.
                      You'll need to configure API keys in your profile settings.
                    </p>
                  </Alert>
                )}

                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span className="ms-2">Creating Job...</span>
                      </>
                    ) : (
                      <>
                        <FaPlus className="me-2" />
                        Create Job
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Job Types</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaSearch className="me-2 text-primary" />
                  <strong>Web Search</strong>
                </div>
                <p className="text-muted small">
                  Search the web for business information based on keywords and location.
                </p>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaUpload className="me-2 text-primary" />
                  <strong>File Upload</strong>
                </div>
                <p className="text-muted small">
                  Upload a CSV or Excel file containing business information to process.
                </p>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaSearch className="me-2 text-primary" />
                  <strong>API Integration</strong>
                </div>
                <p className="text-muted small">
                  Connect to supported APIs like Google Places, Yelp, etc. for business data.
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>
              <h5>Tips</h5>
            </Card.Header>
            <Card.Body>
              <ul className="text-muted small">
                <li>Be specific with keywords for better results</li>
                <li>Use city and state for location accuracy</li>
                <li>Check file format before uploading</li>
                <li>Configure API keys for API integrations</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

=======
// frontend/src/components/CreateJob.js
// Create Job component

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useJob } from '../contexts/JobContext';
import { useAuth } from '../contexts/AuthContext';
import { FaPlus, FaSearch, FaUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CreateJob = () => {
  const [jobType, setJobType] = useState('web_search');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { createJob } = useJob();
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (jobType === 'web_search' && (!keyword || !location)) {
      setError('Please enter both keyword and location for web search jobs.');
      return;
    }
    
    if (jobType === 'file_upload' && !file) {
      setError('Please select a file to upload.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let jobData;
      
      if (jobType === 'file_upload') {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('source', 'file_upload');
        
        // In a real implementation, you would upload the file to a separate endpoint
        // For now, we'll just create a job with file_upload source
        jobData = {
          source: 'file_upload'
        };
      } else {
        // Handle web search or API jobs
        jobData = {
          keyword,
          location,
          source: jobType
        };
      }
      
      const newJob = await createJob(jobData, token);
      
      if (newJob) {
        toast.success('Job created successfully!');
        navigate(`/jobs/${newJob.id}`);
      } else {
        setError('Failed to create job. Please try again.');
      }
    } catch (err) {
      console.error('Error creating job:', err);
      setError(err.response?.data?.message || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Create New Job</h1>
          <p className="text-muted">Select the type of job you want to create and provide the required information.</p>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Job Details</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Type</Form.Label>
                  <Form.Select 
                    value={jobType} 
                    onChange={(e) => setJobType(e.target.value)}
                  >
                    <option value="web_search">Web Search</option>
                    <option value="file_upload">File Upload</option>
                    <option value="api">API Integration</option>
                  </Form.Select>
                </Form.Group>

                {jobType === 'web_search' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Keyword</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter keyword (e.g., restaurants, lawyers, plumbers)"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter location (e.g., New York, NY)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </Form.Group>
                  </>
                )}

                {jobType === 'file_upload' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Upload File</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                    />
                    <Form.Text className="text-muted">
                      Supported formats: CSV, Excel (.xlsx, .xls)
                    </Form.Text>
                  </Form.Group>
                )}

                {jobType === 'api' && (
                  <Alert variant="info">
                    <strong>API Integration</strong>
                    <p className="mb-0">
                      API integrations allow you to connect to supported services like Google Places, Yelp, etc.
                      You'll need to configure API keys in your profile settings.
                    </p>
                  </Alert>
                )}

                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span className="ms-2">Creating Job...</span>
                      </>
                    ) : (
                      <>
                        <FaPlus className="me-2" />
                        Create Job
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Job Types</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaSearch className="me-2 text-primary" />
                  <strong>Web Search</strong>
                </div>
                <p className="text-muted small">
                  Search the web for business information based on keywords and location.
                </p>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaUpload className="me-2 text-primary" />
                  <strong>File Upload</strong>
                </div>
                <p className="text-muted small">
                  Upload a CSV or Excel file containing business information to process.
                </p>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaSearch className="me-2 text-primary" />
                  <strong>API Integration</strong>
                </div>
                <p className="text-muted small">
                  Connect to supported APIs like Google Places, Yelp, etc. for business data.
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>
              <h5>Tips</h5>
            </Card.Header>
            <Card.Body>
              <ul className="text-muted small">
                <li>Be specific with keywords for better results</li>
                <li>Use city and state for location accuracy</li>
                <li>Check file format before uploading</li>
                <li>Configure API keys for API integrations</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

>>>>>>> e5d4683 (Initial commit)
export default CreateJob;