import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { toast } from 'sonner';

const ReceiveTicket = () => {
  const [activeTab, setActiveTab] = useState('qr');
  const [linkCode, setLinkCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [receivedTicket, setReceivedTicket] = useState(null);
  
  // Mock function to receive ticket by link code
  const handleReceiveByLink = () => {
    if (!linkCode.trim()) {
      toast.error('Please enter a valid transfer code');
      return;
    }
    
    // Simulate server request with timeout
    toast.loading('Verifying transfer code...');
    
    setTimeout(() => {
      // Mock response
      if (linkCode.length < 6) {
        toast.error('Invalid transfer code');
        return;
      }
      
      // Simulate successful ticket transfer
      setReceivedTicket({
        id: Math.floor(Math.random() * 10000),
        ticketNumber: `SR-${Math.floor(10000 + Math.random() * 90000)}`,
        from: 'Colombo Fort',
        to: 'Kandy',
        departureTime: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        trainName: 'Udarata Menike',
        coach: 'A',
        seat: String(Math.floor(10 + Math.random() * 40)),
        passengerName: 'John Perera',
        status: 'active',
        transferredFrom: 'Sarah Silva',
      });
      
      toast.success('Ticket received successfully!');
      setLinkCode('');
    }, 2000);
  };
  
  // Toggle QR scanner
  const toggleScanner = () => {
    setIsScanning(!isScanning);
    
    if (!isScanning) {
      // Simulate QR scanning process
      toast.loading('Scanning QR code...');
      
      setTimeout(() => {
        // Mock successful scan after 3 seconds
        setIsScanning(false);
        
        // Simulate successful ticket transfer
        setReceivedTicket({
          id: Math.floor(Math.random() * 10000),
          ticketNumber: `SR-${Math.floor(10000 + Math.random() * 90000)}`,
          from: 'Colombo Fort',
          to: 'Badulla',
          departureTime: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
          trainName: 'Podi Menike',
          coach: 'B',
          seat: String(Math.floor(10 + Math.random() * 40)),
          passengerName: 'John Perera',
          status: 'active',
          transferredFrom: 'Michael Fernando',
        });
        
        toast.success('Ticket received successfully!');
      }, 3000);
    } else {
      toast.dismiss();
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Receive Ticket</h1>
          <p className="text-gray-600">
            Accept tickets sent to you by other users securely
          </p>
        </header>
        
        {receivedTicket ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Ticket Received!</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg className="mr-1.5 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Transferred
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mb-6">
                This ticket has been transferred to you from <span className="font-medium text-blue-600">{receivedTicket.transferredFrom}</span>
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-medium uppercase text-gray-500 mb-1">Ticket Details</h3>
                    <p className="font-medium text-gray-900">{receivedTicket.ticketNumber}</p>
                    <p className="text-sm text-gray-600 mt-1">{receivedTicket.from} → {receivedTicket.to}</p>
                    <p className="text-sm text-gray-600 mt-1">{formatDate(receivedTicket.departureTime)}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium uppercase text-gray-500 mb-1">Seat Information</h3>
                    <p className="font-medium text-gray-900">{receivedTicket.trainName}</p>
                    <p className="text-sm text-gray-600 mt-1">Coach: {receivedTicket.coach}, Seat: {receivedTicket.seat}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => window.location.href = '/'}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Go to Home
                </button>
                <button 
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setReceivedTicket(null)}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  Receive Another Ticket
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border-b">
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === 'qr'
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-400 bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                  onClick={() => setActiveTab('qr')}
                >
                  QR Code
                </button>
                <button
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === 'link'
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-400 bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                  onClick={() => setActiveTab('link')}
                >
                  Transfer Link
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {activeTab === 'qr' ? (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <rect x="7" y="7" width="3" height="3"></rect>
                        <rect x="14" y="7" width="3" height="3"></rect>
                        <rect x="7" y="14" width="3" height="3"></rect>
                        <rect x="14" y="14" width="3" height="3"></rect>
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Scan QR Code</h2>
                    <p className="text-gray-600 mb-6">
                      Position the sender's QR code within the scanner area
                    </p>
                  </div>
                  
                  {isScanning ? (
                    <div className="relative max-w-xs mx-auto">
                      <div className="bg-black aspect-square rounded-lg overflow-hidden flex items-center justify-center">
                        <div className="camera-feed bg-gray-900 w-full h-full relative overflow-hidden">
                          {/* Simulated camera feed */}
                          <div className="qr-frame absolute inset-10 border-2 border-white border-opacity-60 rounded-lg"></div>
                          <div className="scan-line absolute top-0 left-0 right-0 h-0.5 bg-green-500 opacity-75 animate-qr-scan"></div>
                          
                          {/* Loading animation */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 border-4 border-blue-600 border-l-transparent rounded-full animate-spin"></div>
                              <p className="text-white mt-4 text-sm">Scanning...</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={toggleScanner}
                        className="mt-6 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Cancel Scanning
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={toggleScanner}
                      className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <rect x="7" y="7" width="3" height="3"></rect>
                        <rect x="14" y="7" width="3" height="3"></rect>
                        <rect x="7" y="14" width="3" height="3"></rect>
                        <rect x="14" y="14" width="3" height="3"></rect>
                      </svg>
                      Start QR Scanner
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Enter Transfer Code</h2>
                    <p className="text-gray-600 mb-6">
                      Enter the code you received from the ticket sender
                    </p>
                  </div>
                  
                  <div className="max-w-md mx-auto">
                    <div className="mb-6">
                      <input
                        type="text"
                        value={linkCode}
                        onChange={(e) => setLinkCode(e.target.value)}
                        placeholder="Enter transfer code (e.g., XYZ123)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <button 
                      onClick={handleReceiveByLink}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      Claim Ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-6 border-t border-gray-100">
              <h3 className="font-medium text-gray-800 mb-4">How to receive a ticket:</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span><strong>QR Code Method:</strong> Ask the sender to generate a transfer QR code, then scan it using the QR scanner above.</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span><strong>Transfer Code Method:</strong> The sender will share a code with you. Enter it in the field above to claim your ticket.</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Once the transfer is complete, the ticket will appear in your account and the original ticket will be deactivated.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiveTicket;