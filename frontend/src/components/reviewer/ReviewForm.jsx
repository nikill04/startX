// Rating + comment form a reviewer fills in for ONE application (EIR or grant).
// Each application gets its own form, so typing in one does not change another.
//
// Props:
//   myReview         - this reviewer's entry in application.reviews (optional);
//                      the form starts with its saved rating and comment
//   disabled         - true = inputs locked and no Submit button (review already done)
//   clearAfterSubmit - true = empty the form after a successful submit
//   onSubmit         - called with (rating, comment); returns true when it was saved
import React, { useState } from 'react';

export default function ReviewForm({ myReview, disabled = false, clearAfterSubmit = false, onSubmit }) {
  const [rating, setRating] = useState(myReview?.rating || 0);
  const [comment, setComment] = useState(myReview?.comments?.join(', ') || '');

  const handleSubmit = async () => {
    const saved = await onSubmit(rating, comment);
    if (saved && clearAfterSubmit) {
      setRating(0);
      setComment('');
    }
  };

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
            disabled={disabled}
          />
          <span className="ml-2 text-lg font-semibold">{rating}</span>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
        <textarea
          id="comment"
          rows="4"
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
          placeholder="Enter your review here..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={disabled}
        ></textarea>
      </div>
      {!disabled && (
        <button
          onClick={handleSubmit}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300"
        >
          Submit Review
        </button>
      )}
    </div>
  );
}
