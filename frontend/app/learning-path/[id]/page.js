'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../../components/ui/Card';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { getLearningStyleIcon } from '../../../lib/utils';
import toast from 'react-hot-toast';

export default function LearningPathPage({ params }) {
  const router = useRouter();
  const { id: learnerId } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [pathData, setPathData] = useState(null);

  useEffect(() => {
    if (learnerId) {
      loadLearningPath();
    }
  }, [learnerId]);

  const loadLearningPath = async () => {
    try {
      setIsLoading(true);
      console.log('Loading learning path for learner:', learnerId);
      
      const response = await apiClient.getLearningPath(learnerId);
      console.log('Learning path response:', response);
      
      if (response.success && response.data) {
        setPathData(response.data);
      } else {
        throw new Error(response.error || 'Failed to load learning path');
      }
    } catch (error) {
      console.error('Error loading learning path:', error);
      toast.error('Failed to load learning path');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLearning = () => {
    if (pathData?.current_resource?.id) {
      router.push(`/quiz/${pathData.current_resource.id}?learner=${learnerId}`);
    } else {
      toast.error('No learning resource available');
    }
  };

  const handleViewProgress = () => {
    router.push(`/progress/${learnerId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  if (!pathData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">😞</div>
          <h2 className="text-2xl font-bold text-gray-900">No Learning Path Found</h2>
          <p className="text-gray-600">
            We couldn't find your learning path. This might be because:
          </p>
          <ul className="text-left text-gray-600 space-y-1">
            <li>• Your profile hasn't been created yet</li>
            <li>• The pretest wasn't completed</li>
            <li>• There was an error generating your path</li>
          </ul>
          <div className="space-x-4">
            <Button onClick={() => router.push('/create-profile')}>
              Create New Profile
            </Button>
            <Button variant="outline" onClick={() => router.push('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = pathData.total_resources > 0 
    ? (pathData.current_position / pathData.total_resources) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Personalized Learning Path
          </h1>
          <p className="text-gray-600">
            Follow your customized sequence of learning resources
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              Learning Progress
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(progressPercentage)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {pathData.current_position}
                  </div>
                  <div className="text-sm text-gray-600">Resources Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {pathData.total_resources}
                  </div>
                  <div className="text-sm text-gray-600">Total Resources</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {pathData.total_resources - pathData.current_position}
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Resource */}
        {pathData.current_resource ? (
          <Card className="mb-8 animate-slide-up">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Current Learning Resource
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">
                      {getLearningStyleIcon(pathData.current_resource.learning_style)}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {pathData.current_resource.title}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Type: {pathData.current_resource.type}</span>
                      <span>Topic: {pathData.current_resource.topic}</span>
                      <span>Level: {pathData.current_resource.difficulty_level}/5</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {pathData.current_resource.learning_style}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-4">
                <Button onClick={handleStartLearning} className="flex-1">
                  Start Learning
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleViewProgress}
                  className="flex-1"
                >
                  View Detailed Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 animate-slide-up">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Congratulations! 🎉
              </h2>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-6xl">🎓</div>
                <h3 className="text-lg font-semibold text-gray-900">
                  You've completed all learning resources!
                </h3>
                <p className="text-gray-600">
                  Great job on finishing your personalized learning path.
                </p>
                <Button onClick={handleViewProgress}>
                  View Your Progress Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Path Overview */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              Learning Path Overview
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pathData.all_resources && pathData.all_resources.slice(0, 8).map((resourceId, index) => (
                <div 
                  key={index}
                  className={`flex items-center space-x-4 p-4 rounded-lg border ${
                    index < pathData.current_position 
                      ? 'bg-green-50 border-green-200' 
                      : index === pathData.current_position
                      ? 'bg-primary-50 border-primary-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < pathData.current_position 
                      ? 'bg-green-500 text-white' 
                      : index === pathData.current_position
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index < pathData.current_position ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {index === pathData.current_position && pathData.current_resource
                        ? pathData.current_resource.title
                        : `Learning Resource ${index + 1}`
                      }
                    </div>
                    <div className="text-xs text-gray-600">
                      {index < pathData.current_position 
                        ? 'Completed' 
                        : index === pathData.current_position
                        ? 'In Progress'
                        : 'Upcoming'
                      }
                    </div>
                  </div>
                  {index < pathData.current_position && (
                    <div className="text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              
              {pathData.all_resources && pathData.all_resources.length > 8 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  And {pathData.all_resources.length - 8} more resources...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
          {pathData.current_resource && (
            <Button onClick={handleStartLearning}>
              Continue Learning
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}