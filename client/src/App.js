import React from 'react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import ReportGenerator from './pages/ReportGenerator';


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
        } />
      <Route path="/generate" element={<ProtectedRoute> <ReportGenerator /> </ProtectedRoute>} />

    </Routes>  
    );
}

export default App;