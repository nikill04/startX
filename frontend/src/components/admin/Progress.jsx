// /progress/:startup : charts of one startup's monthly revenue and expenses (admin only)
import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import api from '../../api';

// Card component to display individual financial metrics
const Card = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between" style={{
    background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)'
  }}>
    <div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
    </div>
    <div className="text-blue-500 text-4xl">{icon}</div>
  </div>
);

export default function StartupProgress() {
  const [data, setData] = useState([]); // the startup's monthly progress reports
  const { startup } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!Cookies.get('admin')) {
      navigate('/admin/login');
      return;
    }
    api
      .get(`/admin/progress/${startup}`)
      .then((response) => setData(response.data))
      .catch((error) => console.error('Error fetching progress:', error));
  }, [startup, navigate]);

  // Totals for the summary cards
  const totalRevenue = data.reduce((sum, entry) => sum + (entry.financials?.revenue || 0), 0);
  const totalExpenses = data.reduce((sum, entry) => sum + (entry.financials?.expenses || 0), 0);
  const profit = totalRevenue - totalExpenses;

  return (
    <div className="container mx-auto p-4 space-y-8 bg-blue-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-800">Startup Progress Dashboard</h1>

      <div className="mb-4">
        <Link to="/admin" className="inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          ← Back to Admin
        </Link>
      </div>

      {data.length === 0 && (
        <p className="text-center text-blue-800">This startup has not submitted any monthly reports yet.</p>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon="💰" />
        <Card title="Total Expenses" value={`₹${totalExpenses.toLocaleString()}`} icon="💸" />
        <Card title={profit >= 0 ? 'Profit' : 'Loss'} value={`₹${Math.abs(profit).toLocaleString()}`} icon={profit >= 0 ? '📈' : '📉'} />
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md" style={{
        background: 'linear-gradient(135deg, #f0f8ff 0%, #ffffff 100%)'
      }}>
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">Revenue vs Expenses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="financials.revenue" fill="#4299e1" name="Revenue" />
            <Bar dataKey="financials.expenses" fill="#48bb78" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md" style={{
        background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)'
      }}>
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">Financial Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="financials.revenue" stroke="#4299e1" name="Revenue" />
            <Line type="monotone" dataKey="financials.expenses" stroke="#48bb78" name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Milestone Timeline */}
      <div className="bg-white p-6 rounded-lg shadow-md" style={{
        background: 'linear-gradient(135deg, #f0f8ff 0%, #ffffff 100%)'
      }}>
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">Milestone Timeline</h2>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={item._id} className="flex items-center space-x-4">
              <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold bg-blue-500">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-800">{item.milestones}</h3>
                <p className="text-sm text-blue-600">{item.month || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
