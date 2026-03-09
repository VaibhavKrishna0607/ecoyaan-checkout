import { Check } from 'lucide-react';

const STEPS = [
  { number: 1, label: 'Cart' },
  { number: 2, label: 'Shipping' },
  { number: 3, label: 'Payment' },
];

export default function CheckoutProgress({ currentStep }) {
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* connector line — spans only between circle centres (left-4 = 16px = half of w-8) */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#d8e8e0] z-0" />
        <div
          className="absolute top-4 left-4 h-0.5 bg-[#2d6a4f] z-0 transition-all duration-500"
          style={{
            width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - ${((currentStep - 1) / (STEPS.length - 1)) * 32}px)`,
          }}
        />

        {STEPS.map((step) => {
          const isDone = step.number < currentStep;
          const isActive = step.number === currentStep;
          return (
            <div key={step.number} className="z-10 flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                  ${isDone ? 'bg-[#2d6a4f] border-[#2d6a4f] text-white' : ''}
                  ${isActive ? 'bg-white border-[#2d6a4f] text-[#2d6a4f]' : ''}
                  ${!isDone && !isActive ? 'bg-white border-[#d8e8e0] text-gray-400' : ''}
                `}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : step.number}
              </div>
              <span
                className={`text-xs font-medium ${isActive ? 'text-[#2d6a4f]' : isDone ? 'text-[#40916c]' : 'text-gray-400'}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
