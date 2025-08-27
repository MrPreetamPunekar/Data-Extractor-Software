// frontend/src/components/Navigation.js
// Navigation bar component

import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaPlus, FaList, FaFileExport, FaSignOutAlt } from 'react-icons/fa';

const Navigation = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>
            <FaList className="me-2" />
            Data Extractor
          </Navbar.Brand>
        </LinkContainer>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          {user && (
            <Nav className="me-auto">
              <LinkContainer to="/jobs/create">
                <Nav.Link>
                  <FaPlus className="me-1" />
                  Create Job
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/">
                <Nav.Link>
                  <FaList className="me-1" />
                  My Jobs
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/exports">
                <Nav.Link>
                  <FaFileExport className="me-1" />
                  Exports
                </Nav.Link>
              </LinkContainer>
            </Nav>
          )}
          
          <Nav className="ms-auto">
            {user ? (
              <>
                <LinkContainer to="/profile">
                  <Nav.Link>
                    <FaUser className="me-1" />
                    {user.first_name} {user.last_name}
                  </Nav.Link>
                </LinkContainer>
                <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>
                  <FaSignOutAlt className="me-1" />
                  Logout
                </Nav.Link>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>Register</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;