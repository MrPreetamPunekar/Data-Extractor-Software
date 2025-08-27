// frontend/src/components/Dashboard.js
// Dashboard component

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useJob } from '../contexts/JobContext';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaChartBar } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuth();
  const { jobs, loading, error, fetchJobs } = useJob();
  const [jobStats, setJobStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  });

  // Fetch jobs on component mount
  useEffect(() => {
    const loadJobs = async () => {
      try {
        await fetchJobs();
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };

    loadJobs();
  }, [fetchJobs]);

  // Calculate job statistics
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      const stats = {
        total: jobs.length,
        pending: jobs.filter(job => job.status === 'pending').length,
        processing: jobs.filter(job => job.status === 'processing').length,
        completed: jobs.filter(job => job.status === 'completed').length,
        failed: jobs.filter(job => job.status === 'failed').length
      };
      setJobStats(stats);
    }
  }, [jobs]);

  // Chart data
  const chartData = {
    labels: ['Pending', 'Processing', 'Completed', 'Failed'],
    datasets: [
      {
        label: 'Jobs',
        data: [jobStats.pending, jobStats.processing, jobStats.completed, jobStats.failed],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Job Status Distribution',
      },
    },
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

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Dashboard</h1>
          <p className="text-muted">Welcome back, {user?.first_name} {user?.last_name}!</p>
        </Col>
        <Col className="text-end">
          <Link to="/jobs/create">
            <Button variant="primary">
              <FaPlus className="me-2" />
              Create New Job
            </Button>
          </Link>
        </Col>
      </Row>

      {error && (
        <Row>
          <Col>
            <div className="alert alert-danger">{error}</div>
          </Col>
        </Row>
      )}

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Jobs</Card.Title>
              <Card.Text className="display-4">{jobStats.total}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Completed</Card.Title>
              <Card.Text className="display-4 text-success">{jobStats.completed}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Processing</Card.Title>
              <Card.Text className="display-4 text-info">{jobStats.processing}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Pending</Card.Title>
              <Card.Text className="display-4 text-warning">{jobStats.pending}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chart */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Bar data={chartData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Jobs */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>
                <FaList className="me-2" />
                Recent Jobs
              </span>
              <Link to="/jobs">
                <Button variant="outline-primary" size="sm">
                  View All
                </Button>
              </Link>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : jobs && jobs.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Job Name</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Records</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.slice(0, 5).map((job) => (
                      <tr key={job.id}>
                        <td>{job.keyword || job.source}</td>
                        <td>
                          <Badge bg="secondary">{job.source}</Badge>
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(job.status)}>
                            {job.status}
                          </Badge>
                        </td>
                        <td>{job.total_records || 0}</td>
                        <td>{new Date(job.created_at).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/jobs/${job.id}`}>
                            <Button variant="outline-primary" size="sm">
                              <FaSearch />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center text-muted">No jobs found. Create your first job to get started.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;