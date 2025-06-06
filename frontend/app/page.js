'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [stats, setStats] = useState({
    totalLearners: 0,
    totalPaths: 0,
    avgCompletion: 0
  });

  useEffect(() => {
    checkSystemHealth();
    loadDashboardStats();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await apiClient.healthCheck();
      setSystemHealth(response);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await apiClient.getAnalyticsDashboard();
      if (response.success) {
        setStats({
          totalLearners: response.analytics.total_learners,
          totalPaths: response.analytics.total_paths,
          avgCompletion: Math.round(response.analytics.average_completion_rate)
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleGetStarted = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="animate-bounce-in">
              <div className="inline-flex items-center justify-center mb-8">
                <div className="relative">
                  <div className="h-24 w-24 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl">
                    <span className="text-4xl">🤖</span>
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-sm">✨</span>
                  </div>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-primary-600 via-primary-700 to-purple-700 bg-clip-text text-transparent">
                  AI-Powered
                </span>
                <br />
                <span className="text-gray-900">Learning Revolution</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
                Experience the future of personalized education with our advanced AI tutoring system. 
                Adaptive learning paths, real-time feedback, and intelligent content curation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up">
              <Link href="/create-profile">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  loading={isLoading}
                  onClick={handleGetStarted}
                >
                  <span className="mr-2">🚀</span>
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/admin">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <span className="mr-2">📊</span>
                 View Analytics
               </Button>
             </Link>
           </div>

           {/* Stats Section */}
           <div className="grid md:grid-cols-3 gap-6 mb-16 animate-fade-in">
             <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
               <div className="text-3xl font-bold text-primary-600 mb-2">{stats.totalLearners}+</div>
               <div className="text-gray-600">Active Learners</div>
             </div>
             <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
               <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalPaths}+</div>
               <div className="text-gray-600">Learning Paths</div>
             </div>
             <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
               <div className="text-3xl font-bold text-blue-600 mb-2">{stats.avgCompletion}%</div>
               <div className="text-gray-600">Avg Completion</div>
             </div>
           </div>

           {systemHealth && (
             <div className="inline-flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200 animate-pulse-slow">
               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
               <span>System Online & Ready</span>
               {systemHealth.ollama_connected && (
                 <>
                   <span>•</span>
                   <span>AI Models Active</span>
                 </>
               )}
             </div>
           )}
         </div>
       </div>
     </div>

     {/* Features Section */}
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
       <div className="text-center mb-16">
         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
           Intelligent Learning Features
         </h2>
         <p className="text-lg text-gray-600 max-w-2xl mx-auto">
           Powered by cutting-edge AI technology to provide the most effective learning experience
         </p>
       </div>

       <div className="grid md:grid-cols-3 gap-8">
         <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-primary-50/30 border-0 shadow-lg animate-slide-up">
           <CardHeader>
             <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
               <span className="text-3xl">🎯</span>
             </div>
             <h3 className="text-xl font-bold text-gray-900">
               Adaptive AI Learning
             </h3>
           </CardHeader>
           <CardContent>
             <p className="text-gray-600 leading-relaxed">
               Our advanced AI agents continuously analyze your learning patterns and dynamically adjust 
               the curriculum to match your unique pace and learning style.
             </p>
             <div className="mt-4 flex flex-wrap gap-2">
               <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">Real-time Adaptation</span>
               <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">Smart Recommendations</span>
             </div>
           </CardContent>
         </Card>

         <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-green-50/30 border-0 shadow-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
           <CardHeader>
             <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
               <span className="text-3xl">📊</span>
             </div>
             <h3 className="text-xl font-bold text-gray-900">
               Advanced Analytics
             </h3>
           </CardHeader>
           <CardContent>
             <p className="text-gray-600 leading-relaxed">
               Comprehensive progress tracking with detailed insights about your learning journey, 
               strengths, and areas for improvement using data-driven analysis.
             </p>
             <div className="mt-4 flex flex-wrap gap-2">
               <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Progress Insights</span>
               <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Performance Metrics</span>
             </div>
           </CardContent>
         </Card>

         <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-yellow-50/30 border-0 shadow-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
           <CardHeader>
             <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
               <span className="text-3xl">🚀</span>
             </div>
             <h3 className="text-xl font-bold text-gray-900">
               Personalized Paths
             </h3>
           </CardHeader>
           <CardContent>
             <p className="text-gray-600 leading-relaxed">
               Custom learning sequences generated based on your knowledge level, learning preferences, 
               and goals using machine learning algorithms.
             </p>
             <div className="mt-4 flex flex-wrap gap-2">
               <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">Custom Sequences</span>
               <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">Goal-Oriented</span>
             </div>
           </CardContent>
         </Card>
       </div>
     </div>

     {/* How It Works */}
     <div className="bg-gradient-to-r from-primary-600 to-purple-700 py-20">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-16">
           <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
             How Our AI System Works
           </h2>
           <p className="text-lg text-primary-100 max-w-2xl mx-auto">
             Four simple steps to unlock your personalized learning experience
           </p>
         </div>

         <div className="grid md:grid-cols-4 gap-8">
           {[
             {
               step: '01',
               title: 'Profile Creation',
               description: 'Tell us about your learning preferences and goals',
               icon: '👤',
               color: 'from-blue-400 to-blue-600'
             },
             {
               step: '02',
               title: 'AI Assessment',
               description: 'Complete an adaptive pretest to gauge your knowledge',
               icon: '📝',
               color: 'from-green-400 to-green-600'
             },
             {
               step: '03',
               title: 'Path Generation',
               description: 'AI creates your personalized learning sequence',
               icon: '🛤️',
               color: 'from-yellow-400 to-orange-500'
             },
             {
               step: '04',
               title: 'Adaptive Learning',
               description: 'Follow your path with continuous AI optimization',
               icon: '📈',
               color: 'from-purple-400 to-pink-500'
             }
           ].map((item, index) => (
             <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
               <div className="relative mb-6">
                 <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto shadow-xl`}>
                   <span className="text-3xl">{item.icon}</span>
                 </div>
                 <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                   <span className="text-sm font-bold text-gray-700">{item.step}</span>
                 </div>
               </div>
               <h3 className="text-xl font-bold text-white mb-3">
                 {item.title}
               </h3>
               <p className="text-primary-100 leading-relaxed">
                 {item.description}
               </p>
             </div>
           ))}
         </div>
       </div>
     </div>

     {/* CTA Section */}
     <div className="bg-white py-20">
       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
         <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-3xl p-12 shadow-xl border border-primary-100">
           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
             Ready to Transform Your Learning?
           </h2>
           <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
             Join thousands of learners who have revolutionized their education with our AI-powered platform.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link href="/create-profile">
               <Button 
                 size="lg" 
                 className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
               >
                 <span className="mr-2">🎓</span>
                 Start Learning Now
               </Button>
             </Link>
             <Link href="/admin">
               <Button 
                 variant="outline" 
                 size="lg" 
                 className="w-full sm:w-auto px-8 py-4 text-lg font-semibold border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white"
               >
                 <span className="mr-2">👥</span>
                 View Community
               </Button>
             </Link>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
}