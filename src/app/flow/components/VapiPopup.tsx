import React from 'react';
import { Mic, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VapiPopupProps {
  onDisconnect: () => void;
}

const VapiPopup: React.FC<VapiPopupProps> = ({ onDisconnect }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center" style={{ width: '33vw', height: '36vh', display: 'flex', justifyContent: 'center' }}>
        <div className="w-24 h-24 rounded-full border-4 border-gray-600 flex items-center justify-center mb-[7vh]">
          <Mic className="w-12 h-12 text-gray-600" />
        </div>
        <Button
          onClick={onDisconnect}
          variant="destructive"
          className="flex items-center w-[29vw]"
        >
          <PhoneOff className="w-5 h-5 mr-2" />
          Disconnect
        </Button>
      </div>
    </div>
  );
};

export default VapiPopup;