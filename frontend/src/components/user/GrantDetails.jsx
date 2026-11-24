// "Grants Application" section: this startup's grant applications + a form to apply
import React, { useState } from 'react';
import Cookie from 'js-cookie';
import { motion } from 'framer-motion'
import api, { getErrorMessage } from '../../api';

const emptyForm = {
  name: '',
  organization: '',
  email: '',
  phone: '',
  pan: '',
  aadhar: '',
  address: '',
  project_title: '',
  description: '',
  total_funding_required: '',
  funding_breakdown: [{ item: '', amount: '' }],
};

export default function GrantDetails({ grant, reload }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const startup = Cookie.get('startup');
  
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFundingChange = (index, e) => {
    const { name, value } = e.target;
    // Copy the row before changing it (never change React state directly)
    const updatedFundingBreakdown = formData.funding_breakdown.map((row, i) =>
      i === index ? { ...row, [name]: value } : row
    );
    setFormData({
      ...formData,
      funding_breakdown: updatedFundingBreakdown,
    });
  };

  const addFundingRow = () => {
    setFormData({
      ...formData,
      funding_breakdown: [...formData.funding_breakdown, { item: '', amount: '' }],
    });
  };

  const removeFundingRow = (index) => {
    const updatedFundingBreakdown = formData.funding_breakdown.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      funding_breakdown: updatedFundingBreakdown,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/submit/funds/${startup}`, formData);
      closeModal();
      reload(); // show the new application in the list
    } catch (error) {
      // The original form failed silently here; at least tell the user what went wrong
      alert(getErrorMessage(error));
    }
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-gray-200 to-gray-300 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-black">Grant Application Portal</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-teal-500 font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out"
              onClick={openModal}
            >
              Apply for Grant
            </motion.button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* A new startup has no grants yet: say so instead of showing an empty page */}
        {grant.length === 0 && (
          <p className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center text-gray-600">
            No grant applications yet. Click "Apply for Grant" to submit your first one.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {grant.map((g, index) => (
            <motion.div
              key={g._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-teal-800">{g.project_proposal.project_title}</h2>
                <p className="text-gray-600 mb-4"><strong>Description:</strong> {g.project_proposal.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-teal-600 font-semibold"><strong>Amount:</strong> {g.project_proposal.budget.total_funding_required}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      g.grant_status.status === "Approved"
                        ? "bg-green-200 text-green-800"
                        : g.grant_status.status === "Rejected"
                        ? "bg-red-200 text-red-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}>
                      <strong>Status:</strong> {g.grant_status.status}
                    </span>
                </div>
                {g.project_proposal.objectives && g.project_proposal.objectives.length > 0 && (
                  <div>
                    <strong className="text-teal-700">Objectives:</strong> {g.project_proposal.objectives.join(', ')}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white text-black rounded-lg w-full sm:w-[600px] max-w-[90vw] max-h-[90%] overflow-y-auto p-5 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
            <h2 className="text-xl font-bold mb-4">Grant Application Form</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Applicant Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Aadhar Number</label>
                <input
                  type="text"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Pan Number</label>
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Project Title</label>
                <input
                  type="text"
                  name="project_title"
                  value={formData.project_title}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Project Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Total Funding Required</label>
                <input
                  type="number"
                  name="total_funding_required"
                  value={formData.total_funding_required}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Funding Breakdown</label>
                {formData.funding_breakdown.map((fund, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      name="item"
                      value={fund.item}
                      onChange={(e) => handleFundingChange(index, e)}
                      className="border border-gray-300 p-2 w-1/2 rounded mr-2"
                      placeholder="Item"
                      required
                    />
                    <input
                      type="number"
                      name="amount"
                      value={fund.amount}
                      onChange={(e) => handleFundingChange(index, e)}
                      className="border border-gray-300 p-2 w-1/4 rounded mr-2"
                      placeholder="Amount"
                      required
                    />
                    <button
                      type="button"
                      className="bg-red-500 hover:bg-red-700 text-white p-2 rounded"
                      onClick={() => removeFundingRow(index)}
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="bg-green-500 hover:bg-green-700 text-white p-2 rounded"
                  onClick={addFundingRow}
                >
                  + Add Item
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
