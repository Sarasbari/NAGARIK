import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/reports
 * Receives FormData(image, citizen_id?) from the mobile app.
 * 1. Uploads image to Supabase Storage (report-images bucket)
 * 2. Sends original image to ML service for analysis
 * 3. If rejected → deletes image, returns 422
 * 4. If accepted → inserts report into DB, returns { accepted, report }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const citizenId = formData.get('citizen_id') as string | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // ─── 1. Upload image to Supabase Storage ───
    const timestamp = Date.now();
    const fileName = `report_${timestamp}_${imageFile.name || 'photo.jpg'}`;
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('report-images')
      .upload(fileName, imageBuffer, {
        contentType: imageFile.type || 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Storage Upload Error]', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from('report-images')
      .getPublicUrl(fileName);
    const imageUrl = urlData.publicUrl;

    // ─── 2. Send image to ML service for analysis ───
    const mlFormData = new FormData();
    const mlBlob = new Blob([imageBuffer], { type: imageFile.type || 'image/jpeg' });
    mlFormData.append('file', mlBlob, imageFile.name || 'photo.jpg');

    let mlResult;
    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/analyze/`, {
        method: 'POST',
        body: mlFormData,
      });

      if (!mlResponse.ok) {
        throw new Error(`ML service returned ${mlResponse.status}`);
      }

      mlResult = await mlResponse.json();
    } catch (mlError: any) {
      console.error('[ML Service Error]', mlError.message);
      // Clean up uploaded image on ML failure
      await supabase.storage.from('report-images').remove([fileName]);
      return NextResponse.json(
        { error: 'ML analysis failed', details: mlError.message },
        { status: 502 }
      );
    }

    // ─── 3. If rejected → delete image, return 422 ───
    if (!mlResult.accepted) {
      await supabase.storage.from('report-images').remove([fileName]);
      return NextResponse.json(
        { accepted: false, reason: mlResult.reason || 'rejected_by_ml' },
        { status: 422 }
      );
    }

    // ─── 4. If accepted → insert report into Supabase ───
    const reportData = {
      citizen_id: citizenId || null,
      issue_type: mlResult.category,
      severity: mlResult.severity,
      status: 'ai_reviewed',
      photo_url: imageUrl,
      latitude: mlResult.latitude,
      longitude: mlResult.longitude,
      ai_confidence: mlResult.confidence,
    };

    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert(reportData)
      .select()
      .single();

    if (insertError) {
      console.error('[DB Insert Error]', insertError);
      return NextResponse.json(
        { error: 'Failed to save report', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ accepted: true, report }, { status: 201 });

  } catch (err: any) {
    console.error('[POST /api/reports] Unhandled error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports
 * Fetch all reports ordered by created_at DESC.
 * Optional query params: ?status=submitted&severity=5&citizen_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const citizenId = searchParams.get('citizen_id');

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (severity) {
      query = query.eq('severity', parseInt(severity));
    }
    if (citizenId) {
      query = query.eq('citizen_id', citizenId);
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error('[GET /api/reports] Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reports', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ reports }, { status: 200 });

  } catch (err: any) {
    console.error('[GET /api/reports] Unhandled error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
