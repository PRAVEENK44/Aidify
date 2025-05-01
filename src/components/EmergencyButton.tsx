import { useState } from 'react';
import { PhoneCall, Ambulance, X, AlertTriangle, MapPin, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerEmergency, getCurrentLocation } from '@/services/emergencyService';
import { initiateEmergencyCall, isMobileDevice } from '@/utils/deviceUtils';
import { toast } from 'sonner';

const EmergencyButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { user } = useAuth();
  
  // Check if we're on a mobile device
  const isMobile = isMobileDevice();

  const handleEmergencyCall = async () => {
    setIsLoading(true);
    
    try {
      if (user) {
        // If user is logged in, use the full emergency service
        await triggerEmergency(user.id);
      } else {
        // For non-logged in users, just make the call
        initiateEmergencyCall("108");
      }
    } catch (error) {
      console.error('Error during emergency call:', error);
      // Fallback to direct call with our utility
      initiateEmergencyCall("108");
    } finally {
      setIsLoading(false);
      setIsExpanded(false);
    }
  };

  const handleShareLocation = async () => {
    setIsSharing(true);
    
    try {
      const location = await getCurrentLocation();
      const locationUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      const shareText = `I need help! My current location: ${locationUrl}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Emergency Location',
          text: shareText,
          url: locationUrl
        });
        // Don't notify after successful share since the share dialog already provides feedback
      } else {
        // Fallback for browsers that don't support the Share API
        await navigator.clipboard.writeText(shareText);
        toast.success("Location copied to clipboard", {
          icon: <Copy className="h-4 w-4" />,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error sharing location:', error);
      // Only show toast if it's not a user cancellation
      if (error.name !== 'AbortError') {
        toast.error("Could not share location", {
          description: "Please try again or use another method",
          duration: 3000,
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="mb-4 flex flex-col gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Button 
              onClick={handleEmergencyCall} 
              variant="destructive"
              className="gap-2 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Calling...
                </span>
              ) : (
                <>
                  <Ambulance className="h-4 w-4" />
                  <span>Call 108</span>
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleShareLocation}
              variant="outline"
              className="bg-white border-red-200 text-red-700 hover:bg-red-50 gap-2 shadow-md"
              disabled={isSharing}
            >
              {isSharing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  Sharing...
                </span>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>Share Location</span>
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`rounded-full w-14 h-14 p-0 shadow-lg ${
            isExpanded 
              ? 'bg-gray-800 hover:bg-gray-900' 
              : 'bg-red-600 hover:bg-red-700 animate-pulse-emergency'
          }`}
        >
          {isExpanded ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <PhoneCall className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-300"></span>
              </span>
            </>
          )}
        </Button>
        
        {!isExpanded && (
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap text-xs bg-red-100 text-red-800 rounded-full px-2 py-0.5">
            Emergency
          </span>
        )}
      </motion.div>
    </div>
  );
};

export default EmergencyButton; 