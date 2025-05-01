import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type CustomerFeedback = Database['public']['Tables']['customer_feedback']['Row'];
export type CustomerFeedbackInsert = Database['public']['Tables']['customer_feedback']['Insert'];

/**
 * Submit customer feedback to the database
 * For logged-in users, associates feedback with their user_id
 * For anonymous users, only stores the feedback details
 */
export const submitFeedback = async (
  feedback: Omit<CustomerFeedbackInsert, 'id' | 'user_id' | 'created_at' | 'timestamp'>,
  userId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Create the feedback record
    const feedbackRecord: CustomerFeedbackInsert = {
      user_id: userId || null,
      feedback_type: feedback.feedback_type,
      rating: feedback.rating,
      details: feedback.details || null,
      email: feedback.email || null,
      name: feedback.name || null,
      timestamp: new Date().toISOString()
    };

    // Add a timeout to ensure the request doesn't hang
    const timeoutPromise = new Promise<{ error: string }>((_, reject) => 
      setTimeout(() => reject({ error: "Request timed out. Please try again." }), 5000)
    );

    // Store in Supabase
    const supabasePromise = supabase
      .from('customer_feedback')
      .insert(feedbackRecord);
    
    // Race between the request and the timeout
    const result = await Promise.race([supabasePromise, timeoutPromise]);
    
    if ('error' in result && result.error) {
      console.error('Error storing feedback in database:', result.error);
      return { 
        success: false, 
        error: 'Failed to save feedback. Please try again later.' 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again later.'
    };
  }
};

/**
 * Get all feedback for a specific user
 * Used in user profile to show feedback history
 */
export const getUserFeedback = async (userId: string): Promise<CustomerFeedback[]> => {
  try {
    const { data, error } = await supabase
      .from('customer_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching user feedback:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    return [];
  }
}; 