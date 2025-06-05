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

  useEffect(() => {
    checkSystemHealth();
    seedResourcesIfNeeded();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await apiClient.healthCheck();
      setSystemHealth(response);
    } catch (error) {
      console.error('Health check failed:', error);
      toast.error('System health check failed');
    }
  };

  const seedResourcesIfNeeded = async () => {
    try {
      await apiClient.seedResources();
    } catch (error) {
      console.error('Resource seeding failed:', error);
    }
  };

  const handleGetStarted = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center animate-fade-in">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-6">
              <span className="text-3xl">🤖</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI Personalized
              <span className="text-primary-600 block">Learning Tutor</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Experience personalized learning powered by advanced AI agents. Our system adapts to your learning style, 
              identifies your strengths and weaknesses, and creates customized learning paths just for you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-profile">
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-8 py-4 text-lg"
                loading={isLoading}
                onClick={handleGetStarted}
              >
                Get Started Now
              </Button>
            </Link>
            <Link href="/admin">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto px-8 py-4 text-lg"
              >
                View Analytics
              </Button>
            </Link>
          </div>

          {systemHealth && (
            <div className="mt-6 inline-flex items-center text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              System Online
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="animate-slide-up hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Adaptive Learning
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our AI agents analyze your learning patterns and adapt the curriculum in real-time to match your pace and style.
              </p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up hover:shadow-lg transition-shadow" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Progress Tracking
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monitor your learning journey with detailed analytics and insights about your strengths and areas for improvement.
              </p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up hover:shadow-lg transition-shadow" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Personalized Paths
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get customized learning sequences based on your knowledge level, learning style, and personal goals.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered system creates a personalized learning experience in just a few simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Create Profile',
                description: 'Tell us about your learning style and preferences',
                icon: '👤'
              },
              {
                step: '2',
                title: 'Take Assessment',
                description: 'Complete a quick pretest to gauge your knowledge',
                icon: '📝'
              },
              {
                step: '3',
                title: 'Get Learning Path',
                description: 'Receive a customized sequence of learning resources',
                icon: '🛤️'
              },
              {
                step: '4',
                title: 'Learn & Progress',
                description: 'Follow your path and track your improvement',
                icon: '📈'
              }
            ].map((item, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  {item.step}
                </div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}