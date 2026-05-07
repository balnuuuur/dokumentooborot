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

function App() {
  const token = localStorage.getItem('token');

  return (
     <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />

      {token && (
        <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/document/:id" element={<DocumentDetail />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Route>
    )}

    <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;