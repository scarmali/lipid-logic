import React from 'react';

const FormulationCard = ({ formulation, drugLogP }) => {
  // Logic to determine visual emphasis based on research
  const isCorePreferred = formulation.location === "Core";
  
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-blue-900">{formulation.name}</h3>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
          Score: {formulation.score}
        </span>
      </div>
      
      {/* Spatial Visualization Diagram */}
      <div className="relative h-24 w-full bg-gray-50 rounded-md border border-dashed flex items-center justify-center mb-3">
        {/* The "Particle" */}
        <div className="relative w-16 h-16 rounded-full border-4 border-blue-200 bg-blue-50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-blue-200"></div> {/* Inner Core */}
          
          {/* Drug Molecule Dot */}
          <div className={`absolute w-3 h-3 bg-red-500 rounded-full border border-white transition-all duration-500 ${
            isCorePreferred ? 'scale-100' : 'translate-y-[-28px]'
          }`} title="Predicted Drug Localization"></div>
        </div>
        <div className="ml-4 text-xs text-gray-500">
          <p><strong>Structure:</strong> {formulation.structure}</p>
          <p><strong>Predicted Site:</strong> {formulation.location}</p>
        </div>
      </div>

      <p className="text-sm text-gray-700 italic border-l-2 border-blue-400 pl-2">
        "{formulation.note}"
      </p>
    </div>
  );
};