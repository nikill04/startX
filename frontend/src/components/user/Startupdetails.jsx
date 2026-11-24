// "Startup Details" section: company info on the left, latest progress reports on the right
import React from 'react'
import { motion } from 'framer-motion'
import { API_URL } from '../../api'

// Profile pictures are stored as "data:image/..." text. Very old ones were files on the server,
// and startups without a picture get the server's default.png.
function pictureUrl(picture) {
  if (picture && picture.startsWith('data:')) return picture
  return `${API_URL}/uploads/profiles/${picture || 'default.png'}`
}

export default function StartupDetails({ kyc, progress }) {
  const latestProgress = [...progress].reverse().slice(0, 4) // newest first

  return (
    <div className="container mx-auto p-4 space-y-6 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Left column: Startup Details */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 md:p-5">
            <div className="flex items-center space-x-3 pb-3">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-sm">
                <img
                  src={pictureUrl(kyc.profile_picture)}
                  alt={kyc.company_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">{kyc.company_name}</h2>
                <p className="text-gray-500 text-sm">{kyc.company_details?.industry}</p>
              </div>
            </div>
            <div className="space-y-3 text-gray-600 text-sm">
              <p><strong>Address:</strong> {kyc.address}</p>
              <p><strong>Contact Person:</strong> {kyc.contact_person?.name}</p>
              <p><strong>Email:</strong> {kyc.contact_person?.email}</p>
              <p><strong>Phone:</strong> {kyc.contact_person?.phone}</p>
              <p>
                <strong>Website:</strong>{" "}
                <a
                  href={kyc.company_details?.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-500 hover:text-teal-700 transition-colors duration-300"
                >
                  {kyc.company_details?.website}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Progress List */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 md:p-5">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Latest Progress</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {latestProgress.map((monthData, index) => (
                <motion.div
                  key={monthData._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className="p-3 rounded-lg bg-teal-100 shadow-sm"
                >
                  <h4 className="text-base font-medium text-gray-800">{monthData.month}</h4>
                  <div className="space-y-1 text-gray-600 text-sm">
                    <p><strong>Milestone:</strong> {monthData.milestones}</p>
                    <p><strong>Issues:</strong> {monthData.issues_faced}</p>
                    <div className="flex justify-between">
                      <p><strong>Revenue:</strong> ${monthData.financials?.revenue}</p>
                      <p><strong>Expenses:</strong> ${monthData.financials?.expenses}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
