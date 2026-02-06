
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-10">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center text-cyan-400 tracking-wider">
          Convex Conjugate Visualizer
        </h1>
        <p className="text-center text-slate-400 mt-1">An interactive illustration of the Legendre-Fenchel transform</p>
      </div>
    </header>
  );
};
