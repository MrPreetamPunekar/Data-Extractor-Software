// frontend/src/components/Exports.js
// Exports component

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { FaFileExport, FaDownload, FaTrash, FaPlus, FaSync } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ExportModal from './ExportModal';

const Exports = () => {
  const { token } = useAuth();
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [records, setRecords] = useState([]);

  // Fetch exports on component mount
  useEffect(() => {
    const fetchExports = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would call the exports API
        // For now, we'll use mock data
        const mockExports = [
          {
            id: '1',
            job_id: 'job1',
            job_name: 'Restaurants in NYC',
            format: 'csv',
            filename: 'restaurants-nyc-2023-04-01.csv',
            record_count: 1250,
            created_at: '2023-04-01T10:30:00Z',
            expires_at: '2023-04-08T10:30:00Z'
          },
          {
            id: '2',
            job_id: 'job2',
            job_name: 'Lawyers in LA',
            format: 'xlsx',
            filename: 'lawyers-la-2023-04-02.xlsx',
            record_count: 875,
            created_at: '2023-04-02T14:15:00Z',
            expires_at: '2023-04-09T14:15:00Z'
          }
        ];
        setExports(mockExports);
        
        // Mock jobs data
        const mockJobs = [
          { id: 'job1', name: 'Restaurants in NYC' },
          { id: 'job2', name: 'Lawyers in LA' },
          { id: 'job3', name: 'Plumbers in Chicago' }
        ];
        setJobs(mockJobs);
        
        // Mock records data
        const mockRecords = [
          {
            id: '1',
            business_name: 'Joe\'s Pizza',
            email: 'info@joespizza.com',
            phone: '+1-212-555-1234',
            address: '123 Main St, New York, NY 10001',
            website: 'https://joespizza.com',
            confidence: 0.95
          },
          {
            id: '2',
            business_name: 'Mario\'s Italian',
            email: 'contact@mariositalian.com',
            phone: '+1-212-555-5678',
            address: '456 Broadway, New York, NY 10013',
            website: 'https://mariositalian.com',
            confidence: 0.87
          }
        ];
        setRecords(mockRecords);
      } catch (err) {
        console.error('Error fetching exports:', err);
        setError('Failed to fetch exports.');
      } finally {
        setLoading(false);
      }
    };

    fetchExports();
  }, []);

  // Handle create export
  const handleCreateExport = async (exportConfig) => {
    try {
      // In a real implementation, you would call the create export API
      console.log('Export config:', exportConfig);
      toast.success('Export created successfully!');
      setShowCreateModal(false);
      
      // Refresh exports list
      // In a real implementation, you would fetch the updated list
      const newExport = {
        id: `${exports.length + 1}`,
        job_id: exportConfig.jobId || 'job1',
        job_name: jobs.find(j => j.id === (exportConfig.jobId || 'job1'))?.name || 'Unknown Job',
        format: exportConfig.format,
        filename: `${exportConfig.name}.${exportConfig.format}`,
        record_count: records.length,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      };
      
      setExports(prev => [newExport, ...prev]);
    } catch (err) {
      console.error('Error creating export:', err);
      setError('Failed to create export.');
    }
  };

  // Handle download export
  const handleDownloadExport = async (exportId) => {
    try {
      // In a real implementation, you would call the download export API
      toast.info('Download would start automatically in a real implementation.');
    } catch (err) {
      console.error('Error downloading export:', err);
      setError('Failed to download export.');
    }
  };

  // Handle delete export
  const handleDeleteExport = async (exportId) => {
    try {
      // In a real implementation, you would call the delete export API
      setExports(prev => prev.filter(exp => exp.id !== exportId));
      toast.success('Export deleted successfully!');
    } catch (err) {
      console.error('Error deleting export:', err);
      setError('Failed to delete export.');
    }
  };

  // Check if export is expired
  const isExportExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  // Get format badge variant
  const getFormatVariant = (format) => {
    switch (format) {
      case 'csv':
        return 'primary';
      case 'xlsx':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Exports</h1>
          <p className="text-muted">Manage your exported data files.</p>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <FaPlus className="me-2" />
            Create Export
          </Button>
        </Col>
      </Row>

      {error && (
        <Row>
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <FaFileExport className="me-2" />
              Exported Files
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : exports && exports.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Job Name</th>
                      <th>Format</th>
                      <th>Records</th>
                      <th>Filename</th>
                      <th>Created</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exports.map((exp) => (
                      <tr key={exp.id}>
                        <td>{exp.job_name}</td>
                        <td>
                          <Badge bg={getFormatVariant(exp.format)}>
                            {exp.format.toUpperCase()}
                          </Badge>
                        </td>
                        <td>{exp.record_count}</td>
                        <td>{exp.filename}</td>
                        <td>{new Date(exp.created_at).toLocaleDateString()}</td>
                        <td>
                          {isExportExpired(exp.expires_at) ? (
                            <Badge bg="danger">Expired</Badge>
                          ) : (
                            <Badge bg="success">Active</Badge>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleDownloadExport(exp.id)}
                            disabled={isExportExpired(exp.expires_at)}
                          >
                            <FaDownload />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteExport(exp.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center text-muted">No exports found. Create your first export to get started.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Export Modal */}
      <ExportModal 
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        records={records}
        onExport={handleCreateExport}
      />
    </Container>
  );
};

export default Exports;