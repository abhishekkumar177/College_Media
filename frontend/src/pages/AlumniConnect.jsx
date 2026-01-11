import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

const AlumniConnect = () => {
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Replace with actual API call
  useEffect(() => {
    setTimeout(() => {
      setAlumniList([
        {
          _id: '1',
          firstName: 'James',
          lastName: 'L.',
          alumniDetails: {
            company: 'Google',
            designation: 'Software Engineer',
            graduationYear: 2022,
            industry: 'Tech',
            isOpenToMentorship: true
          },
          profilePicture: null
        },
        {
          _id: '2',
          firstName: 'Sarah',
          lastName: 'K.',
          alumniDetails: {
            company: 'Deloitte',
            designation: 'Consultant',
            graduationYear: 2021,
            industry: 'Finance',
            isOpenToMentorship: false
          },
          profilePicture: null
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleConnect = (id) => {
    console.log("Connect request sent to user:", id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Alumni Connect</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Connect with seniors, seek mentorship, and explore career opportunities.
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        {['all', 'mentorship', 'hiring'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === type
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading alumni network...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumniList.map((alumni) => (
            <div key={alumni._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-500">
                    {alumni.profilePicture ? (
                      <img src={alumni.profilePicture} alt={alumni.firstName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      alumni.firstName[0]
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {alumni.firstName} {alumni.lastName}
                    </h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      Class of '{alumni.alumniDetails?.graduationYear}
                    </p>
                  </div>
                </div>
                {alumni.alumniDetails?.isOpenToMentorship && (
                  <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] px-2 py-1 rounded-full font-medium">
                    Mentoring
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Icon icon="lucide:briefcase" className="w-4 h-4" />
                  <span>{alumni.alumniDetails?.designation} at <strong>{alumni.alumniDetails?.company}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Icon icon="lucide:building-2" className="w-4 h-4" />
                  <span>{alumni.alumniDetails?.industry}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleConnect(alumni._id)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Connect
                </button>
                <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                  <Icon icon="lucide:message-circle" className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumniConnect;