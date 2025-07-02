import React from "react";

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full">
      <div className="bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-orange-500 h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{progress}%</div>
    </div>
  );
}
