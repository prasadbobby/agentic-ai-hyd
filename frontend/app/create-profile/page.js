'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import { validateRequired } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function CreateProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    learning_style: '',
    subject: '',
    knowledge_level: 1,
    weak_areas: []
  });
  const [errors, setErrors] = useState({});

  const learningStyleOptions = [
    { value: 'visual', label: '👁️ Visual - Learn through images and diagrams' },
    { value: 'auditory', label: '👂 Auditory - Learn through listening' },
    { value: 'reading', label: '📚 Reading/Writing - Learn through text' },
    { value: 'kinesthetic', label: '🤲 Kinesthetic - Learn through hands-on activities' }
  ];

  const subjectOptions = [
    { value: 'algebra', label: 'Algebra' },
    { value: 'geometry', label: 'Geometry' },
    { value: 'trigonometry', label: 'Trigonometry' },
    { value: 'calculus', label: 'Calculus' }
  ];

  const weakAreaOptions = {
    algebra: ['variables', 'linear equations', 'like terms', 'order of operations', 'graphing'],
    geometry: ['angles', 'triangles', 'circles', 'area', 'volume'],
    trigonometry: ['sine', 'cosine', 'tangent', 'identities', 'graphs'],
    calculus: ['limits', 'derivatives', 'integrals', 'applications', 'continuity']
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert knowledge_level to integer
    const processedValue = name === 'knowledge_level' ? parseInt(value, 10) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleWeakAreaChange = (area) => {
    setFormData(prev => ({
      ...prev,
      weak_areas: prev.weak_areas.includes(area)
        ? prev.weak_areas.filter(item => item !== area)
        : [...prev.weak_areas, area]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(formData.name)) {
      newErrors.name = 'Name is required';
    }

    if (!validateRequired(formData.learning_style)) {
      newErrors.learning_style = 'Learning style is required';
    }

    if (!validateRequired(formData.subject)) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.knowledge_level || formData.knowledge_level < 1 || formData.knowledge_level > 5) {
      newErrors.knowledge_level = 'Knowledge level must be between 1 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Submitting form data:', formData);
      const response = await apiClient.createLearner(formData);
      console.log('Create learner response:', response);
      
      if (response.success) {
        toast.success('Profile created successfully!');
        router.push(`/pretest/${response.data.profile_id}`);
      } else {
        throw new Error(response.error || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error(error.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Learning Profile
          </h1>
          <p className="text-gray-600">
            Tell us about yourself so we can personalize your learning experience
          </p>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              Personal Information
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                error={errors.name}
              />

              <Select
                label="Learning Style"
                name="learning_style"
                value={formData.learning_style}
                onChange={handleInputChange}
                options={learningStyleOptions}
                required
                error={errors.learning_style}
              />

              <Select
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                options={subjectOptions}
                required
                error={errors.subject}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Knowledge Level (1-5) <span className="text-red-500">*</span>
                </label>
                <input
                  type="range"
                  name="knowledge_level"
                  min="1"
                  max="5"
                  value={formData.knowledge_level}
                  onChange={handleInputChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Beginner</span>
                  <span className="font-medium">Level {formData.knowledge_level}</span>
                  <span>Expert</span>
                </div>
                {errors.knowledge_level && (
                  <p className="text-sm text-red-600 mt-1">{errors.knowledge_level}</p>
                )}
              </div>

              {formData.subject && weakAreaOptions[formData.subject] && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Areas you'd like to improve (optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {weakAreaOptions[formData.subject].map((area) => (
                      <label
                        key={area}
                        className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.weak_areas.includes(area)}
                          onChange={() => handleWeakAreaChange(area)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {area}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formData.weak_areas.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Selected: {formData.weak_areas.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  📝 What happens next?
                </h3>
                <p className="text-sm text-blue-700">
                  After creating your profile, you'll take a quick pre-assessment to help us understand your current knowledge level and create a personalized learning path just for you.
                </p>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  className="flex-1"
                >
                  Create Profile & Start Assessment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}