// Rating + comment form a reviewer fills in for ONE application (EIR or grant).
// Each application gets its own form, so typing in one does not change another.
//
// Props:
//   myReview - this reviewer's entry in application.reviews
//   onSubmit - called with (rating, comment)
import React, { useState } from 'react';

export default function ReviewForm({ myReview, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const isDone = myReview?.status === 'completed';

  if (isDone) {
    return (
      <div className="mt-8 border-t border-gray-200 pt-4">
        <h2 className="text-lg font-semibold text-purple-700 mb-2">Your Review</h2>
        <p><strong>Rating:</strong> {myReview.rating} / 5</p>
        <p><strong>Comment:</strong> {myReview.comments.join(', ') || 'None'}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-gray-200 pt-4">
      <h2 className="text-lg font-semibold text-purple-700 mb-4">Submit Your Review</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <div className="flex items-center">
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="ml-2 text-lg font-semibold">{rating}</span>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
        <textarea
          rows="4"
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter your review here..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <button
        onClick={() => onSubmit(rating, comment)}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300"
      >
        Submit Review
      </button>
    </div>
  );
}
