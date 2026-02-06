import React from 'react';
import type { FunctionDict } from '../types';

interface FunctionSelectorProps {
  functions: FunctionDict;
  selectedKey: string;
  onSelect: (key: string) => void;
}

export const FunctionSelector: React.FC<FunctionSelectorProps> = ({ functions, selectedKey, onSelect }) => {
  return (
    <select
      value={selectedKey}
      onChange={(e) => onSelect(e.target.value)}
      className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
    >
      {/* FIX: Changed destructuring within map to resolve a TypeScript type inference issue. The 'label' property was not being correctly identified on the function definition object. */}
      {Object.entries(functions).map(([key, funcDef]) => (
        <option key={key} value={key}>
          {funcDef.label}
        </option>
      ))}
    </select>
  );
};
