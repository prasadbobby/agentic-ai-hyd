'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../../components/ui/Card';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { getLearningStyleName } from '../../../lib/utils';
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  if (!pathData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Learning Path Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find your learning path. This might be because your profile hasn't been created yet or the pretest wasn't completed.
            </p>
            <div className="space-y-3">
              <Button onClick={() => router.push('/create-profile')} className="w-full">
                <span className="mr-2">👤</span>
                Create New Profile
              </Button>
              <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                <span className="mr-2">←</span>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = pathData.total_resources > 0 
    ? (pathData.current_position / pathData.total_resources) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
            >
              <span className="mr-2">←</span>
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <span className="text-2xl mr-3">📚</span>
                Your Learning Journey
              </h1>
              <p className="text-gray-600 mt-1">
                Follow your personalized learning path
              </p>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">📊</span>
              Learning Progress
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span className="font-medium">Overall Progress</span>
                  <span className="font-bold">{Math.round(progressPercentage)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all duration-1000 shadow-sm flex items-center justify-end pr-2"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    {progressPercentage > 10 && (
                      <span className="text-white text-xs">🔥</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="text-4xl mb-2">✅</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {pathData.current_position}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Resources Completed</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="text-4xl mb-2">📚</div>
                  <div className="text-2xl font-bold text-green-600">
                    {pathData.total_resources}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Total Resources</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {pathData.total_resources - pathData.current_position}
                  </div>
                  <div className="text-sm text-purple-700 font-medium">Remaining</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Resource */}
        {pathData.current_resource ? (
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-2xl mr-3">▶️</span>
                Current Learning Resource
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-4xl">🎓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {pathData.current_resource.title}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>📖</span>
                      <span>Type: {pathData.current_resource.type}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>🎯</span>
                      <span>Topic: {pathData.current_resource.topic}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>🏆</span>
                      <span>Level: {pathData.current_resource.difficulty_level}/5</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>🧠</span>
                      <span>Style: {getLearningStyleName(pathData.current_resource.learning_style)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      <span className="mr-1">🧠</span>
                      {pathData.current_resource.learning_style}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                      <span className="mr-1">📖</span>
                      {pathData.current_resource.type}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <Button 
                  onClick={handleStartLearning} 
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg"
                  size="lg"
                >
                  <span className="mr-2">▶️</span>
                  Start Learning
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleViewProgress}
                  className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                  size="lg"
                >
                  <span className="mr-2">📊</span>
                  View Detailed Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="text-8xl mb-6">🏆</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Congratulations! 🎉
              </h2>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                You've completed all learning resources!
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Amazing work on finishing your personalized learning path. You've shown dedication and commitment to your education.
              </p>
              <div className="space-y-4">
                <Button 
                  onClick={handleViewProgress}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  size="lg"
                >
                  <span className="mr-2">🏆</span>
                  View Your Achievements
                </Button>
                <div className="text-sm text-gray-500">
                  or continue exploring new topics
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Path Overview */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">📚</span>
              Learning Path Overview
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pathData.all_resources && pathData.all_resources.slice(0, 8).map((resourceId, index) => {
                const isCompleted = index < pathData.current_position;
                const isCurrent = index === pathData.current_position;
                
                return (
                  <div 
                    key={index}
                    className={`flex items-center space-x-4 p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                      isCompleted
                        ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-sm' 
                        : isCurrent
                        ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-md ring-2 ring-purple-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm ${
                      isCompleted
                        ? 'bg-green-500 text-white' 
                        : isCurrent
                        ? 'bg-purple-500 text-white animate-pulse'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isCompleted ? '✅' : isCurrent ? '▶️' : '⏰'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        {isCurrent && pathData.current_resource
                          ? pathData.current_resource.title
                          : `Learning Resource ${index + 1}`
                        }
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isCompleted
                            ? 'bg-green-100 text-green-700'
                            : isCurrent
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Upcoming'}
                        </span>
                        {isCurrent && pathData.current_resource && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 capitalize">
                              {pathData.current_resource.type}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">
                              Level {pathData.current_resource.difficulty_level}/5
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {isCurrent && (
                      <Button
                        onClick={handleStartLearning}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <span>→</span>
                      </Button>
                    )}
                  </div>
                );
              })}
              
              {pathData.all_resources && pathData.all_resources.length > 8 && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    <span className="mr-2">📚</span>
                    And {pathData.all_resources.length - 8} more resources in your path...
                  </div>
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
            className="border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            <span className="mr-2">←</span>
            Back to Home
          </Button>
          {pathData.current_resource && (
            <Button 
              onClick={handleStartLearning}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg"
            >
              <span className="mr-2">▶️</span>
              Continue Learning
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}