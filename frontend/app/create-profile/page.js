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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    learning_style: '',
    subject: '',
    knowledge_level: 1,
    weak_areas: []
  });
  const [errors, setErrors] = useState({});

  const learningStyleOptions = [
    { 
      value: 'visual', 
      label: 'Visual Learner',
      description: 'Learn best through images, diagrams, and visual content',
      icon: '👁️'
    },
    { 
      value: 'auditory', 
      label: 'Auditory Learner',
      description: 'Learn best through listening and verbal instruction',
      icon: '👂'
    },
    { 
      value: 'reading', 
      label: 'Reading/Writing',
      description: 'Learn best through text-based content and writing',
      icon: '📚'
    },
    { 
      value: 'kinesthetic', 
      label: 'Kinesthetic Learner',
      description: 'Learn best through hands-on activities and practice',
      icon: '🤲'
    }
  ];

  const subjectOptions = [
    { value: 'algebra', label: 'Algebra', icon: '📐', description: 'Variables, equations, and algebraic structures' },
    { value: 'geometry', label: 'Geometry', icon: '📏', description: 'Shapes, angles, and spatial relationships' },
    { value: 'trigonometry', label: 'Trigonometry', icon: '📊', description: 'Triangles, angles, and trigonometric functions' },
    { value: 'calculus', label: 'Calculus', icon: '∫', description: 'Derivatives, integrals, and advanced mathematics' }
  ];

  const weakAreaOptions = {
    algebra: ['variables', 'linear equations', 'like terms', 'order of operations', 'graphing'],
    geometry: ['angles', 'triangles', 'circles', 'area', 'volume'],
    trigonometry: ['sine', 'cosine', 'tangent', 'identities', 'graphs'],
    calculus: ['limits', 'derivatives', 'integrals', 'applications', 'continuity']
  };

  const steps = [
    { id: 1, title: 'Basic Info', icon: '👤' },
    { id: 2, title: 'Learning Style', icon: '🎯' },
    { id: 3, title: 'Subject & Level', icon: '📚' },
    { id: 4, title: 'Focus Areas', icon: '🎪' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!validateRequired(formData.name)) {
          newErrors.name = 'Name is required';
        }
        break;
      case 2:
        if (!validateRequired(formData.learning_style)) {
          newErrors.learning_style = 'Learning style is required';
        }
        break;
      case 3:
        if (!validateRequired(formData.subject)) {
          newErrors.subject = 'Subject is required';
        }
        if (!formData.knowledge_level || formData.knowledge_level < 1 || formData.knowledge_level > 5) {
          newErrors.knowledge_level = 'Knowledge level must be between 1 and 5';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error('Please complete all required fields');
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl mb-6">
            <span className="text-2xl text-white">🎓</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Learning Profile
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help us understand your learning preferences to create the perfect personalized experience
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4 mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.id ? '✓' : step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <div className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="min-h-[400px]">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="animate-fade-in space-y-6">
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">👋</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome! Let's get started</h3>
                    <p className="text-gray-600">First, tell us a bit about yourself</p>
                  </div>
                  
                  <Input
                    label="What's your name?"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    error={errors.name}
                    className="text-lg py-4"
                  />
                </div>
              )}

              {/* Step 2: Learning Style */}
              {currentStep === 2 && (
                <div className="animate-fade-in space-y-6">
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">How do you learn best?</h3>
                    <p className="text-gray-600">Choose the learning style that resonates with you most</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {learningStyleOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          formData.learning_style === option.value
                            ? 'border-primary-600 bg-primary-50 shadow-lg'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="learning_style"
                          value={option.value}
                          checked={formData.learning_style === option.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex items-start space-x-4">
                          <div className="text-3xl">{option.icon}</div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {option.label}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        {formData.learning_style === option.value && (
                          <div className="absolute top-4 right-4 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                  {errors.learning_style && (
                    <p className="text-sm text-red-600 text-center">{errors.learning_style}</p>
                  )}
                </div>
              )}

              {/* Step 3: Subject and Knowledge Level */}
              {currentStep === 3 && (
                <div className="animate-fade-in space-y-8">
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">What would you like to learn?</h3>
                    <p className="text-gray-600">Choose your subject and current knowledge level</p>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">Subject</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      {subjectOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            formData.subject === option.value
                              ? 'border-primary-600 bg-primary-50 shadow-lg'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="subject"
                            value={option.value}
                            checked={formData.subject === option.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{option.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{option.label}</h4>
                              <p className="text-sm text-gray-600">{option.description}</p>
                            </div>
                            {formData.subject === option.value && (
                              <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.subject && (
                      <p className="text-sm text-red-600 mt-2">{errors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Current Knowledge Level
                    </label>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <input
                        type="range"
                        name="knowledge_level"
                        min="1"
                        max="5"
                        value={formData.knowledge_level}
                        onChange={handleInputChange}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-3">
                        <span>Beginner</span>
                        <span className="font-semibold text-primary-600 text-lg">
                          Level {formData.knowledge_level}
                        </span>
                        <span>Expert</span>
                      </div>
                      <div className="text-center mt-2">
                        <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                          {formData.knowledge_level === 1 && "Just starting out"}
                          {formData.knowledge_level === 2 && "Some basic knowledge"}
                          {formData.knowledge_level === 3 && "Intermediate understanding"}
                          {formData.knowledge_level === 4 && "Advanced knowledge"}
                          {formData.knowledge_level === 5 && "Expert level"}
                        </div>
                      </div>
                    </div>
                    {errors.knowledge_level && (
                      <p className="text-sm text-red-600 mt-2">{errors.knowledge_level}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Focus Areas */}
              {currentStep === 4 && (
                <div className="animate-fade-in space-y-6">
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Areas to focus on</h3>
                    <p className="text-gray-600">Select topics you'd like to improve (optional)</p>
                  </div>

                  {formData.subject && weakAreaOptions[formData.subject] && (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {weakAreaOptions[formData.subject].map((area) => (
                          <label
                            key={area}
                            className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                              formData.weak_areas.includes(area)
                                ? 'border-primary-600 bg-primary-50 shadow-lg'
                                : 'border-gray-200 hover:border-primary-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.weak_areas.includes(area)}
                              onChange={() => handleWeakAreaChange(area)}
                              className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {area}
                            </span>
                          </label>
                        ))}
                      </div>
                      
                      {formData.weak_areas.length > 0 && (
                        <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
                          <h4 className="font-medium text-primary-900 mb-2">Selected focus areas:</h4>
                          <div className="flex flex-wrap gap-2">
                            {formData.weak_areas.map((area, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 bg-primary-600 text-white rounded-full text-sm font-medium"
                              >
                                {area}
                                <button
                                  type="button"
                                  onClick={() => handleWeakAreaChange(area)}
                                  className="ml-2 hover:bg-primary-700 rounded-full p-0.5"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                     <div className="text-2xl">🚀</div>
                     <div>
                       <h4 className="text-lg font-semibold text-gray-900 mb-2">
                         What happens next?
                       </h4>
                       <div className="space-y-2 text-sm text-gray-700">
                         <p>• Take a quick AI-powered assessment to evaluate your current knowledge</p>
                         <p>• Get a personalized learning path designed specifically for you</p>
                         <p>• Start learning with adaptive content that evolves with your progress</p>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             )}
           </div>

           {/* Navigation Buttons */}
           <div className="flex justify-between items-center pt-8 border-t border-gray-200">
             <Button
               type="button"
               variant="outline"
               onClick={currentStep === 1 ? () => router.back() : handlePrevious}
               className="px-6 py-3"
             >
               {currentStep === 1 ? 'Cancel' : 'Previous'}
             </Button>

             <div className="flex space-x-3">
               {currentStep < 4 ? (
                 <Button
                   type="button"
                   onClick={handleNext}
                   className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                 >
                   Continue
                 </Button>
               ) : (
                 <Button
                   type="button"
                   onClick={handleSubmit}
                   loading={isLoading}
                   className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                 >
                   Create Profile & Start Assessment
                 </Button>
               )}
             </div>
           </div>
         </CardContent>
       </Card>
     </div>
   </div>
 );
}