<<<<<<< HEAD
// frontend/src/components/JobDetails.js
// Job Details component

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { useJob } from '../contexts/JobContext';
import { useAuth } from '../contexts/AuthContext';
import { FaPlay, FaStop, FaTrash, FaDownload, FaSync, FaSearch, FaRedo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import FilterComponent from './FilterComponent';
import ExportModal from './ExportModal';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJob, getJobResults, getJobProgress, startJob, cancelJob, deleteJob, retryJob } = useJob();
  const { token } = useAuth();
  const [job, setJob] = useState(null);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressInterval, setProgressInterval] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch job details on component mount
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const jobData = await getJob(id, token);
        setJob(jobData);
        
        // If job is processing, start polling for progress
        if (jobData.status === 'processing') {
          startProgressPolling();
        }
        
        // Fetch initial results if job is completed
        if (jobData.status === 'completed') {
          await fetchResults();
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.message || 'Failed to fetch job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();

    // Cleanup interval on unmount
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [id, token, getJob]);

  // Fetch job results
  const fetchResults = async () => {
    try {
      const results = await getJobResults(id, token);
      const recordsData = results.records || [];
      setRecords(recordsData);
      setFilteredRecords(recordsData); // Initially show all records
    } catch (err) {
      console.error('Error fetching job results:', err);
      setError(err.message || 'Failed to fetch job results.');
    }
  };

  // Fetch job progress
  const fetchProgress = async () => {
    try {
      const progressData = await getJobProgress(id, token);
      setProgress(progressData.progress || 0);
      
      // If job is completed, stop polling and fetch results
      if (progressData.status === 'completed') {
        stopProgressPolling();
        await fetchResults();
      }
      
      // Update job state
      setJob(prevJob => ({
        ...prevJob,
        ...progressData
      }));
    } catch (err) {
      console.error('Error fetching job progress:', err);
      setError(err.message || 'Failed to fetch job progress.');
      stopProgressPolling();
    }
  };

  // Start progress polling
  const startProgressPolling = () => {
    const interval = setInterval(fetchProgress, 5000); // Poll every 5 seconds
    setProgressInterval(interval);
  };

  // Stop progress polling
  const stopProgressPolling = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
  };

  // Handle start job
  const handleStartJob = async () => {
    try {
      await startJob(id, token);
      toast.success('Job started successfully!');
      
      // Update job status
      setJob(prevJob => ({
        ...prevJob,
        status: 'processing'
      }));
      
      // Start polling for progress
      startProgressPolling();
    } catch (err) {
      console.error('Error starting job:', err);
      setError(err.message || 'Failed to start job.');
    }
  };

  // Handle cancel job
  const handleCancelJob = async () => {
    try {
      await cancelJob(id, token);
      toast.success('Job cancelled successfully!');
      
      // Update job status
      setJob(prevJob => ({
        ...prevJob,
        status: 'failed'
      }));
      
      // Stop polling
      stopProgressPolling();
    } catch (err) {
      console.error('Error cancelling job:', err);
      setError(err.message || 'Failed to cancel job.');
    }
  };

  // Handle delete job
  const handleDeleteJob = async () => {
    try {
      await deleteJob(id, token);
      toast.success('Job deleted successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error deleting job:', err);
      setError(err.message || 'Failed to delete job.');
    }
  };

  // Handle retry job
  const handleRetryJob = async () => {
    try {
      await retryJob(id, token);
      toast.success('Job retried successfully!');
      
      // Update job status
      setJob(prevJob => ({
        ...prevJob,
        status: 'processing'
      }));
      
      // Start polling for progress
      startProgressPolling();
    } catch (err) {
      console.error('Error retrying job:', err);
      setError(err.message || 'Failed to retry job.');
    }
  };

  // Handle export
  const handleExport = async (exportConfig) => {
    try {
      // In a real implementation, you would call the export API with the exportConfig
      console.log('Export config:', exportConfig);
      toast.success(`Export generated successfully as ${exportConfig.name}.${exportConfig.format}`);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError(err.message || 'Failed to export data.');
    }
  };

  // Handle filter
  const handleFilter = (filters) => {
    let filtered = [...records];
    
    // Apply business name filter
    if (filters.businessName) {
      filtered = filtered.filter(record => 
        record.business_name && 
        record.business_name.toLowerCase().includes(filters.businessName.toLowerCase())
      );
    }
    
    // Apply email filter
    if (filters.email) {
      filtered = filtered.filter(record => 
        record.email && 
        record.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    
    // Apply phone filter
    if (filters.phone) {
      filtered = filtered.filter(record => 
        record.phone && 
        record.phone.includes(filters.phone)
      );
    }
    
    // Apply address filter
    if (filters.address) {
      filtered = filtered.filter(record => 
        record.address && 
        record.address.toLowerCase().includes(filters.address.toLowerCase())
      );
    }
    
    // Apply website filter
    if (filters.website) {
      filtered = filtered.filter(record => 
        record.website && 
        record.website.toLowerCase().includes(filters.website.toLowerCase())
      );
    }
    
    // Apply confidence score filters
    if (filters.confidenceMin !== '') {
      filtered = filtered.filter(record => 
        record.confidence && 
        record.confidence * 100 >= parseFloat(filters.confidenceMin)
      );
    }
    
    if (filters.confidenceMax !== '') {
      filtered = filtered.filter(record => 
        record.confidence && 
        record.confidence * 100 <= parseFloat(filters.confidenceMax)
      );
    }
    
    setFilteredRecords(filtered);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilteredRecords(records);
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Job not found.</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Job Details</h1>
          <p className="text-muted">
            {job.keyword ? `${job.keyword} in ${job.location}` : job.source}
          </p>
        </Col>
        <Col className="text-end">
          <Button 
            variant="primary" 
            className="me-2"
            onClick={handleStartJob}
            disabled={job.status !== 'pending'}
          >
            <FaPlay className="me-2" />
            Start
          </Button>
          
          <Button 
            variant="warning" 
            className="me-2"
            onClick={handleCancelJob}
            disabled={job.status !== 'processing'}
          >
            <FaStop className="me-2" />
            Cancel
          </Button>
          
          <Button 
            variant="danger" 
            className="me-2"
            onClick={handleDeleteJob}
          >
            <FaTrash className="me-2" />
            Delete
          </Button>
          
          {job.status === 'failed' && (
            <Button 
              variant="secondary" 
              onClick={handleRetryJob}
            >
              <FaRedo className="me-2" />
              Retry
            </Button>
          )}
        </Col>
      </Row>

      {error && (
        <Row>
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      {/* Job Info */}
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Job Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>ID:</strong> {job.id}</p>
                  <p><strong>Status:</strong> <Badge bg={getStatusVariant(job.status)}>{job.status}</Badge></p>
                  <p><strong>Source:</strong> <Badge bg="secondary">{job.source}</Badge></p>
                </Col>
                <Col md={6}>
                  <p><strong>Created:</strong> {new Date(job.created_at).toLocaleString()}</p>
                  <p><strong>Started:</strong> {job.started_at ? new Date(job.started_at).toLocaleString() : 'Not started'}</p>
                  <p><strong>Completed:</strong> {job.completed_at ? new Date(job.completed_at).toLocaleString() : 'Not completed'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Job Statistics</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Total Records:</strong> {job.total_records || 0}</p>
              <p><strong>Processed Records:</strong> {job.processed_records || 0}</p>
              <p><strong>Failed Records:</strong> {job.failed_records || 0}</p>
              
              {job.status === 'processing' && (
                <div className="mt-3">
                  <p><strong>Progress:</strong></p>
                  <ProgressBar 
                    now={progress} 
                    label={`${progress}%`} 
                    striped 
                    animated 
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filter Component */}
      <Row>
        <Col>
          <FilterComponent 
            onFilter={handleFilter} 
            records={records}
            onClear={handleClearFilters}
          />
        </Col>
      </Row>

      {/* Results Preview */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>
                <FaSearch className="me-2" />
                Results Preview ({filteredRecords.length} records)
              </span>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowExportModal(true)}
                disabled={job.status !== 'completed' || filteredRecords.length === 0}
              >
                <FaDownload className="me-2" />
                Export
              </Button>
            </Card.Header>
            <Card.Body>
              {job.status === 'completed' ? (
                filteredRecords && filteredRecords.length > 0 ? (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Business Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Website</th>
                        <th>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record, index) => (
                        <tr key={index}>
                          <td>{record.business_name || '-'}</td>
                          <td>{record.email || '-'}</td>
                          <td>{record.phone || '-'}</td>
                          <td>{record.address || '-'}</td>
                          <td>
                            {record.website ? (
                              <a href={record.website} target="_blank" rel="noopener noreferrer">
                                {record.website}
                              </a>
                            ) : '-'}
                          </td>
                          <td>
                            {record.confidence ? `${(record.confidence * 100).toFixed(2)}%` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-center text-muted">No records found matching your filters.</p>
                )
              ) : job.status === 'processing' ? (
                <div className="text-center">
                  <Spinner animation="border" role="status" className="me-2" />
                  <span>Processing job... Please wait.</span>
                </div>
              ) : job.status === 'pending' ? (
                <p className="text-center text-muted">Job is pending. Click "Start" to begin processing.</p>
              ) : job.status === 'failed' ? (
                <div className="text-center">
                  <p className="text-danger">Job failed to complete.</p>
                  <Button variant="outline-primary" onClick={handleRetryJob}>
                    <FaRedo className="me-2" />
                    Retry Job
                  </Button>
                </div>
              ) : (
                <p className="text-center text-muted">No results available for this job.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Export Modal */}
      <ExportModal 
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        records={filteredRecords}
        jobId={id}
        onExport={handleExport}
      />
    </Container>
  );
};

=======
// frontend/src/components/JobDetails.js
// Job Details component

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { useJob } from '../contexts/JobContext';
import { useAuth } from '../contexts/AuthContext';
import { FaPlay, FaStop, FaTrash, FaDownload, FaSync, FaSearch, FaRedo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import FilterComponent from './FilterComponent';
import ExportModal from './ExportModal';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJob, getJobResults, getJobProgress, startJob, cancelJob, deleteJob, retryJob } = useJob();
  const { token } = useAuth();
  const [job, setJob] = useState(null);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressInterval, setProgressInterval] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch job details on component mount
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const jobData = await getJob(id, token);
        setJob(jobData);
        
        // If job is processing, start polling for progress
        if (jobData.status === 'processing') {
          startProgressPolling();
        }
        
        // Fetch initial results if job is completed
        if (jobData.status === 'completed') {
          await fetchResults();
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.message || 'Failed to fetch job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();

    // Cleanup interval on unmount
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [id, token, getJob]);

  // Fetch job results
  const fetchResults = async () => {
    try {
      const results = await getJobResults(id, token);
      const recordsData = results.records || [];
      setRecords(recordsData);
      setFilteredRecords(recordsData); // Initially show all records
    } catch (err) {
      console.error('Error fetching job results:', err);
      setError(err.message || 'Failed to fetch job results.');
    }
  };

  // Fetch job progress
  const fetchProgress = async () => {
    try {
      const progressData = await getJobProgress(id, token);
      setProgress(progressData.progress || 0);
      
      // If job is completed, stop polling and fetch results
      if (progressData.status === 'completed') {
        stopProgressPolling();
        await fetchResults();
      }
      
      // Update job state
      setJob(prevJob => ({
        ...prevJob,
        ...progressData
      }));
    } catch (err) {
      console.error('Error fetching job progress:', err);
      setError(err.message || 'Failed to fetch job progress.');
      stopProgressPolling();
    }
  };

  // Start progress polling
  const startProgressPolling = () => {
    const interval = setInterval(fetchProgress, 5000); // Poll every 5 seconds
    setProgressInterval(interval);
  };

  // Stop progress polling
  const stopProgressPolling = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
  };

  // Handle start job
  const handleStartJob = async () => {
    try {
      await startJob(id, token);
      toast.success('Job started successfully!');
      
      // Update job status
      setJob(prevJob => ({
        ...prevJob,
        status: 'processing'
      }));
      
      // Start polling for progress
      startProgressPolling();
    } catch (err) {
      console.error('Error starting job:', err);
      setError(err.message || 'Failed to start job.');
    }
  };

  // Handle cancel job
  const handleCancelJob = async () => {
    try {
      await cancelJob(id, token);
      toast.success('Job cancelled successfully!');
      
      // Update job status
      setJob(prevJob => ({
        ...prevJob,
        status: 'failed'
      }));
      
      // Stop polling
      stopProgressPolling();
    } catch (err) {
      console.error('Error cancelling job:', err);
      setError(err.message || 'Failed to cancel job.');
    }
  };

  // Handle delete job
  const handleDeleteJob = async () => {
    try {
      await deleteJob(id, token);
      toast.success('Job deleted successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error deleting job:', err);
      setError(err.message || 'Failed to delete job.');
    }
  };

  // Handle retry job
  const handleRetryJob = async () => {
    try {
      await retryJob(id, token);
      toast.success('Job retried successfully!');
      
      // Update job status
      setJob(prevJob => ({
        ...prevJob,
        status: 'processing'
      }));
      
      // Start polling for progress
      startProgressPolling();
    } catch (err) {
      console.error('Error retrying job:', err);
      setError(err.message || 'Failed to retry job.');
    }
  };

  // Handle export
  const handleExport = async (exportConfig) => {
    try {
      // In a real implementation, you would call the export API with the exportConfig
      console.log('Export config:', exportConfig);
      toast.success(`Export generated successfully as ${exportConfig.name}.${exportConfig.format}`);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError(err.message || 'Failed to export data.');
    }
  };

  // Handle filter
  const handleFilter = (filters) => {
    let filtered = [...records];
    
    // Apply business name filter
    if (filters.businessName) {
      filtered = filtered.filter(record => 
        record.business_name && 
        record.business_name.toLowerCase().includes(filters.businessName.toLowerCase())
      );
    }
    
    // Apply email filter
    if (filters.email) {
      filtered = filtered.filter(record => 
        record.email && 
        record.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    
    // Apply phone filter
    if (filters.phone) {
      filtered = filtered.filter(record => 
        record.phone && 
        record.phone.includes(filters.phone)
      );
    }
    
    // Apply address filter
    if (filters.address) {
      filtered = filtered.filter(record => 
        record.address && 
        record.address.toLowerCase().includes(filters.address.toLowerCase())
      );
    }
    
    // Apply website filter
    if (filters.website) {
      filtered = filtered.filter(record => 
        record.website && 
        record.website.toLowerCase().includes(filters.website.toLowerCase())
      );
    }
    
    // Apply confidence score filters
    if (filters.confidenceMin !== '') {
      filtered = filtered.filter(record => 
        record.confidence && 
        record.confidence * 100 >= parseFloat(filters.confidenceMin)
      );
    }
    
    if (filters.confidenceMax !== '') {
      filtered = filtered.filter(record => 
        record.confidence && 
        record.confidence * 100 <= parseFloat(filters.confidenceMax)
      );
    }
    
    setFilteredRecords(filtered);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilteredRecords(records);
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Job not found.</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Job Details</h1>
          <p className="text-muted">
            {job.keyword ? `${job.keyword} in ${job.location}` : job.source}
          </p>
        </Col>
        <Col className="text-end">
          <Button 
            variant="primary" 
            className="me-2"
            onClick={handleStartJob}
            disabled={job.status !== 'pending'}
          >
            <FaPlay className="me-2" />
            Start
          </Button>
          
          <Button 
            variant="warning" 
            className="me-2"
            onClick={handleCancelJob}
            disabled={job.status !== 'processing'}
          >
            <FaStop className="me-2" />
            Cancel
          </Button>
          
          <Button 
            variant="danger" 
            className="me-2"
            onClick={handleDeleteJob}
          >
            <FaTrash className="me-2" />
            Delete
          </Button>
          
          {job.status === 'failed' && (
            <Button 
              variant="secondary" 
              onClick={handleRetryJob}
            >
              <FaRedo className="me-2" />
              Retry
            </Button>
          )}
        </Col>
      </Row>

      {error && (
        <Row>
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      {/* Job Info */}
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Job Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>ID:</strong> {job.id}</p>
                  <p><strong>Status:</strong> <Badge bg={getStatusVariant(job.status)}>{job.status}</Badge></p>
                  <p><strong>Source:</strong> <Badge bg="secondary">{job.source}</Badge></p>
                </Col>
                <Col md={6}>
                  <p><strong>Created:</strong> {new Date(job.created_at).toLocaleString()}</p>
                  <p><strong>Started:</strong> {job.started_at ? new Date(job.started_at).toLocaleString() : 'Not started'}</p>
                  <p><strong>Completed:</strong> {job.completed_at ? new Date(job.completed_at).toLocaleString() : 'Not completed'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Job Statistics</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Total Records:</strong> {job.total_records || 0}</p>
              <p><strong>Processed Records:</strong> {job.processed_records || 0}</p>
              <p><strong>Failed Records:</strong> {job.failed_records || 0}</p>
              
              {job.status === 'processing' && (
                <div className="mt-3">
                  <p><strong>Progress:</strong></p>
                  <ProgressBar 
                    now={progress} 
                    label={`${progress}%`} 
                    striped 
                    animated 
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filter Component */}
      <Row>
        <Col>
          <FilterComponent 
            onFilter={handleFilter} 
            records={records}
            onClear={handleClearFilters}
          />
        </Col>
      </Row>

      {/* Results Preview */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>
                <FaSearch className="me-2" />
                Results Preview ({filteredRecords.length} records)
              </span>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowExportModal(true)}
                disabled={job.status !== 'completed' || filteredRecords.length === 0}
              >
                <FaDownload className="me-2" />
                Export
              </Button>
            </Card.Header>
            <Card.Body>
              {job.status === 'completed' ? (
                filteredRecords && filteredRecords.length > 0 ? (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Business Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Website</th>
                        <th>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record, index) => (
                        <tr key={index}>
                          <td>{record.business_name || '-'}</td>
                          <td>{record.email || '-'}</td>
                          <td>{record.phone || '-'}</td>
                          <td>{record.address || '-'}</td>
                          <td>
                            {record.website ? (
                              <a href={record.website} target="_blank" rel="noopener noreferrer">
                                {record.website}
                              </a>
                            ) : '-'}
                          </td>
                          <td>
                            {record.confidence ? `${(record.confidence * 100).toFixed(2)}%` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-center text-muted">No records found matching your filters.</p>
                )
              ) : job.status === 'processing' ? (
                <div className="text-center">
                  <Spinner animation="border" role="status" className="me-2" />
                  <span>Processing job... Please wait.</span>
                </div>
              ) : job.status === 'pending' ? (
                <p className="text-center text-muted">Job is pending. Click "Start" to begin processing.</p>
              ) : job.status === 'failed' ? (
                <div className="text-center">
                  <p className="text-danger">Job failed to complete.</p>
                  <Button variant="outline-primary" onClick={handleRetryJob}>
                    <FaRedo className="me-2" />
                    Retry Job
                  </Button>
                </div>
              ) : (
                <p className="text-center text-muted">No results available for this job.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Export Modal */}
      <ExportModal 
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        records={filteredRecords}
        jobId={id}
        onExport={handleExport}
      />
    </Container>
  );
};

>>>>>>> e5d4683 (Initial commit)
export default JobDetails;