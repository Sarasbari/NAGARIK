import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Edge Function: notify-citizen
 * Triggered on report status change → sends push notification to citizen.
 */
serve(async (req) => {
  try {
    const { record, old_record } = await req.json();

    // Only trigger on status change
    if (record.status === old_record?.status) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get citizen's push token
    const { data: profile } = await supabase
      .from("profiles")
      .select("push_token")
      .eq("id", record.citizen_id)
      .single();

    if (!profile?.push_token) {
      return new Response(JSON.stringify({ error: "No push token" }), {
        status: 200,
      });
    }

    // Send Expo push notification
    const message = {
      to: profile.push_token,
      sound: "default",
      title: "Nagarik Update 🇮🇳",
      body: `Your ${record.issue_type} report is now: ${record.status.replace("_", " ")}`,
      data: { reportId: record.id },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
