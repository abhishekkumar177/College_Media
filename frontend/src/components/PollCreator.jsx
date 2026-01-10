/**
 * PollCreator Component
 * Issue #342: Polls System
 * Poll creation form for CreatePost modal
 */

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import * as pollHelpers from '../utils/pollHelpers';

const PollCreator = ({ onPollCreate, onCancel }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState({ value: 1, unit: 'days' });
  const [allowVoteChange, setAllowVoteChange] = useState(true);
  const [errors, setErrors] = useState({});

  const durationOptions = pollHelpers.getPollDurationOptions();

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleDurationChange = (e) => {
    const selectedOption = durationOptions.find(opt => opt.label === e.target.value);
    if (selectedOption) {
      setDuration({
        value: selectedOption.value,
        unit: selectedOption.unit,
      });
    }
  };

  const handleSubmit = () => {
    // Validate
    const pollData = {
      question: question.trim(),
      options: options.filter(opt => opt.trim()),
    };

    const validation = pollHelpers.validatePollData(pollData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Create poll data
    const pollInfo = {
      question: question.trim(),
      options: options.map(opt => opt.trim()).filter(Boolean),
      duration: duration.value,
      durationUnit: duration.unit,
      allowVoteChange,
    };

    onPollCreate(pollInfo);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-indigo-200 p-4 my-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:poll" className="text-indigo-500 text-2xl" />
          <h3 className="font-semibold text-gray-900">Create Poll</h3>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon icon="mdi:close" className="text-xl" />
        </button>
      </div>

      {/* Question Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Poll Question
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          maxLength={200}
          className={`
            w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            ${errors.question ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {errors.question && (
          <p className="text-red-500 text-xs mt-1">{errors.question}</p>
        )}
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            {question.length}/200
          </span>
        </div>
      </div>

      {/* Options */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Poll Options (2-6)
        </label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-gray-500 font-medium min-w-[1.5rem]">
                {index + 1}.
              </span>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {options.length > 2 && (
                <button
                  onClick={() => handleRemoveOption(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Icon icon="mdi:delete" className="text-xl" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.options && (
          <p className="text-red-500 text-xs mt-1">{errors.options}</p>
        )}
        
        {/* Add Option Button */}
        {options.length < 6 && (
          <button
            onClick={handleAddOption}
            className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
          >
            <Icon icon="mdi:plus-circle" className="text-lg" />
            Add Option
          </button>
        )}
      </div>

      {/* Poll Settings */}
      <div className="mb-4 space-y-3">
        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poll Duration
          </label>
          <select
            value={durationOptions.find(opt => 
              opt.value === duration.value && opt.unit === duration.unit
            )?.label || '1 Day'}
            onChange={handleDurationChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {durationOptions.map((opt) => (
              <option key={opt.label} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Allow Vote Change */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allowVoteChange"
            checked={allowVoteChange}
            onChange={(e) => setAllowVoteChange(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
          />
          <label htmlFor="allowVoteChange" className="text-sm text-gray-700">
            Allow users to change their vote
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
        <button
          onClick={handleSubmit}
          className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:check" className="text-xl" />
          Create Poll
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PollCreator;
