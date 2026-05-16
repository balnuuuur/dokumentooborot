import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import Upload from './components/Upload';
import Documents from './components/Documents';
import Notifications from './components/Notifications';
import AdminPanel from './components/AdminPanel';
import DocumentDetail from './components/DocumentDetail';
import AdminLogin from './components/AdminLogin';
import Settings from './components/Settings';

function App() {
  const token = localStorage.getItem('token');

  if (!token) {
      return (
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      );
    }

  return (
     <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/document/:id" element={<DocumentDetail />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="/login" element={<Navigate to="/dashboard" />} />
      <Route path="/register" element={<Navigate to="/dashboard" />} />
      <Route path="/admin-login" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;