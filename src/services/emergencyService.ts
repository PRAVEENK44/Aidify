import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import { Database, Json } from '@/integrations/supabase/types';
import { initiateEmergencyCall } from '@/utils/deviceUtils';

// Define MedicalInfo and Location types separately from Database
export interface MedicalInfo {
  fullName: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  emergencyContacts?: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  notes?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  address?: string;
}

// Store medical information locally for emergency access
export const storeMedicalInfo = async (userId: string, medicalInfo: MedicalInfo): Promise<void> => {
  try {
    // Store in localStorage for offline access
    localStorage.setItem('emergency_medical_info', JSON.stringify(medicalInfo));
    
    // Also store in Supabase if connected
    if (navigator.onLine) {
      const { error } = await supabase
        .from('medical_info')
        .upsert({ 
          user_id: userId, 
          info: medicalInfo as unknown as Json
        }, 
        { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error storing medical info in database:', error);
      }
    }
  } catch (error) {
    console.error('Error storing medical info:', error);
    throw error;
  }
};

// Retrieve stored medical information
export const getMedicalInfo = async (userId?: string): Promise<MedicalInfo | null> => {
  try {
    // First try to get from localStorage (works offline)
    const localData = localStorage.getItem('emergency_medical_info');
    if (localData) {
      return JSON.parse(localData);
    }
    
    // If not in localStorage and we have userId, try from Supabase
    if (userId && navigator.onLine) {
      const { data, error } = await supabase
        .from('medical_info')
        .select('info')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error retrieving medical info from database:', error);
        return null;
      }
      
      if (data && data.info) {
        // Save to localStorage for offline access
        localStorage.setItem('emergency_medical_info', JSON.stringify(data.info));
        return data.info as unknown as MedicalInfo;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving medical info:', error);
    return null;
  }
};

// Get current location
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        // Try to get address using reverse geocoding
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}`)
          .then(response => response.json())
          .then(data => {
            if (data.display_name) {
              location.address = data.display_name;
            }
            resolve(location);
          })
          .catch(() => {
            // If geocoding fails, still return the coordinates
            resolve(location);
          });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};

// Send emergency SMS with location to emergency contacts
export const sendEmergencySMS = async (userId: string): Promise<boolean> => {
  try {
    // Get the user's medical info to find emergency contacts
    const medicalInfo = await getMedicalInfo(userId);
    if (!medicalInfo?.emergencyContacts || medicalInfo.emergencyContacts.length === 0) {
      console.error('No emergency contacts found');
      return false;
    }
    
    // Get current location
    const location = await getCurrentLocation();
    
    // Prepare the message
    const message = `EMERGENCY ALERT: ${medicalInfo.fullName} requires emergency assistance. ` +
      `Current location: ${location.address || `https://maps.google.com/?q=${location.latitude},${location.longitude}`}`;
    
    // We'll use a serverless function to send SMS (simulate for now)
    // In production, this would call a Supabase Edge Function
    console.log('Sending emergency SMS:', message);
    console.log('To contacts:', medicalInfo.emergencyContacts.map(c => c.phone).join(', '));
    
    // For a real implementation, we would call a service like Twilio through a serverless function
    // This is a simulation for demonstration purposes
    const simulate = await new Promise<boolean>(resolve => {
      setTimeout(() => resolve(true), 1000);
    });
    
    // Log the emergency event
    if (navigator.onLine) {
      await supabase.from('emergency_events').insert({
        user_id: userId,
        location: location as unknown as Json,
        contacts_notified: medicalInfo.emergencyContacts.map(c => c.phone),
        timestamp: new Date().toISOString()
      });
    }
    
    return simulate;
  } catch (error) {
    console.error('Error sending emergency SMS:', error);
    return false;
  }
};

// Trigger an emergency call and send SMS
export const triggerEmergency = async (userId: string): Promise<void> => {
  try {
    // Start sending SMS to emergency contacts in the background
    sendEmergencySMS(userId).catch(console.error);
    
    // Create a QR code URL with medical info (for emergency responders)
    const medicalInfo = await getMedicalInfo(userId);
    if (medicalInfo) {
      const medicalInfoStr = encodeURIComponent(JSON.stringify({
        name: medicalInfo.fullName,
        bloodType: medicalInfo.bloodType,
        allergies: medicalInfo.allergies,
        medications: medicalInfo.medications,
        conditions: medicalInfo.conditions,
        notes: medicalInfo.notes
      }));
      
      // Generate a shareable URL with this info
      const emergencyUrl = `${window.location.origin}/emergency-info?data=${medicalInfoStr}`;
      
      // Store the URL for quick access
      localStorage.setItem('emergency_info_url', emergencyUrl);
    }
    
    // Initiate call to emergency services using the utility function
    // This will handle different platforms appropriately
    if (!initiateEmergencyCall("108")) {
      // If the utility function fails, fallback to the basic approach
      window.location.href = "tel:108";
    }
  } catch (error) {
    console.error('Error triggering emergency:', error);
    // Fallback to just making the call
    window.location.href = "tel:108";
  }
}; 