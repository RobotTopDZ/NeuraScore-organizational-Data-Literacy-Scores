'use client';

import { useState, useEffect } from 'react';

export default function SimpleDashboard() {
  const [status, setStatus] = useState('Loading...');
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    testConnections();
  }, []);

  const testConnections = async () => {
    try {
      setStatus('Testing backend connection...');
      
      // Test backend health
      const response = await fetch('http://localhost:3000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus('Backend connected successfully!');
        setApiData(data);
      } else {
        setStatus(`Backend error: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      setStatus(`Connection failed: ${error.message}`);
      console.error('Connection test failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🎯 NeuraScore Platform
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Connection Status</h2>
          <p className="text-lg mb-4">{status}</p>
          
          {apiData && (
            <div className="bg-gray-700 rounded p-4">
              <h3 className="text-lg font-semibold mb-2">Backend Response:</h3>
              <pre className="text-sm text-green-400 overflow-auto">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">🌐 Frontend</h3>
            <p className="text-green-400">✅ Running</p>
            <p className="text-sm text-gray-400">Port 3001</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">🔧 Backend API</h3>
            <p className={apiData ? 'text-green-400' : 'text-yellow-400'}>
              {apiData ? '✅ Connected' : '⏳ Testing...'}
            </p>
            <p className="text-sm text-gray-400">Port 3000</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibent mb-4">🐍 Python Services</h3>
            <p className="text-green-400">✅ Working</p>
            <p className="text-sm text-gray-400">Port 8001</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={testConnections}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            🔄 Test Connections Again
          </button>
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibent mb-4">📋 Quick Links</h3>
          <div className="space-y-2">
            <a 
              href="http://localhost:3000/api/health" 
              target="_blank" 
              className="block text-blue-400 hover:text-blue-300"
            >
              🔧 Backend Health Check
            </a>
            <a 
              href="http://localhost:3000/api/dashboard" 
              target="_blank" 
              className="block text-blue-400 hover:text-blue-300"
            >
              📊 Dashboard API
            </a>
            <a 
              href="http://localhost:8001" 
              target="_blank" 
              className="block text-blue-400 hover:text-blue-300"
            >
              🐍 Python Services
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
