'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api';
import Card, { CardContent, CardHeader } from '../../../components/ui/Card';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import Button from '../../../components/ui/Button';
import { formatDate, getLearningStyleName } from '../../../lib/utils';
import {
  ChartBarIcon,
  UserIcon,
  BookOpenIcon,
  ClockIcon,
  TrophyIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  ArrowLeftIcon,
  StarIcon,
  FireIcon,
  TargetIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ProgressPage({ params }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [learner, setLearner] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (params.id) {
      loadProgressData();
    }
  }, [params.id]);

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getLearnerProgress(params.id);
      
      if (response.success) {
        setLearner(response.learner);
        setProgress(response.progress);
      } else {
        throw new Error(response.error || 'Failed to load progress data');
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      toast.error('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueLearning = () => {
    router.push(`/learning-path/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 text-lg">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (!learner || !progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center py-16">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Progress Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              Unable to find progress data for this learner
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionPercentage = Math.round(progress.completion_percentage || 0);
  const currentStreak = progress.current_streak || 0;
  const totalQuizzes = progress.quiz_results?.length || 0;
  const averageScore = totalQuizzes > 0 
    ? Math.round(progress.quiz_results.reduce((sum, quiz) => sum + quiz.score, 0) / totalQuizzes)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <UserIcon className="h-8 w-8 mr-3 text-primary-600" />
                {learner.name}'s Progress
              </h1>
              <p className="text-gray-600 mt-1">
                Track learning journey and achievements
              </p>
            </div>
          </div>
          <Button
            onClick={handleContinueLearning}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            Continue Learning
          </Button>
        </div>

        {/* Learner Info Card */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                <AcademicCapIcon className="h-10 w-10 text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{learner.name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <BookOpenIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Subject:</span>
                    <span className="font-medium capitalize">{learner.subject}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TargetIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Style:</span>
                    <span className="font-medium">{getLearningStyleName(learner.learning_style)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{learner.knowledge_level}/5</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Joined:</span>
                    <span className="font-medium">{formatDate(learner.created_at)}</span>
                  </div>
                </div>
                {learner.weak_areas && learner.weak_areas.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-600 mr-2">Focus Areas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {learner.weak_areas.map((area, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <ArrowTrendingUpIcon className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {completionPercentage}%
              </div>
              <div className="text-sm text-blue-700 font-medium">Overall Progress</div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <FireIcon className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-green-600 mb-2">
                {currentStreak}
              </div>
              <div className="text-sm text-green-700 font-medium">Day Streak</div>
              <div className="text-xs text-green-600 mt-2">
                {currentStreak > 0 ? 'Keep it up!' : 'Start your streak today!'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <TrophyIcon className="h-10 w-10 text-purple-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {averageScore}%
              </div>
              <div className="text-sm text-purple-700 font-medium">Average Score</div>
              <div className="text-xs text-purple-600 mt-2">
                {totalQuizzes} quiz{totalQuizzes !== 1 ? 'es' : ''} completed
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <BookOpenIcon className="h-10 w-10 text-orange-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {progress.completed_resources?.length || 0}
              </div>
              <div className="text-sm text-orange-700 font-medium">Resources Completed</div>
              <div className="text-xs text-orange-600 mt-2">
                Keep learning!
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quiz Results */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-3 text-primary-600" />
                Quiz Performance
              </h2>
            </CardHeader>
            <CardContent>
              {totalQuizzes === 0 ? (
                <div className="text-center py-12">
                  <AcademicCapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No quizzes completed yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Complete your first quiz to see your performance here
                  </p>
                  <Button onClick={handleContinueLearning} size="sm">
                    Start Learning
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {progress.quiz_results.map((quiz, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          quiz.score >= 80 
                            ? 'bg-green-100 text-green-600' 
                            : quiz.score >= 60 
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {quiz.score >= 80 ? (
                            <CheckCircleIcon className="h-5 w-5" />
                          ) : (
                            <XCircleIcon className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Quiz #{index + 1}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(quiz.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          quiz.score >= 80 
                            ? 'text-green-600' 
                            : quiz.score >= 60 
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {quiz.score}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {quiz.questions_answered || 0} questions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Resources */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <BookOpenIcon className="h-6 w-6 mr-3 text-primary-600" />
                Completed Resources
              </h2>
            </CardHeader>
            <CardContent>
              {!progress.completed_resources || progress.completed_resources.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No resources completed yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start your learning journey to see completed resources here
                  </p>
                  <Button onClick={handleContinueLearning} size="sm">
                    Begin Learning
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {progress.completed_resources.map((resource, index) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {resource.title || `Resource ${index + 1}`}
                        </div>
                        <div className="text-xs text-gray-600">
                          Completed on {formatDate(resource.completed_at)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {resource.type || 'Resource'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-primary-50 to-purple-50 border-primary-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8 text-center">
              <PlayIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Continue Your Journey
              </h3>
              <p className="text-gray-600 mb-6">
                Pick up where you left off and continue making progress on your personalized learning path.
              </p>
              <Button 
                onClick={handleContinueLearning}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Resume Learning
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8 text-center">
              <ChartBarIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                View All Analytics
              </h3>
              <p className="text-gray-600 mb-6">
                Explore detailed analytics and insights about learning patterns across all users.
              </p>
              <Button 
                onClick={() => router.push('/admin')}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}