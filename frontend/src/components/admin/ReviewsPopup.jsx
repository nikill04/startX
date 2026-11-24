// Popup that lists the finished reviews of an EIR or grant application
import React from 'react';
import { Star, X } from 'lucide-react';

export default function ReviewsPopup({ reviews, onClose }) {
  const finished = reviews.filter((review) => review.status === 'completed');
  const pending = reviews.length - finished.length;
  const averageRating = finished.length
    ? (finished.reduce((total, review) => total + review.rating, 0) / finished.length).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-lg w-full md:w-1/2 lg:w-1/3 max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()} // clicks inside the box should not close it
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Reviews</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {averageRating && (
          <div className="flex items-center mb-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="ml-2 text-gray-600 text-sm">Average Rating: {averageRating} / 5</span>
          </div>
        )}
        {pending > 0 && <p className="text-sm text-gray-500 mb-2">{pending} reviewer(s) have not reviewed yet.</p>}

        {finished.length === 0 ? (
          <p className="text-center text-gray-500">No reviews submitted yet.</p>
        ) : (
          finished.map((review) => (
            <div key={review._id} className="p-4 border-b last:border-none">
              <p className="text-sm"><strong>Reviewer:</strong> {review.reviewer_name}</p>
              <p className="text-sm"><strong>Organization:</strong> {review.reviewer_organization || 'N/A'}</p>
              <p className="text-sm"><strong>Rating:</strong> {review.rating} / 5</p>
              <p className="text-sm"><strong>Comments:</strong> {review.comments.join(', ') || 'None'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
