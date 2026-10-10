import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Contact from './pages/Contact';
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
    <Router>
      <div className="min-h-screen bg-[#F2F2F2] text-black flex flex-col font-sans selection:bg-black selection:text-white">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/bills" element={<BillsList />} />
            <Route path="/bills/:id" element={<BillDetail />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/review" element={<ReviewQueue />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reminders" element={<Reminders />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
