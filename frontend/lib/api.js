import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
 baseURL: API_BASE_URL,
 headers: {
   'Content-Type': 'application/json',
 },
 timeout: 30000,
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
 console.log('API Request:', request.method?.toUpperCase(), request.url, request.data);
 return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
 response => {
   console.log('API Response:', response.status, response.data);
   return response;
 },
 error => {
   console.error('API Error:', error.response?.data || error.message);
   return Promise.reject(error);
 }
);

export const apiClient = {
 // Health check
 healthCheck: async () => {
   const response = await api.get('/api/health');
   return response.data;
 },

 // Seed resources
 seedResources: async () => {
   const response = await api.post('/api/resources/seed');
   return response.data;
 },

 // Learner management
 createLearner: async (profileData) => {
   const response = await api.post('/api/learner/create', profileData);
   return response.data;
 },

 // Pretest
 conductPretest: async (learnerId, subject) => {
   const response = await api.post(`/api/learner/${learnerId}/pretest`, { subject });
   return response.data;
 },

 submitPretest: async (pretestId, answers) => {
   const response = await api.post(`/api/pretest/${pretestId}/submit`, { answers });
   return response.data;
 },

 // Learning path
 getLearningPath: async (learnerId) => {
   const response = await api.get(`/api/learner/${learnerId}/path`);
   return response.data;
 },

 // Quiz
 getResourceQuiz: async (resourceId) => {
   const response = await api.get(`/api/resource/${resourceId}/quiz`);
   return response.data;
 },

 submitQuiz: async (quizId, learnerId, answers) => {
   const response = await api.post(`/api/quiz/${quizId}/submit`, { 
     quiz_id: quizId,
     learner_id: learnerId,
     answers 
   });
   return response.data;
 },

 // Progress
 getLearnerProgress: async (learnerId) => {
   const response = await api.get(`/api/learner/${learnerId}/progress`);
   return response.data;
 },

 // Analytics
 getAnalyticsDashboard: async () => {
   const response = await api.get('/api/analytics/dashboard');
   return response.data;
 }
};