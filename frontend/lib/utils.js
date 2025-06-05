export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-600 bg-green-50';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

export const getLearningStyleIcon = (style) => {
  const icons = {
    visual: '👁️',
    auditory: '👂',
    reading: '📚',
    kinesthetic: '🤲'
  };
  return icons[style] || '🎯';
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};