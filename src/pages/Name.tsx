
import React from 'react';
import NameGenerator from '@/components/NameGenerator';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const Name = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
          <h1 className="text-xl font-semibold ml-auto mr-auto">Create Profile</h1>
          <div className="w-16"></div> {/* For balance */}
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <NameGenerator />
        </div>
      </main>
    </div>
  );
};

export default Name;
