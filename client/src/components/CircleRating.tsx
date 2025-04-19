import React from 'react';

interface CircleRatingProps {
  percentage: number;
  size?: number;
  className?: string;
}

const CircleRating: React.FC<CircleRatingProps> = ({ 
  percentage, 
  size = 40, 
  className = '' 
}) => {
  // Calculate appropriate styling based on the percentage
  let gradientClass = 'conic-gradient-medium';
  
  if (percentage >= 70) {
    gradientClass = 'conic-gradient-high';
  } else if (percentage < 50) {
    gradientClass = 'conic-gradient-low';
  }

  return (
    <div 
      className={`relative rounded-full border-2 border-gray-900 flex items-center justify-center bg-gray-900 ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px` 
      }}
    >
      <div 
        className={`w-full h-full rounded-full flex items-center justify-center`}
        style={{ 
          '--percentage': `${percentage}%`,
        } as React.CSSProperties}
        data-percentage={percentage}
      >
        <div 
          className={gradientClass + " w-full h-full rounded-full"}
        >
          <div 
            className="w-[calc(100%-6px)] h-[calc(100%-6px)] m-[3px] rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold"
          >
            {percentage}<span className="text-[8px]">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleRating;
