// Reviewer login (/reviewer/login)
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Loader } from 'lucide-react';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../Toast';
import api, { getErrorMessage } from '../../api';

const inputClass = 'block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500';

export default function ReviewerLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Already logged in? Go straight to the dashboard.
  useEffect(() => {
    if (Cookies.get('reviewer')) {
      navigate('/reviewer');
    }
  }, [navigate]);

  // Hide the toast after 2 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/review/login', formData);
      Cookies.set('reviewer', response.data.reviewerId);
      navigate('/reviewer');
    } catch (error) {
      setToast({ type: 'error', message: getErrorMessage(error) });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-100 flex items-center justify-center p-4">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="text-teal-600 hover:text-teal-700 transition-colors" title="Back to home">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h2 className="text-2xl font-bold text-center text-gray-700">Reviewer Login</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" name="email" required className={`mt-1 ${inputClass}`} value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  required
                  className={inputClass}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
            >
              {isLoading ? <Loader className="animate-spin h-5 w-5" /> : 'Login'}
            </button>
          </form>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <Link to="/reviewer/register" className="text-sm text-teal-600 hover:text-teal-700 transition-colors">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}
