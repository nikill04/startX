// Popup that lists the finished reviews of an EIR or grant application
import React from 'react';
import { Star, X } from 'lucide-react';

export default function ReviewsPopup({ reviews, onClose }) {
  const submittedReviews = reviews.filter((review) => review.status !== 'pending');
  // Rounded to 1 decimal so 10/3 shows as 3.3, not 3.3333333333
  const averageRating = submittedReviews.length
    ? Number((submittedReviews.reduce((total, review) => total + review.rating, 0) / submittedReviews.length).toFixed(1))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Reviews</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {submittedReviews.length !== 0 && (
            <div className="flex items-center mb-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="ml-2 text-gray-600 text-sm">Average Rating: {averageRating}</span>
            </div>
          )}
          {reviews.length > 0 ? (
            submittedReviews.map((review, index) => (
              <div key={review._id || index} className="p-4 border-b last:border-none">
                <p className="text-sm"><strong>Reviewer:</strong> {review.reviewer_name}</p>
                <p className="text-sm"><strong>Organization:</strong> {review.reviewer_organization}</p>
                <p className="text-sm"><strong>Rating:</strong> {review.rating}</p>
                <p className="text-sm"><strong>Comments:</strong> {review.comments?.join(', ')}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No reviews available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
