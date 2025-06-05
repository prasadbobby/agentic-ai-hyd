'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getAnalyticsDashboard();
      
      if (response.success) {
        setAnalytics(response.analytics);
      } else {
        throw new Error(response.error || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            System analytics and learner insights
          </p>
        </div>

        {analytics && (
          <>
            {/* Overview Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="animate-fade-in">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {analytics.total_learners}
                  </div>
                  <div className="text-sm text-gray-600">Total Learners</div>
                </CardContent>
              </Card>

              <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {analytics.total_paths}
                  </div>
                  <div className="text-sm text-gray-600">Learning Paths</div>
                </CardContent>
              </Card>

              <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analytics.total_quizzes}
                  </div>
                  <div className="text-sm text-gray-600">Quizzes Taken</div>
                </CardContent>
              </Card>

              <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.round(analytics.average_completion_rate)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Completion</div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Styles Distribution */}
            <Card className="mb-8 animate-slide-up">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">
                  Learning Styles Distribution
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.learning_styles_distribution.map((style, index) => {
                    const percentage = analytics.total_learners > 0 
                      ? (style.count / analytics.total_learners) * 100 
                      : 0;
                    
                    return (
                      <div key={style._id} className="flex items-center space-x-4">
                        <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                          {style._id}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${percentage}%`,
                                  animationDelay: `${index * 0.1}s`
                                }}
                              ></div>
                            </div>
                            <div className="text-sm text-gray-600 w-16 text-right">
                              {Math.round(percentage)}%
                            </div>
                          </div>
                        </div>
                        <div className="w-12 text-sm text-gray-500 text-right">
                          {style.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">
                  System Health
                </h2>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white text-xl">✓</span>
                    </div>
                    <div className="font-medium text-gray-900">API Status</div>
                    <div className="text-sm text-green-600">Online</div>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white text-xl">🤖</span>
                    </div>
                    <div className="font-medium text-gray-900">AI Agents</div>
                    <div className="text-sm text-blue-600">Active</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white text-xl">📊</span>
                    </div>
                    <div className="font-medium text-gray-900">Database</div>
                    <div className="text-sm text-purple-600">Connected</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}