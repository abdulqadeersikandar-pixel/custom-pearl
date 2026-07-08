import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WhatsAppStatusCard = () => {
  const [statusData, setStatusData] = useState({ status: 'INITIALIZING', qrCodeUrl: '' });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/whatsapp-status');
        setStatusData(response.data);
      } catch (error) {
        console.error("WhatsApp status fetch error:", error);
      }
    };

    fetchStatus();
    
    // Har 3 second baad background mein check karega ke QR code ya status change toh nahi hua
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto mt-4">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <span className="text-[#25D366]">📱</span> WhatsApp Bot Automation
      </h3>
      
      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg min-h-[250px]">
        
        {/* Status 1: Loading / Initializing */}
        {statusData.status === 'INITIALIZING' && (
          <div className="text-center animate-pulse">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Server Start Ho Raha Hai...</p>
          </div>
        )}

        {/* Status 2: QR Code is Ready to Scan */}
        {statusData.status === 'QR_READY' && statusData.qrCodeUrl && (
          <div className="text-center animate-fade-in">
            <img 
              src={statusData.qrCodeUrl} 
              alt="WhatsApp QR Code" 
              className="w-48 h-48 mx-auto mb-3 border border-gray-300 shadow-sm rounded-lg bg-white p-1" 
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium px-4">
              Apne mobile se WhatsApp Linked Devices mein ja kar yeh QR code scan karein.
            </p>
          </div>
        )}

        {/* Status 3: Connected Successfully */}
        {statusData.status === 'CONNECTED' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-sm">
              ✓
            </div>
            <p className="text-green-600 dark:text-green-400 font-bold text-lg">Connected & Active</p>
            <p className="text-xs text-gray-500 mt-1">Order confirmations automatically send ho rahi hain.</p>
          </div>
        )}

        {/* Status 4: Disconnected / Logged Out */}
        {statusData.status === 'DISCONNECTED' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-sm">
              !
            </div>
            <p className="text-red-600 dark:text-red-400 font-bold text-lg">Disconnected</p>
            <p className="text-xs text-gray-500 mt-1">Connection toot gaya hai. Kuch dair mein naya QR code show hoga...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppStatusCard;