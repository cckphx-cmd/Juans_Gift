import { useState } from 'react';

const OnboardingFlow = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: '🪟',
      title: 'Welcome to Window Weather',
      description: 'Get smart alerts about when to open or close your windows based on real-time weather conditions.',
    },
    {
      icon: '🌡️',
      title: 'Set Your Ideal Temperature',
      description: 'Tell us your perfect outdoor temperature. We\'ll notify you when conditions are ideal for opening your windows.',
    },
    {
      icon: '☀️',
      title: 'Smart Sun Detection',
      description: 'We factor in UV index to prevent your home from heating up. High UV + warm temps = close those windows!',
    },
    {
      icon: '🔔',
      title: 'Enable Notifications',
      description: 'Let us send you timely alerts so you never miss perfect window weather. You can snooze or customize quiet hours.',
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 animate-fade-in shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">{currentStep.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {currentStep.title}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === step
                  ? 'w-8 bg-blue-500'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-smooth"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-6 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-smooth"
          >
            {step < steps.length - 1 ? 'Next' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
