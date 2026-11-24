// "EIR Application" section: list of this startup's EIR applications + a form to apply
import React, { useState } from 'react'
import Cookie from 'js-cookie'
import { motion, AnimatePresence } from 'framer-motion'
import api, { getErrorMessage } from '../../api'
import { getStatusColor } from '../../status'

export default function EIRDetails({ eirList, reload }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const startup = Cookie.get('startup')

  const [entrepreneurName, setEntrepreneurName] = useState('')
  const [entrepreneurEmail, setEntrepreneurEmail] = useState('')
  const [entrepreneurBackground, setEntrepreneurBackground] = useState('')
  const [entrepreneurIndustryExperience, setEntrepreneurIndustryExperience] = useState('')
  const [previousVentures, setPreviousVentures] = useState('')
  const [startupName, setStartupName] = useState('')
  const [mentorshipStartups, setMentorshipStartups] = useState('')
  const [personalGoals, setPersonalGoals] = useState('')

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = {
      entrepreneur: {
        name: entrepreneurName,
        background: entrepreneurBackground,
        email: entrepreneurEmail,
        industry_experience: entrepreneurIndustryExperience,
        previous_ventures: previousVentures,
      },
      startup_name: startupName,
      objectives: {
        mentorship_startups: mentorshipStartups,
        personal_goals: personalGoals,
      },
    }

    try {
      await api.post(`/submit/eir/${startup}`, formData)
      closeModal()
      reload() // show the new application in the list
    } catch (error) {
      alert(getErrorMessage(error))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-b from-gray-200 to-gray-300 min-h-screen p-6"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#00ADB5] hover:bg-[#00A1A1] text-white font-bold py-2 px-4 rounded transition duration-300"
            onClick={openModal}
          >
            Apply for EIR
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-gradient-to-b from-gray-200 to-gray-300 p-6 rounded-lg shadow-md"
        >
          <h2 className="text-3xl font-bold text-black mb-6">EIR Applications</h2>
          {eirList.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {eirList.map((eir, index) => (
                <motion.div
                  key={eir._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  whileHover={{ scale: 1.03 }}
                  className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <h3 className="text-lg font-semibold text-[#00ADB5] mb-2">Application #{index + 1}</h3>
                  <p className="text-gray-700">
                    <strong>Startup Name:</strong> {eir.startup_name}
                  </p>
                  <p className="text-gray-700">
                    <strong>Entrepreneur:</strong> {eir.entrepreneur.name}
                  </p>
                   <div className="flex-1">
                <span
                  className={`px-3 py-1 rounded font-semibold ${getStatusColor(eir.status?.status)}`}
                >
                  {eir.status?.status || 'N/A'}
                </span>
              </div>
                  <p className="text-gray-700 mt-2">
                    <strong>Personal Goals:</strong> {eir.objectives?.personal_goals || 'No goals provided.'}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-gray-700">No EIR applications available.</p>
          )}
        </motion.div>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold text-[#00ADB5] mb-4">EIR Application Form</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-lg text-[#00ADB5]">Entrepreneur Information</h3>
                <div>
                  <label className="block text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={entrepreneurName}
                    onChange={(e) => setEntrepreneurName(e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Email</label>
                  <input
                    type="text"
                    value={entrepreneurEmail}
                    onChange={(e) => setEntrepreneurEmail(e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Background</label>
                  <textarea
                    value={entrepreneurBackground}
                    onChange={(e) => setEntrepreneurBackground(e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Industry Experience</label>
                  <input
                    type="text"
                    value={entrepreneurIndustryExperience}
                    onChange={(e) => setEntrepreneurIndustryExperience(e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Previous Ventures</label>
                    <input
                      type="text"
                      value={previousVentures}
                      onChange={(e) => setPreviousVentures( e.target.value)}
                      className="border border-gray-300 p-2 w-full rounded mb-2"
                    />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Startup Name</label>
                  <input
                    type="text"
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded"
                    required
                  />
                </div>

                <h3 className="font-bold text-lg text-[#00ADB5] mt-6">Objectives</h3>

                <div>
                  <label className="block text-gray-700 mb-1">Mentorship Startups</label>
                    <input
                      type="text"
                      value={mentorshipStartups}
                      onChange={(e) => setMentorshipStartups( e.target.value)}
                      className="border border-gray-300 p-2 w-full rounded mb-2"
                    />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Personal Goals</label>
                  <textarea
                    value={personalGoals}
                    onChange={(e) => setPersonalGoals(e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded"
                  />
                </div>

                  <div className="flex justify-end space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300"
                      onClick={closeModal}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="bg-[#00ADB5] hover:bg-[#00A1A1] text-white font-bold py-2 px-4 rounded transition duration-300"
                    >
                      Submit
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}