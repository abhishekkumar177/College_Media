import { useState } from 'react';
import api from '../services/api'; 
import { Plus, Trash2, Upload, Save } from 'lucide-react';

const ResumeBuilder = () => {
  const [activeTab, setActiveTab] = useState('build');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    experience: [{ title: '', company: '', duration: '', description: '' }],
    education: [{ degree: '', institution: '', year: '' }],
    skills: '',
    projects: [{ title: '', description: '', link: '' }]
  });

  const [resumeFile, setResumeFile] = useState(null);

  const handleInputChange = (section, index, field, value) => {
    const updatedSection = [...formData[section]];
    updatedSection[index][field] = value;
    setFormData({ ...formData, [section]: updatedSection });
  };

  const addField = (section, emptyTemplate) => {
    setFormData({
      ...formData,
      [section]: [...formData[section], emptyTemplate]
    });
  };

  const removeField = (section, index) => {
    const updatedSection = formData[section].filter((_, i) => i !== index);
    setFormData({ ...formData, [section]: updatedSection });
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let payload = {};

      if (activeTab === 'upload') {
        if (!resumeFile) {
          throw new Error('Please select a file first.');
        }
        const fileUrl = await handleFileUpload(resumeFile);
        
        payload = {
          fileUrl,
          status: 'submitted'
        };
      } else {
        payload = {
          ...formData,
          skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
          status: 'submitted'
        };
      }

      await api.post('/resume', payload);
      
      setMessage({ type: 'success', text: 'Resume submitted successfully for review!' });
    } catch (error) {
      console.error('Resume submission error:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit resume.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Resume Builder</h1>
      
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button 
          onClick={() => setActiveTab('build')} 
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'build' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Build from Scratch
        </button>
        <button 
          onClick={() => setActiveTab('upload')} 
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'upload' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Upload PDF
        </button>
      </div>

      {message.text && (
        <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {activeTab === 'build' ? (
          <div className="space-y-8">
            
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Experience</h2>
                <button 
                  type="button"
                  onClick={() => addField('experience', { title: '', company: '', duration: '', description: '' })}
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <Plus size={16} className="mr-1" /> Add Experience
                </button>
              </div>
              {formData.experience.map((exp, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => handleInputChange('experience', index, 'title', e.target.value)}
                      className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => handleInputChange('experience', index, 'company', e.target.value)}
                      className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Duration (e.g. Jan 2022 - Present)"
                    value={exp.duration}
                    onChange={(e) => handleInputChange('experience', index, 'duration', e.target.value)}
                    className="w-full p-2 mb-3 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <textarea
                    placeholder="Description of responsibilities"
                    value={exp.description}
                    onChange={(e) => handleInputChange('experience', index, 'description', e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white h-24"
                  />
                  {formData.experience.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeField('experience', index)}
                      className="mt-2 text-red-500 text-sm flex items-center hover:text-red-700"
                    >
                      <Trash2 size={14} className="mr-1" /> Remove
                    </button>
                  )}
                </div>
              ))}
            </section>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Education</h2>
                <button 
                  type="button"
                  onClick={() => addField('education', { degree: '', institution: '', year: '' })}
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <Plus size={16} className="mr-1" /> Add Education
                </button>
              </div>
              {formData.education.map((edu, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Degree / Course"
                      value={edu.degree}
                      onChange={(e) => handleInputChange('education', index, 'degree', e.target.value)}
                      className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Institution / College"
                      value={edu.institution}
                      onChange={(e) => handleInputChange('education', index, 'institution', e.target.value)}
                      className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Year of Completion"
                      value={edu.year}
                      onChange={(e) => handleInputChange('education', index, 'year', e.target.value)}
                      className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  {formData.education.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeField('education', index)}
                      className="mt-2 text-red-500 text-sm flex items-center hover:text-red-700"
                    >
                      <Trash2 size={14} className="mr-1" /> Remove
                    </button>
                  )}
                </div>
              ))}
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Skills</h2>
              <textarea
                placeholder="Enter skills separated by commas (e.g. React, Node.js, Python, Leadership)"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
                rows="3"
              />
            </section>

          </div>
        ) : (
          <div className="upload-section py-10 px-4 border-2 border-dashed border-gray-300 rounded-lg text-center dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="hidden"
            />
            <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
              <Upload size={48} className="text-gray-400 mb-4" />
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {resumeFile ? resumeFile.name : 'Click to Upload Resume (PDF/DOC)'}
              </span>
              <span className="text-sm text-gray-500 mt-2">Maximum file size: 5MB</span>
            </label>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? 'Submitting...' : (
              <>
                {activeTab === 'build' ? <Save className="mr-2" size={18} /> : <Upload className="mr-2" size={18} />}
                Submit for Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResumeBuilder;