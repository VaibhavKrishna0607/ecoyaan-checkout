import { Check } from 'lucide-react';

const STEPS = [
  { number: 1, label: 'Cart' },
  { number: 2, label: 'Shipping' },
  { number: 3, label: 'Payment' },
];

export default function CheckoutProgress({ currentStep }) {
  return (
    <div className="w-full max-w-sm mx-auto mb-8 bg-white rounded-2xl border border-[#d8e8e0] shadow-sm px-6 py-5">
      <div className="flex items-center justify-between relative">
        {/* background connector */}
        <div className="absolute top-5 left-5 right-5 h-[3px] bg-[#d8e8e0] rounded-full z-0" />
        {/* active connector */}
        <div
          className="absolute top-5 left-5 h-[3px] bg-gradient-to-r from-[#2d6a4f] to-[#52b788] rounded-full z-0 transition-all duration-700 ease-in-out"
          style={{
            width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - ${((currentStep - 1) / (STEPS.length - 1)) * 40}px)`,
          }}
        />

        {STEPS.map((step) => {
          const isDone = step.number < currentStep;
          const isActive = step.number === currentStep;
          return (
            <div key={step.number} className="z-10 flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                  ${isDone ? 'bg-[#2d6a4f] border-[#2d6a4f] text-white shadow-md' : ''}
                  ${isActive ? 'bg-white border-[#2d6a4f] text-[#2d6a4f] shadow-[0_0_0_4px_rgba(82,183,136,0.2)]' : ''}
                  ${!isDone && !isActive ? 'bg-white border-[#d8e8e0] text-gray-400' : ''}
                `}
              >
                {isDone ? <Check size={15} strokeWidth={3} /> : step.number}
              </div>
              <span
                className={`text-xs font-semibold ${isActive ? 'text-[#2d6a4f]' : isDone ? 'text-[#40916c]' : 'text-gray-400'}`}
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
