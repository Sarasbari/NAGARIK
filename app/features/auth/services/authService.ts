// features/auth/services — Authentication service layer

import { supabase } from '../../../core/services/supabase';

/**
 * Send an OTP to the given phone number.
 */
export async function sendOTP(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
}

/**
 * Verify an OTP for the given phone number.
 */
export async function verifyOTP(phone: string, otp: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: otp,
    type: 'sms',
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
