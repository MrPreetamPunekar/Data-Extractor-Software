<<<<<<< HEAD
// frontend/src/App.js
// Main App component

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { JobProvider } from './contexts/JobContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import JobDetails from './components/JobDetails';
import CreateJob from './components/CreateJob';
import Exports from './components/Exports';
import Profile from './components/Profile';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <div className="App">
          <Navigation />
          <main className="container mt-4">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Private routes */}
              <Route path="/" element={<PrivateRoute />}>
                <Route index element={<Dashboard />} />
                <Route path="/jobs/create" element={<CreateJob />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/exports" element={<Exports />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </main>
        </div>
      </JobProvider>
    </AuthProvider>
  );
}

=======
// frontend/src/App.js
// Main App component

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { JobProvider } from './contexts/JobContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import JobDetails from './components/JobDetails';
import CreateJob from './components/CreateJob';
import Exports from './components/Exports';
import Profile from './components/Profile';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <div className="App">
          <Navigation />
          <main className="container mt-4">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Private routes */}
              <Route path="/" element={<PrivateRoute />}>
                <Route index element={<Dashboard />} />
                <Route path="/jobs/create" element={<CreateJob />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/exports" element={<Exports />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </main>
        </div>
      </JobProvider>
    </AuthProvider>
  );
}

>>>>>>> e5d4683 (Initial commit)
export default App;