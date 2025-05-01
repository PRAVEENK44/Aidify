/**
 * Utility functions for device detection and platform-specific functionality
 */

/**
 * Detects if the application is running on a mobile device
 * @returns boolean indicating if the current device is mobile
 */
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Regular expression to detect most mobile devices
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Check if it's a mobile device
  if (mobileRegex.test(userAgent)) {
    return true;
  }
  
  // Additional check for viewport dimensions (typically mobile devices are narrower)
  if (window.innerWidth <= 768) {
    return true;
  }
  
  return false;
};

/**
 * Handles emergency calls appropriately based on the platform
 * @param emergencyNumber The emergency number to call (e.g., "108", "911")
 * @returns boolean indicating if the call was initiated
 */
export const initiateEmergencyCall = (emergencyNumber: string = "108"): boolean => {
  try {
    // For mobile devices, use the native tel: protocol
    if (isMobileDevice()) {
      window.location.href = `tel:${emergencyNumber}`;
      return true;
    } 
    
    // For web browsers, try using Web Intents API if available
    else if (navigator.canShare) {
      // Some newer browsers support this
      const shareData = {
        title: 'Emergency Call',
        text: `Call emergency number: ${emergencyNumber}`,
        url: `tel:${emergencyNumber}`
      };
      
      try {
        navigator.share(shareData);
        return true;
      } catch (err) {
        console.error('Web Share API failed:', err);
        // Fall back to tel: protocol
        window.location.href = `tel:${emergencyNumber}`;
        return true;
      }
    }
    
    // Default fallback for desktop browsers
    else {
      window.location.href = `tel:${emergencyNumber}`;
      return true;
    }
  } catch (error) {
    console.error('Failed to initiate emergency call:', error);
    return false;
  }
}; 