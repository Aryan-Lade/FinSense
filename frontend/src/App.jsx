import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BillsList from './pages/BillsList';
import BillDetail from './pages/BillDetail';
import UploadPage from './pages/Upload';
import ReviewQueue from './pages/ReviewQueue';
import Suppliers from './pages/Suppliers';
import Analytics from './pages/Analytics';
import Reminders from './pages/Reminders';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50/60 text-gray-900 flex flex-col font-sans">
          <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bills" element={<BillsList />} />
            <Route path="/bills/:id" element={<BillDetail />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/review" element={<ReviewQueue />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reminders" element={<Reminders />} />
          </Routes>
        </main>

        <footer className="border-t border-gray-200 bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
            <p>FinSense © 2026 — AI-Powered GST Invoice Intelligence & Bill Management</p>
            <p className="mt-1 text-gray-400">
              Deterministic verification • Privacy-first local processing • Audit-ready records
            </p>
          </div>
        </footer>
      </div>
    </Router>
  </AuthProvider>
);
}
