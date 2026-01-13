/**
 * Alumni Connect Service
 * API calls for alumni networking features
 */

import api from './api';

/**
 * Alumni Profile Management
 */

// Create alumni profile
export const createAlumniProfile = async (profileData) => {
  const response = await api.post('/alumni/profile', profileData);
  return response.data;
};

// Get alumni profile (own or by user ID)
export const getAlumniProfile = async (userId = null) => {
  const endpoint = userId ? `/alumni/profile/${userId}` : '/alumni/profile';
  const response = await api.get(endpoint);
  return response.data;
};

// Update alumni profile
export const updateAlumniProfile = async (updateData) => {
  const response = await api.put('/alumni/profile', updateData);
  return response.data;
};

// Search alumni with filters
export const searchAlumni = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.graduationYear) params.append('graduationYear', filters.graduationYear);
  if (filters.major) params.append('major', filters.major);
  if (filters.company) params.append('company', filters.company);
  if (filters.location) params.append('location', filters.location);
  if (filters.skill) params.append('skill', filters.skill);
  if (filters.mentorshipAvailable !== undefined) params.append('mentorshipAvailable', filters.mentorshipAvailable);
  if (filters.willingToHire !== undefined) params.append('willingToHire', filters.willingToHire);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await api.get(`/alumni/search?${params.toString()}`);
  return response.data;
};

/**
 * Alumni Connections
 */

// Send connection request
export const sendConnectionRequest = async (recipientId, message = '') => {
  const response = await api.post('/alumni/connections/request', {
    recipientId,
    message
  });
  return response.data;
};

// Respond to connection request
export const respondToConnection = async (connectionId, status) => {
  const response = await api.put(`/alumni/connections/${connectionId}`, { status });
  return response.data;
};

// Get my connections
export const getMyConnections = async (status = 'accepted') => {
  const response = await api.get(`/alumni/connections?status=${status}`);
  return response.data;
};

/**
 * Alumni Events
 */

// Create event
export const createAlumniEvent = async (eventData) => {
  const response = await api.post('/alumni/events', eventData);
  return response.data;
};

// Get events
export const getAlumniEvents = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.eventType) params.append('eventType', filters.eventType);
  if (filters.status) params.append('status', filters.status);
  if (filters.upcoming !== undefined) params.append('upcoming', filters.upcoming);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await api.get(`/alumni/events?${params.toString()}`);
  return response.data;
};

// Register for event
export const registerForEvent = async (eventId) => {
  const response = await api.post(`/alumni/events/${eventId}/register`);
  return response.data;
};

/**
 * Statistics
 */

// Get alumni statistics
export const getAlumniStats = async () => {
  const response = await api.get('/alumni/stats');
  return response.data;
};

export default {
  createAlumniProfile,
  getAlumniProfile,
  updateAlumniProfile,
  searchAlumni,
  sendConnectionRequest,
  respondToConnection,
  getMyConnections,
  createAlumniEvent,
  getAlumniEvents,
  registerForEvent,
  getAlumniStats
};
