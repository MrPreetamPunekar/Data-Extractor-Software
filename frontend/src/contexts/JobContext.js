<<<<<<< HEAD
// frontend/src/contexts/JobContext.js
// Job context for managing job state

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { handleApiError, handleJobError } from '../utils/errorHandler';

// Create the context
const JobContext = createContext();

// Custom hook to use the job context
export const useJob = () => {
  return useContext(JobContext);
};

// Job provider component
export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all jobs for user
  const fetchJobs = async (token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/jobs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setJobs(response.data.data.jobs);
      return response.data.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error fetching jobs:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Create a new job
  const createJob = async (jobData, token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/jobs', jobData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setJobs(prevJobs => [response.data.data.job, ...prevJobs]);
      return response.data.data.job;
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error creating job:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Get a specific job
  const getJob = async (jobId, token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.data.job;
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error fetching job:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Update a job
  const updateJob = async (jobId, jobData, token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`/api/jobs/${jobId}`, jobData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update job in state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? response.data.data.job : job
        )
      );
      
      return response.data.data.job;
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error updating job:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Delete a job
  const deleteJob = async (jobId, token) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Remove job from state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error deleting job:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Start a job with retries
  const startJob = async (jobId, token, attempt = 1, maxRetries = 3) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/jobs/${jobId}/start`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update job status in state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, status: 'processing' } : job
        )
      );
      
      return response.data;
    } catch (error) {
      const jobError = handleJobError(error, attempt, maxRetries);
      
      if (jobError.shouldRetry) {
        console.warn(`Job start attempt ${attempt} failed. Retrying in ${jobError.delay}ms...`);
        
        // Wait for the delay before retrying
        await new Promise(resolve => setTimeout(resolve, jobError.delay));
        
        // Retry the job start
        return startJob(jobId, token, attempt + 1, maxRetries);
      } else {
        console.error('Error starting job:', jobError.message);
        setError(jobError.message);
        throw jobError.error;
      }
    } finally {
      setLoading(false);
    }
  };

  // Cancel a job
  const cancelJob = async (jobId, token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/jobs/${jobId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update job status in state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, status: 'failed' } : job
        )
      );
      
      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error canceling job:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Get job results
  const getJobResults = async (jobId, token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/jobs/${jobId}/results`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error fetching job results:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Get job progress
  const getJobProgress = async (jobId, token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/jobs/${jobId}/progress`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update job progress in state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, ...response.data.data.job } : job
        )
      );
      
      return response.data.data.job;
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error fetching job progress:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Retry a failed job
  const retryJob = async (jobId, token) => {
    setLoading(true);
    setError(null);
    
    try {
      // Reset job status to pending
      await updateJob(jobId, { status: 'pending' }, token);
      
      // Start the job again
      return await startJob(jobId, token);
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error retrying job:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    jobs,
    loading,
    error,
    fetchJobs,
    createJob,
    getJob,
    updateJob,
    deleteJob,
    startJob,
    cancelJob,
    getJobResults,
    getJobProgress,
    retryJob
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};

=======
// frontend/src/contexts/JobContext.js
// Job context for managing job state

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { handleApiError, handleJobError } from '../utils/errorHandler';

// Create the context
const JobContext = createContext();

// Custom hook to use the job context
export const useJob = () => {
  return useContext(JobContext);
};

// Job provider component
export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all jobs for user
  const fetchJobs = async (token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/jobs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setJobs(response.data.data.jobs);
      return response.data.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error fetching jobs:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Create a new job
  const createJob = async (jobData, token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/jobs', jobData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setJobs(prevJobs => [response.data.data.job, ...prevJobs]);
      return response.data.data.job;
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error creating job:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Get a specific job
  const getJob = async (jobId, token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.data.job;
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error fetching job:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Update a job
  const updateJob = async (jobId, jobData, token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`/api/jobs/${jobId}`, jobData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update job in state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? response.data.data.job : job
        )
      );
      
      return response.data.data.job;
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error updating job:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Delete a job
  const deleteJob = async (jobId, token) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Remove job from state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error deleting job:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Start a job with retries
  const startJob = async (jobId, token, attempt = 1, maxRetries = 3) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/jobs/${jobId}/start`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update job status in state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, status: 'processing' } : job
        )
      );
      
      return response.data;
    } catch (error) {
      const jobError = handleJobError(error, attempt, maxRetries);
      
      if (jobError.shouldRetry) {
        console.warn(`Job start attempt ${attempt} failed. Retrying in ${jobError.delay}ms...`);
        
        // Wait for the delay before retrying
        await new Promise(resolve => setTimeout(resolve, jobError.delay));
        
        // Retry the job start
        return startJob(jobId, token, attempt + 1, maxRetries);
      } else {
        console.error('Error starting job:', jobError.message);
        setError(jobError.message);
        throw jobError.error;
      }
    } finally {
      setLoading(false);
    }
  };

  // Cancel a job
  const cancelJob = async (jobId, token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/jobs/${jobId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update job status in state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, status: 'failed' } : job
        )
      );
      
      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error canceling job:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Get job results
  const getJobResults = async (jobId, token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/jobs/${jobId}/results`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error fetching job results:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Get job progress
  const getJobProgress = async (jobId, token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/jobs/${jobId}/progress`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update job progress in state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, ...response.data.data.job } : job
        )
      );
      
      return response.data.data.job;
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error fetching job progress:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Retry a failed job
  const retryJob = async (jobId, token) => {
    setLoading(true);
    setError(null);
    
    try {
      // Reset job status to pending
      await updateJob(jobId, { status: 'pending' }, token);
      
      // Start the job again
      return await startJob(jobId, token);
    } catch (error) {
      const errorResponse = handleApiError(error);
      console.error('Error retrying job:', errorResponse);
      setError(errorResponse.message);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    jobs,
    loading,
    error,
    fetchJobs,
    createJob,
    getJob,
    updateJob,
    deleteJob,
    startJob,
    cancelJob,
    getJobResults,
    getJobProgress,
    retryJob
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};

>>>>>>> e5d4683 (Initial commit)
export default JobContext;