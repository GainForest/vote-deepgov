
import React from 'react';
import QRScanner from '@/components/QRScanner';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold">Vote App</h1>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              WELCOME
            </div>
            <h1 className="text-4xl font-bold mb-3">Voting App</h1>
            <p className="text-gray-500 mb-6">
              Scan a QR code to enter the voting system or simply use the button below.
            </p>
          </div>
          
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <QRScanner />
          </div>
          
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-gray-500 mb-3">Don't have a QR code?</p>
            <Link 
              to="/name" 
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Continue without scanning
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
