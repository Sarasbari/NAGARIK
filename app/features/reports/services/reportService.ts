// features/reports/services — Report submission and fetching

import api from '../../../core/services/api';
import { supabase } from '../../../core/services/supabase';

/**
 * Submit a new report to the AI classification pipeline.
 */
export async function submitReport(payload: {
  photoUri: string;
  latitude: number;
  longitude: number;
  issueType: string;
}) {
  // TODO: Upload photo to Supabase Storage, then send metadata to AI API
  const response = await api.post('/classify', payload);
  return response.data;
}

/**
 * Fetch all reports for the current user.
 */
export async function fetchUserReports(userId: string) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch a single report by ID.
 */
export async function fetchReportById(reportId: string) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error) throw error;
  return data;
}
