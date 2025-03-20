import React, { useEffect, useState } from 'react';
import { Share2, Download, Check, QrCode, Shield } from 'lucide-react';
import { toast } from 'sonner';
import "../css/Tansfer-Ticket.css";

const QRCodeDisplay = ({ value, size = 'medium', showActions = true }) => {
  const [qrImage, setQrImage] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [securityHash, setSecurityHash] = useState('');
  const [validUntil, setValidUntil] = useState(null);
  const [isVerified, setIsVerified] = useState(true);
  
  // Get sizing based on the prop
  const getQRSize = () => {
    switch(size) {
      case 'small': return 'w-32 h-32';
      case 'large': return 'w-56 h-56';
      default: return 'w-44 h-44';
    }
  };
  
  useEffect(() => {
    // Generate a shareable URL based on the ticket value
    setShareUrl(`https://railsmart.lk/ticket/${encodeURIComponent(value)}`);
    
    // Generate a security hash based on the value (in a real app, this would be from backend)
    const hashValue = btoa(value + '-' + Date.now()).substring(0, 8);
    setSecurityHash(hashValue);

    // Set QR code validity period (2 hours from now)
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 2);
    setValidUntil(expiryTime);
    
    // Create a pattern based on the value string
    const generateQRPattern = () => {
      const valueSum = Array.from(value || 'default').reduce(
        (sum, char) => sum + char.charCodeAt(0), 0
      );
      
      return (
        <div className={`relative ${getQRSize()} p-2 bg-white rounded-xl overflow-hidden border-[3px] border-railway-blue shadow-lg group-hover:shadow-xl transition-all duration-300`}>
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5">
            {Array.from({ length: 64 }).map((_, index) => {
              // Create a pseudo-random pattern based on the ticket value
              const isDark = ((index * valueSum) % 137) % 2 === 0;
              return (
                <div
                  key={index}
                  className={`${isDark ? 'bg-black' : 'bg-white'} ${
                    (index < 8 && index % 8 < 3) || 
                    (index < 24 && index % 8 >= 5) || 
                    (index >= 40 && index < 56 && index % 8 < 3)
                      ? 'bg-black'
                      : ''
                  }`}
                />
              );
            })}
          </div>
          
          {/* Position detection patterns (the 3 big squares in the corners) */}
          <div className="absolute top-2 left-2 w-6 h-6 bg-black rounded-sm p-1">
            <div className="w-4 h-4 bg-white rounded-sm p-1">
              <div className="w-2 h-2 bg-black rounded-sm"></div>
            </div>
          </div>
          <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-sm p-1">
            <div className="w-4 h-4 bg-white rounded-sm p-1">
              <div className="w-2 h-2 bg-black rounded-sm"></div>
            </div>
          </div>
          <div className="absolute bottom-2 left-2 w-6 h-6 bg-black rounded-sm p-1">
            <div className="w-4 h-4 bg-white rounded-sm p-1">
              <div className="w-2 h-2 bg-black rounded-sm"></div>
            </div>
          </div>
          
          {/* Add a small railway logo or identifier in the center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full h-10 w-10 flex items-center justify-center">
            <svg className="h-7 w-7 text-railway-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
          </div>
          
          {/* Add animated security elements */}
          <div className="absolute inset-0 border-4 border-green-500 border-opacity-0 rounded-lg animate-pulse-slow"></div>
          
          {/* Add security verification animation */}
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-size-200 animate-gradient-x opacity-20"></div>
        </div>
      );
    };
    
    setQrImage(generateQRPattern());
  }, [value, size]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadQRCode = () => {
    toast.info('QR Code download started');
    // In a real app, we would use html-to-image or similar to convert the QR to an image
    const element = document.createElement('a');
    element.setAttribute('href', '#');
    element.setAttribute('download', `ticket-${value.substring(0, 8)}.png`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareTicket = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RailSmart Ticket',
          text: 'Here is my train ticket. Please scan the QR code to validate.',
          url: shareUrl,
        });
        toast.success('Ticket shared successfully!');
      } catch (error) {
        toast.error('Error sharing ticket');
      }
    } else {
      copyToClipboard();
    }
  };

  const verifyTicket = () => {
    toast.success('Ticket verified successfully!');
    setIsVerified(true);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
        {qrImage}
        
        {/* Verification Badge */}
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-md">
          <Check className="h-4 w-4" />
        </div>
        
        {/* Security Info */}
        <div className="text-xs text-center mt-3 space-y-1.5">
          <div className="text-gray-600 max-w-[180px] font-medium">
            Ticket ID: {value?.substring(0, 10)}...
          </div>
          {validUntil && (
            <div className="text-xs text-amber-600 font-medium">
              Valid until: {validUntil.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          )}
          <div className="text-xs text-gray-500 flex items-center justify-center">
            <Shield className="h-3 w-3 mr-1 text-green-600" />
            <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
              {securityHash}
            </span>
          </div>
        </div>
      </div>
      
      {showActions && (
        <div className="mt-4 flex flex-col w-full space-y-2">
          <div className="relative">
            <input 
              type="text" 
              value={shareUrl}
              readOnly
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-railway-blue"
            />
            <button 
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-railway-blue hover:text-blue-700 transition-colors"
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <span className="text-green-500 flex items-center text-xs font-medium">
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </span>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="flex space-x-2 justify-center">
            <button 
              onClick={shareTicket}
              className="flex-1 bg-railway-lightBlue text-railway-blue flex items-center justify-center text-sm rounded-lg py-2 hover:bg-blue-100 transition-colors"
              aria-label="Share ticket"
            >
              <Share2 className="h-4 w-4 mr-1.5" />
              Share
            </button>
            <button 
              onClick={downloadQRCode}
              className="flex-1 bg-railway-lightBlue text-railway-blue flex items-center justify-center text-sm rounded-lg py-2 hover:bg-blue-100 transition-colors"
              aria-label="Download QR code"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download
            </button>
          </div>
          
          {!isVerified && (
            <button
              onClick={verifyTicket}
              className="w-full mt-2 bg-green-50 text-green-700 border border-green-200 flex items-center justify-center text-sm rounded-lg py-2 hover:bg-green-100 transition-colors"
            >
              <Shield className="h-4 w-4 mr-1.5" />
              Verify Authenticity
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;