import React from 'react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>  
    );
}

export default App;