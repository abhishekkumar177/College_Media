import { useEffect, useState } from 'react';
import api from '../services/api';
import { User, FileText, Star, Send, X } from 'lucide-react';

const AlumniResumeReview = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedResume, setSelectedResume] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comments: '',
    suggestions: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/resume/feed');
      setResumes(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching resume feed:', err);
      setError('Failed to load resume requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedResume) return;

    setSubmitting(true);
    try {
      const payload = {
        ...reviewForm,
        suggestions: reviewForm.suggestions.split('\n').filter(s => s.trim())
      };

      await api.post(`/resume/${selectedResume._id}/review`, payload);

      setResumes(prev => prev.filter(r => r._id !== selectedResume._id));
      setSelectedResume(null);
      setReviewForm({ rating: 5, comments: '', suggestions: '' }); // Reset form
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Error submitting review:', err);
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading requests...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="review-dashboard p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Resume Review Requests</h1>
      
      {resumes.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">No pending resume reviews at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {resumes.map(resume => (
            <div key={resume._id} className="card bg-white dark:bg-gray-800 p-6 border dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4 text-indigo-600 font-bold text-xl overflow-hidden">
                   {resume.student?.profilePicture ? (
                     <img src={resume.student.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     resume.student?.firstName?.[0] || <User size={20} />
                   )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {resume.student?.firstName} {resume.student?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">@{resume.student?.username}</p>
                </div>
                <span className="ml-auto text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full capitalize">
                  {resume.status}
                </span>
              </div>

              <div className="mb-4 space-y-2">
                {resume.fileUrl ? (
                   <a 
                     href={resume.fileUrl} 
                     target="_blank" 
                     rel="noreferrer"
                     className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded text-blue-600 hover:underline"
                   >
                     <FileText size={18} className="mr-2" /> View Attached Resume PDF
                   </a>
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300">
                    <p><strong>Experience:</strong> {resume.content?.experience?.[0]?.title} at {resume.content?.experience?.[0]?.company}...</p>
                    <p className="mt-1"><strong>Skills:</strong> {resume.content?.skills?.slice(0, 5).join(', ')}...</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedResume(resume)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex justify-center items-center"
              >
                Review Now
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
              <h2 className="font-bold text-lg dark:text-white">Reviewing {selectedResume.student?.firstName}'s Resume</h2>
              <button onClick={() => setSelectedResume(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitReview} className="p-6 overflow-y-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`${reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
                    >
                      <Star fill={reviewForm.rating >= star ? "currentColor" : "none"} size={28} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">General Feedback</label>
                <textarea
                  className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[100px]"
                  placeholder="Great structure, but try to quantify your achievements..."
                  value={reviewForm.comments}
                  onChange={(e) => setReviewForm({...reviewForm, comments: e.target.value})}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actionable Suggestions (One per line)</label>
                <textarea
                  className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[100px]"
                  placeholder="- Use active verbs&#10;- Remove high school education&#10;- Add link to portfolio"
                  value={reviewForm.suggestions}
                  onChange={(e) => setReviewForm({...reviewForm, suggestions: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setSelectedResume(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Send size={16} className="mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniResumeReview;