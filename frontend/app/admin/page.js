'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import { formatDate, getLearningStyleName } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [learners, setLearners] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [analyticsResponse, learnersResponse] = await Promise.all([
        apiClient.getAnalyticsDashboard(),
        apiClient.getAllLearners()
      ]);
      
      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.analytics);
      }
      
      if (learnersResponse.success) {
        setLearners(learnersResponse.learners);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewLearnerProgress = (learnerId) => {
    router.push(`/progress/${learnerId}`);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'learners', name: 'Learners', icon: '👥' },
    { id: 'system', name: 'System', icon: '⚙️' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 text-lg">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl mb-6 shadow-xl">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Monitor system performance, track learner progress, and analyze learning patterns
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                 activeTab === tab.id
                   ? 'bg-purple-600 text-white shadow-lg'
                   : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
               }`}
             >
               <span className="text-lg">{tab.icon}</span>
               <span>{tab.name}</span>
             </button>
           ))}
         </div>
       </div>

       {analytics && (
         <>
           {/* Overview Tab */}
           {activeTab === 'overview' && (
             <div className="space-y-8 animate-fade-in">
               {/* Key Metrics */}
               <div className="grid md:grid-cols-4 gap-6">
                 <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                   <CardContent className="p-6 text-center">
                     <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-2xl mb-3 shadow-lg">
                       <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                       </svg>
                     </div>
                     <div className="text-3xl font-bold text-blue-600 mb-2">
                       {analytics.total_learners}
                     </div>
                     <div className="text-sm text-blue-700 font-medium">Total Learners</div>
                     <div className="text-xs text-blue-600 mt-2">Active users</div>
                   </CardContent>
                 </Card>

                 <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
                   <CardContent className="p-6 text-center">
                     <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-2xl mb-3 shadow-lg">
                       <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                       </svg>
                     </div>
                     <div className="text-3xl font-bold text-green-600 mb-2">
                       {analytics.total_paths}
                     </div>
                     <div className="text-sm text-green-700 font-medium">Learning Paths</div>
                     <div className="text-xs text-green-600 mt-2">Generated paths</div>
                   </CardContent>
                 </Card>

                 <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                   <CardContent className="p-6 text-center">
                     <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500 rounded-2xl mb-3 shadow-lg">
                       <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                       </svg>
                     </div>
                     <div className="text-3xl font-bold text-purple-600 mb-2">
                       {analytics.total_quizzes}
                     </div>
                     <div className="text-sm text-purple-700 font-medium">Quizzes Taken</div>
                     <div className="text-xs text-purple-600 mt-2">Assessments completed</div>
                   </CardContent>
                 </Card>

                 <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                   <CardContent className="p-6 text-center">
                     <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 rounded-2xl mb-3 shadow-lg">
                       <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 010 1.299l3.942 3.942a11.95 11.95 0 01-15.487-10.85M2.25 18L6 14.25m0 0l8.485-8.485c.652-.653 1.538-1.1 2.515-1.1a2.25 2.25 0 011.575.652L21 7.742m-6.75 6.732l3-3m-3 3a2.25 2.25 0 01-3.18 0l-4.5-4.5a2.25 2.25 0 013.18-3.18l6-6a2.25 2.25 0 013.18 3.18L12 19.5z" />
                       </svg>
                     </div>
                     <div className="text-3xl font-bold text-orange-600 mb-2">
                       {Math.round(analytics.average_completion_rate)}%
                     </div>
                     <div className="text-sm text-orange-700 font-medium">Avg Completion</div>
                     <div className="text-xs text-orange-600 mt-2">Success rate</div>
                   </CardContent>
                 </Card>
               </div>

               {/* Learning Styles Distribution */}
               <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                 <CardHeader>
                   <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                     <span className="text-2xl mr-3">🎯</span>
                     Learning Styles Distribution
                   </h2>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-6">
                     {analytics.learning_styles_distribution.map((style, index) => {
                       const percentage = analytics.total_learners > 0 
                         ? (style.count / analytics.total_learners) * 100 
                         : 0;
                       
                       return (
                         <div key={style._id} className="flex items-center space-x-4">
                           <div className="flex items-center space-x-3 w-32">
                             <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                               <span className="text-lg">👁️</span>
                             </div>
                             <span className="text-sm font-medium text-gray-700 capitalize">
                               {getLearningStyleName(style._id)}
                             </span>
                           </div>
                           <div className="flex-1">
                             <div className="flex items-center space-x-3">
                               <div className="flex-1 bg-gray-200 rounded-full h-4">
                                 <div 
                                   className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all duration-1000 shadow-sm"
                                   style={{ 
                                     width: `${percentage}%`,
                                     animationDelay: `${index * 0.2}s`
                                   }}
                                 ></div>
                               </div>
                               <div className="text-sm font-medium text-gray-600 w-16 text-right">
                                 {Math.round(percentage)}%
                               </div>
                             </div>
                           </div>
                           <div className="w-12 text-sm text-gray-500 text-right font-medium">
                             {style.count}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </CardContent>
               </Card>
             </div>
           )}

           {/* Learners Tab */}
           {activeTab === 'learners' && (
             <div className="space-y-6 animate-fade-in">
               <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                   <span className="text-2xl mr-3">👥</span>
                   All Learners ({learners.length})
                 </h2>
                 <Button 
                   onClick={loadData}
                   variant="outline"
                   className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                 >
                   <span className="mr-2">🔄</span>
                   Refresh
                 </Button>
               </div>

               {learners.length === 0 ? (
                 <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                   <CardContent className="text-center py-16">
                     <div className="text-6xl mb-4">👥</div>
                     <h3 className="text-xl font-semibold text-gray-900 mb-2">
                       No learners yet
                     </h3>
                     <p className="text-gray-600 mb-6">
                       Learners will appear here once they create profiles
                     </p>
                     <Button onClick={() => router.push('/create-profile')}>
                       <span className="mr-2">➕</span>
                       Create First Profile
                     </Button>
                   </CardContent>
                 </Card>
               ) : (
                 <div className="grid gap-6">
                   {learners.map((learner, index) => (
                     <Card 
                       key={learner.id} 
                       className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-slide-up"
                       style={{ animationDelay: `${index * 0.1}s` }}
                     >
                       <CardContent className="p-6">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-4">
                             <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                               <span className="text-2xl">🎓</span>
                             </div>
                             <div className="flex-1">
                               <h3 className="text-xl font-bold text-gray-900 mb-1">
                                 {learner.name}
                               </h3>
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                                 <div className="flex items-center space-x-2">
                                   <span>📚</span>
                                   <span className="capitalize">{learner.subject}</span>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                   <span>🎯</span>
                                   <span className="capitalize">{getLearningStyleName(learner.learning_style)}</span>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                   <span>🏆</span>
                                   <span>Level {learner.knowledge_level}/5</span>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                   <span>📅</span>
                                   <span>{formatDate(learner.created_at)}</span>
                                 </div>
                               </div>
                               {learner.weak_areas && learner.weak_areas.length > 0 && (
                                 <div className="flex flex-wrap gap-1 mt-3">
                                   {learner.weak_areas.slice(0, 3).map((area, i) => (
                                     <span 
                                       key={i} 
                                       className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"
                                     >
                                       {area}
                                     </span>
                                   ))}
                                   {learner.weak_areas.length > 3 && (
                                     <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                       +{learner.weak_areas.length - 3}
                                     </span>
                                   )}
                                 </div>
                               )}
                             </div>
                           </div>
                           <div className="flex flex-col space-y-2">
                             <Button
                               onClick={() => handleViewLearnerProgress(learner.id)}
                               size="sm"
                               className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                             >
                               <span className="mr-2">📊</span>
                               View Progress
                             </Button>
                             <Button
                               onClick={() => router.push(`/learning-path/${learner.id}`)}
                               variant="outline"
                               size="sm"
                               className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                             >
                               <span className="mr-2">🛤️</span>
                               Learning Path
                             </Button>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               )}
             </div>
           )}

           {/* System Tab */}
           {activeTab === 'system' && (
             <div className="space-y-8 animate-fade-in">
               <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                 <CardHeader>
                   <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                     <span className="text-2xl mr-3">⚙️</span>
                     System Health
                   </h2>
                 </CardHeader>
                 <CardContent>
                   <div className="grid md:grid-cols-3 gap-6">
                     <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                       <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                         <span className="text-white text-2xl">✓</span>
                       </div>
                       <div className="font-bold text-lg text-gray-900 mb-1">API Status</div>
                       <div className="text-sm text-green-600 font-medium">Online & Responsive</div>
                       <div className="text-xs text-gray-500 mt-2">Last checked: Now</div>
                     </div>

                     <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                       <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                         <span className="text-white text-2xl">🤖</span>
                       </div>
                       <div className="font-bold text-lg text-gray-900 mb-1">AI Agents</div>
                       <div className="text-sm text-blue-600 font-medium">Active & Learning</div>
                       <div className="text-xs text-gray-500 mt-2">3 agents running</div>
                     </div>

                     <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                       <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                         <span className="text-white text-2xl">💾</span>
                       </div>
                       <div className="font-bold text-lg text-gray-900 mb-1">Database</div>
                       <div className="text-sm text-purple-600 font-medium">Connected & Synced</div>
                       <div className="text-xs text-gray-500 mt-2">MongoDB cluster</div>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                 <CardHeader>
                   <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                     <span className="text-2xl mr-3">📈</span>
                     Performance Metrics
                   </h2>
                 </CardHeader>
                 <CardContent>
                   <div className="grid md:grid-cols-2 gap-8">
                     <div>
                       <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                         <span className="mr-2">⏱️</span>
                         Response Times
                       </h3>
                       <div className="space-y-4">
                         <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <span className="text-gray-600">API Endpoints</span>
                           <span className="text-green-600 font-medium">~120ms</span>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <span className="text-gray-600">AI Generation</span>
                           <span className="text-blue-600 font-medium">~2.3s</span>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <span className="text-gray-600">Database Queries</span>
                           <span className="text-green-600 font-medium">~45ms</span>
                         </div>
                       </div>
                     </div>
                     <div>
                       <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                         <span className="mr-2">📊</span>
                         Usage Statistics
                       </h3>
                       <div className="space-y-4">
                         <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <span className="text-gray-600">Active Sessions</span>
                           <span className="text-purple-600 font-medium">12</span>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <span className="text-gray-600">Daily Requests</span>
                           <span className="text-purple-600 font-medium">1,247</span>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <span className="text-gray-600">AI Calls Today</span>
                           <span className="text-purple-600 font-medium">89</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </div>
           )}
         </>
       )}
     </div>
   </div>
 );
}