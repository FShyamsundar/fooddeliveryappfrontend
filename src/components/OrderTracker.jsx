import { FiCheck, FiClock, FiTruck, FiCheckCircle } from 'react-icons/fi';

const OrderTracker = ({ status }) => {
  const steps = [
    { key: 'placed', label: 'Order Placed', icon: FiCheck },
    { key: 'preparing', label: 'Preparing', icon: FiClock },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: FiTruck },
    { key: 'delivered', label: 'Delivered', icon: FiCheckCircle }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);

  return (
    <div className="py-8">
      <div className="flex justify-between items-center relative">
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                  isCompleted
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-orange-200' : ''}`}
              >
                <Icon size={24} />
              </div>
              <span
                className={`text-sm font-medium ${
                  isCompleted ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracker;
