import { supabase } from '@/integrations/supabase/client';
import { MedicalInfo } from './emergencyService';
import { Database } from '@/integrations/supabase/types';

export interface MedicalInfoRecord {
  id: string;
  user_id: string;
  info: MedicalInfo;
  created_at: string;
  updated_at: string;
  user_details?: {
    full_name: string | null;
    email: string | null;
    avatar_url?: string | null;
  };
}

// Fetch all medical information records (admin only)
export const fetchAllMedicalInfo = async (): Promise<MedicalInfoRecord[]> => {
  try {
    const { data: medicalInfo, error } = await supabase
      .from('medical_info')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching medical information:', error);
      throw error;
    }

    // Now fetch the user details for each record
    const userDetailsPromises = medicalInfo.map(async (record) => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', record.user_id)
        .single();
      
      if (profileError) {
        console.warn(`Error fetching profile for user ${record.user_id}:`, profileError);
        return {
          ...record,
          info: record.info as unknown as MedicalInfo,
          user_details: {
            full_name: 'Unknown User',
            email: null,
            avatar_url: null
          }
        };
      }
      
      return {
        ...record,
        info: record.info as unknown as MedicalInfo,
        user_details: {
          ...profileData,
          email: null // Add the missing email field
        }
      };
    });
    
    const recordsWithUserDetails = await Promise.all(userDetailsPromises);
    return recordsWithUserDetails as unknown as MedicalInfoRecord[];
  } catch (error) {
    console.error('Error in fetchAllMedicalInfo:', error);
    throw error;
  }
};

// Fetch a single medical information record by ID (admin only)
export const fetchMedicalInfoById = async (id: string): Promise<MedicalInfoRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('medical_info')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching medical info with ID ${id}:`, error);
      return null;
    }
    
    // Fetch user profile details
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', data.user_id)
      .single();
    
    if (profileError) {
      console.warn(`Error fetching profile for user ${data.user_id}:`, profileError);
      return {
        ...data,
        info: data.info as unknown as MedicalInfo,
        user_details: {
          full_name: 'Unknown User',
          email: null,
          avatar_url: null
        }
      } as unknown as MedicalInfoRecord;
    }
    
    return {
      ...data,
      info: data.info as unknown as MedicalInfo,
      user_details: {
        ...profileData,
        email: null // Add the missing email field
      }
    } as unknown as MedicalInfoRecord;
  } catch (error) {
    console.error('Error in fetchMedicalInfoById:', error);
    return null;
  }
};

// Generate an emergency card URL for a user
export const generateEmergencyCardUrl = (medicalInfo: MedicalInfo): string => {
  // Create a simplified version of medical info for QR code
  const qrData = {
    name: medicalInfo.fullName,
    bloodType: medicalInfo.bloodType,
    allergies: medicalInfo.allergies,
    medications: medicalInfo.medications,
    conditions: medicalInfo.conditions,
    emergencyContacts: medicalInfo.emergencyContacts?.map(c => ({
      name: c.name,
      phone: c.phone
    }))
  };
  
  // Generate QR code URL using a service like QR Server
  const qrCodeText = encodeURIComponent(JSON.stringify(qrData));
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCodeText}`;
}; 