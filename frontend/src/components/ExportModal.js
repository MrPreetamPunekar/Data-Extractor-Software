<<<<<<< HEAD
// frontend/src/components/ExportModal.js
// Export modal component for selecting and generating exports

import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaFileExport, FaDownload, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ExportModal = ({ show, onHide, records, jobId, onExport }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedColumns, setSelectedColumns] = useState([
    'business_name',
    'email',
    'phone',
    'address',
    'website',
    'confidence'
  ]);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [exportName, setExportName] = useState(`export-${jobId || 'data'}-${new Date().toISOString().split('T')[0]}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Available columns for export
  const availableColumns = [
    { key: 'business_name', label: 'Business Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'website', label: 'Website' },
    { key: 'confidence', label: 'Confidence Score' },
    { key: 'created_at', label: 'Created At' },
    { key: 'source_url', label: 'Source URL' }
  ];

  // Handle column selection
  const handleColumnChange = (columnKey) => {
    if (selectedColumns.includes(columnKey)) {
      setSelectedColumns(selectedColumns.filter(col => col !== columnKey));
    } else {
      setSelectedColumns([...selectedColumns, columnKey]);
    }
  };

  // Handle export
  const handleExport = async () => {
    // Validation
    if (selectedColumns.length === 0) {
      setError('Please select at least one column to export.');
      return;
    }

    if (!exportName.trim()) {
      setError('Please enter a name for your export.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      // In a real implementation, you would call the export API
      // For now, we'll simulate the export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful export
      setSuccess(true);
      toast.success('Export generated successfully!');
      
      // Call parent callback
      onExport({
        format: exportFormat,
        columns: selectedColumns,
        includeMetadata,
        name: exportName
      });

      // Close modal after a short delay
      setTimeout(() => {
        onHide();
        resetForm();
      }, 2000);
    } catch (err) {
      console.error('Error generating export:', err);
      setError('Failed to generate export. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setExportFormat('csv');
    setSelectedColumns([
      'business_name',
      'email',
      'phone',
      'address',
      'website',
      'confidence'
    ]);
    setIncludeMetadata(false);
    setExportName(`export-${jobId || 'data'}-${new Date().toISOString().split('T')[0]}`);
    setError('');
    setSuccess(false);
  };

  // Handle modal close
  const handleClose = () => {
    onHide();
    resetForm();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaFileExport className="me-2" />
          Export Data
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">
            <FaCheck className="me-2" />
            Export generated successfully! Your file is ready for download.
          </Alert>
        )}

        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Export Name</Form.Label>
                <Form.Control
                  type="text"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                  placeholder="Enter export name"
                  disabled={success}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Format</Form.Label>
                <Form.Select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  disabled={success}
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Columns to Export</Form.Label>
            <div className="border rounded p-3">
              <Row>
                {availableColumns.map((column) => (
                  <Col md={6} key={column.key}>
                    <Form.Check
                      type="checkbox"
                      id={`column-${column.key}`}
                      label={column.label}
                      checked={selectedColumns.includes(column.key)}
                      onChange={() => handleColumnChange(column.key)}
                      disabled={success}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="include-metadata"
              label="Include metadata (record ID, job ID, etc.)"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              disabled={success}
            />
          </Form.Group>
        </Form>

        {records && records.length > 0 && (
          <div className="mt-3">
            <p className="text-muted">
              <strong>Record Count:</strong> {records.length} records will be exported
            </p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading || success}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleExport} 
          disabled={loading || success}
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
              <span className="ms-2">Generating...</span>
            </>
          ) : success ? (
            <>
              <FaDownload className="me-2" />
              Download
            </>
          ) : (
            <>
              <FaFileExport className="me-2" />
              Generate Export
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

=======
// frontend/src/components/ExportModal.js
// Export modal component for selecting and generating exports

import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaFileExport, FaDownload, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ExportModal = ({ show, onHide, records, jobId, onExport }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedColumns, setSelectedColumns] = useState([
    'business_name',
    'email',
    'phone',
    'address',
    'website',
    'confidence'
  ]);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [exportName, setExportName] = useState(`export-${jobId || 'data'}-${new Date().toISOString().split('T')[0]}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Available columns for export
  const availableColumns = [
    { key: 'business_name', label: 'Business Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'website', label: 'Website' },
    { key: 'confidence', label: 'Confidence Score' },
    { key: 'created_at', label: 'Created At' },
    { key: 'source_url', label: 'Source URL' }
  ];

  // Handle column selection
  const handleColumnChange = (columnKey) => {
    if (selectedColumns.includes(columnKey)) {
      setSelectedColumns(selectedColumns.filter(col => col !== columnKey));
    } else {
      setSelectedColumns([...selectedColumns, columnKey]);
    }
  };

  // Handle export
  const handleExport = async () => {
    // Validation
    if (selectedColumns.length === 0) {
      setError('Please select at least one column to export.');
      return;
    }

    if (!exportName.trim()) {
      setError('Please enter a name for your export.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      // In a real implementation, you would call the export API
      // For now, we'll simulate the export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful export
      setSuccess(true);
      toast.success('Export generated successfully!');
      
      // Call parent callback
      onExport({
        format: exportFormat,
        columns: selectedColumns,
        includeMetadata,
        name: exportName
      });

      // Close modal after a short delay
      setTimeout(() => {
        onHide();
        resetForm();
      }, 2000);
    } catch (err) {
      console.error('Error generating export:', err);
      setError('Failed to generate export. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setExportFormat('csv');
    setSelectedColumns([
      'business_name',
      'email',
      'phone',
      'address',
      'website',
      'confidence'
    ]);
    setIncludeMetadata(false);
    setExportName(`export-${jobId || 'data'}-${new Date().toISOString().split('T')[0]}`);
    setError('');
    setSuccess(false);
  };

  // Handle modal close
  const handleClose = () => {
    onHide();
    resetForm();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaFileExport className="me-2" />
          Export Data
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">
            <FaCheck className="me-2" />
            Export generated successfully! Your file is ready for download.
          </Alert>
        )}

        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Export Name</Form.Label>
                <Form.Control
                  type="text"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                  placeholder="Enter export name"
                  disabled={success}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Format</Form.Label>
                <Form.Select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  disabled={success}
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Columns to Export</Form.Label>
            <div className="border rounded p-3">
              <Row>
                {availableColumns.map((column) => (
                  <Col md={6} key={column.key}>
                    <Form.Check
                      type="checkbox"
                      id={`column-${column.key}`}
                      label={column.label}
                      checked={selectedColumns.includes(column.key)}
                      onChange={() => handleColumnChange(column.key)}
                      disabled={success}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="include-metadata"
              label="Include metadata (record ID, job ID, etc.)"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              disabled={success}
            />
          </Form.Group>
        </Form>

        {records && records.length > 0 && (
          <div className="mt-3">
            <p className="text-muted">
              <strong>Record Count:</strong> {records.length} records will be exported
            </p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading || success}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleExport} 
          disabled={loading || success}
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
              <span className="ms-2">Generating...</span>
            </>
          ) : success ? (
            <>
              <FaDownload className="me-2" />
              Download
            </>
          ) : (
            <>
              <FaFileExport className="me-2" />
              Generate Export
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

>>>>>>> e5d4683 (Initial commit)
export default ExportModal;