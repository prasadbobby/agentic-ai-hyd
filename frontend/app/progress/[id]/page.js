'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../../components/ui/Card';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { formatDate, getScoreColor, getLearningStyleIcon } from '../../../lib/utils';
import toast from 'react-hot-toast';

export default function ProgressPage({ params }) {
  const router = useRouter();
  const { id: learnerId } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);

  useEffect(() => {
    if (learnerId) {
      loadProgress();
    }
  }, [learnerId]);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      console.log('Loading progress for learner:', learnerId);
      
      const response = await apiClient.getLearnerProgress(learnerId);
      console.log('Progress response:', response);
      
      if (response.success && response.data) {
        setProgressData(response.data);
      } else {
        throw new Error(response.error || 'Failed to load progress');
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      toast.error('Failed to load progress');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No progress data found</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const { learner_profile, learning_path, progress_details } = progressData;
  const progressEntries = Object.entries(progress_details || {});

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Learning Progress Dashboard
          </h1>
          <p className="text-gray-600">
            Track your learning journey and achievements
          </p>
        </div>

        {/* Profile Overview */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
             Learner Profile
           </h2>
         </CardHeader>
         <CardContent>
           <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-4">
               <div>
                 <h3 className="text-lg font-medium text-gray-900 mb-2">
                   {learner_profile.name}
                 </h3>
                 <div className="space-y-2 text-sm text-gray-600">
                   <div className="flex items-center space-x-2">
                     <span>Learning Style:</span>
                     <span className="inline-flex items-center space-x-1">
                       <span>{getLearningStyleIcon(learner_profile.learning_style)}</span>
                       <span className="capitalize">{learner_profile.learning_style}</span>
                     </span>
                   </div>
                   <div>Subject: <span className="capitalize">{learner_profile.subject}</span></div>
                   <div>Knowledge Level: {learner_profile.knowledge_level}/5</div>
                   <div>Joined: {formatDate(learner_profile.created_at)}</div>
                 </div>
               </div>

               {learner_profile.weak_areas && learner_profile.weak_areas.length > 0 && (
                 <div>
                   <h4 className="font-medium text-gray-900 mb-2">Focus Areas</h4>
                   <div className="flex flex-wrap gap-2">
                     {learner_profile.weak_areas.map((area, index) => (
                       <span
                         key={index}
                         className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                       >
                         {area}
                       </span>
                     ))}
                   </div>
                 </div>
               )}
             </div>

             <div className="space-y-4">
               <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
                 <h3 className="text-lg font-semibold mb-2">Overall Progress</h3>
                 <div className="text-3xl font-bold mb-2">
                   {Math.round(learning_path.completion_percentage)}%
                 </div>
                 <div className="text-sm opacity-90">
                   {learning_path.completed_resources} of {learning_path.total_resources} resources completed
                 </div>
                 <div className="w-full bg-white/20 rounded-full h-2 mt-4">
                   <div 
                     className="bg-white h-2 rounded-full transition-all duration-500"
                     style={{ width: `${learning_path.completion_percentage}%` }}
                   ></div>
                 </div>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>

       {/* Progress Stats */}
       <div className="grid md:grid-cols-4 gap-6 mb-8">
         <Card className="animate-slide-up">
           <CardContent className="p-6 text-center">
             <div className="text-2xl font-bold text-primary-600 mb-2">
               {learning_path.completed_resources}
             </div>
             <div className="text-sm text-gray-600">Resources Completed</div>
           </CardContent>
         </Card>

         <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
           <CardContent className="p-6 text-center">
             <div className="text-2xl font-bold text-green-600 mb-2">
               {progressEntries.filter(([_, data]) => data.average_score >= 70).length}
             </div>
             <div className="text-sm text-gray-600">Passed Quizzes</div>
           </CardContent>
         </Card>

         <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
           <CardContent className="p-6 text-center">
             <div className="text-2xl font-bold text-gray-900 mb-2">
               {progressEntries.length > 0 
                 ? Math.round(progressEntries.reduce((sum, [_, data]) => sum + data.average_score, 0) / progressEntries.length)
                 : 0
               }%
             </div>
             <div className="text-sm text-gray-600">Average Score</div>
           </CardContent>
         </Card>

         <Card className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
           <CardContent className="p-6 text-center">
             <div className="text-2xl font-bold text-blue-600 mb-2">
               {learning_path.total_resources - learning_path.completed_resources}
             </div>
             <div className="text-sm text-gray-600">Remaining</div>
           </CardContent>
         </Card>
       </div>

       {/* Detailed Progress */}
       {progressEntries.length > 0 && (
         <Card className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
           <CardHeader>
             <h2 className="text-xl font-semibold text-gray-900">
               Detailed Progress History
             </h2>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {progressEntries.map(([resourceId, data], index) => (
                 <div
                   key={resourceId}
                   className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                 >
                   <div className="flex-1">
                     <div className="font-medium text-gray-900 mb-1">
                       Resource {index + 1}
                     </div>
                     <div className="text-sm text-gray-600">
                       {data.total_questions} questions • {data.correct_answers} correct
                     </div>
                   </div>

                   <div className="flex items-center space-x-4">
                     <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(data.average_score)}`}>
                       {Math.round(data.average_score)}%
                     </div>
                     
                     <div className="text-sm text-gray-500">
                       {data.weak_topics && data.weak_topics.length > 0 && (
                         <div className="flex flex-wrap gap-1">
                           {data.weak_topics.slice(0, 2).map((topic, i) => (
                             <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                               {topic}
                             </span>
                           ))}
                           {data.weak_topics.length > 2 && (
                             <span className="text-xs text-gray-500">+{data.weak_topics.length - 2} more</span>
                           )}
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
       )}

       {progressEntries.length === 0 && (
         <Card className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
           <CardContent className="text-center py-12">
             <div className="text-6xl mb-4">📚</div>
             <h3 className="text-lg font-semibold text-gray-900 mb-2">
               No Quiz History Yet
             </h3>
             <p className="text-gray-600 mb-4">
               Complete some quizzes to see your detailed progress here.
             </p>
             <Button onClick={() => router.push(`/learning-path/${learnerId}`)}>
               Start Learning
             </Button>
           </CardContent>
         </Card>
       )}

       {/* Action Buttons */}
       <div className="mt-8 flex justify-center space-x-4">
         <Button
           onClick={() => router.push(`/learning-path/${learnerId}`)}
           size="lg"
         >
           Continue Learning
         </Button>
         <Button
           variant="outline"
           onClick={() => router.push('/')}
           size="lg"
         >
           Back to Home
         </Button>
       </div>
     </div>
   </div>
 );
}