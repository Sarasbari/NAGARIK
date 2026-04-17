import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Edge Function: sla-checker
 * Cron job: runs every 15 minutes to flag SLA breaches.
 *
 * SLA thresholds:
 * - Severity 5: 4 hours
 * - Severity 4: 8 hours
 * - Severity 3: 24 hours
 * - Severity 2: 48 hours
 * - Severity 1: 72 hours
 */

const SLA_HOURS: Record<number, number> = {
  5: 4,
  4: 8,
  3: 24,
  2: 48,
  1: 72,
};

serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all unresolved reports
    const { data: reports, error } = await supabase
      .from("reports")
      .select("id, severity, created_at, status")
      .not("status", "eq", "resolved");

    if (error) throw error;

    const now = new Date();
    const breaches: string[] = [];

    for (const report of reports ?? []) {
      const slaHours = SLA_HOURS[report.severity] ?? 48;
      const created = new Date(report.created_at);
      const elapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

      if (elapsed > slaHours) {
        breaches.push(report.id);

        // Flag the report as SLA-breached
        await supabase
          .from("reports")
          .update({ status: "sla_breached" })
          .eq("id", report.id)
          .eq("status", report.status); // Prevent race conditions
      }
    }

    return new Response(
      JSON.stringify({
        checked: reports?.length ?? 0,
        breaches: breaches.length,
        breached_ids: breaches,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
