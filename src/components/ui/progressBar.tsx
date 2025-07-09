// components/ProgressBar.tsx
import React from "react";

interface ProgressBarProps {
  value: number;
  max: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max }) => {
  const percentage = max === 0 ? 0 : (value / max) * 100;

  return (
    <div className="w-1/2 h-3 bg-gray-200 rounded-md overflow-hidden">
      <div
        className="h-full bg-green-500 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
