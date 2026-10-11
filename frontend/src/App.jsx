import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Contact from './pages/Contact';
import BillsList from './pages/BillsList';
import BillDetail from './pages/BillDetail';
import UploadPage from './pages/Upload';
import ReviewQueue from './pages/ReviewQueue';
import Suppliers from './pages/Suppliers';
import Analytics from './pages/Analytics';
import Reminders from './pages/Reminders';
import Batches from './pages/Batches';
import Inbox from './pages/Inbox';
import Integrations from './pages/Integrations';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#F2F2F2] text-black flex flex-col font-sans selection:bg-black selection:text-white">
          <Navbar />
          <AuthModal />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/bills" element={<BillsList />} />
              <Route path="/bills/:id" element={<BillDetail />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/review" element={<ReviewQueue />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/batches" element={<Batches />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/settings/integrations" element={<Integrations />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
