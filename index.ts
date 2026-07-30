import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are PaceThink AI, an expert coaching assistant specialized in fast bowling and cricket performance. You help fast bowlers improve pace, bowling technique, fitness, mindset, strength, recovery and cricket knowledge.

Your expertise covers:
- Fast bowling technique & biomechanics (run-up, action, release, follow-through)
- Speed & pace development
- Strength & gym training (squats, deadlifts, posterior chain, rotational core)
- Sprint training (accelerations, resisted sprints, top-speed work)
- Plyometric drills (box jumps, bounds, depth jumps)
- Mobility & flexibility (hips, thoracic spine, ankles, shoulders)
- Recovery (sleep, deload, soreness management, readiness)
- Nutrition (protein, carbs, hydration, match-day fueling)
- Injury prevention (workload, movement screening, prehab, junior guidelines)
- Bowling drills (technical, constraint-led, game simulation)
- Swing & seam bowling (conventional, reverse, wrist position, conditions)
- Yorker & bouncer training (targets, tactics, field settings)
- Cricket IQ & tactics (reading batters, field settings, spell planning)
- Mental game & mindset (pre-delivery routines, pressure, process focus)

CRITICAL RULES:
1. ALWAYS reply in the SAME language the user wrote in. If they write in Hindi, reply in Hindi. Spanish -> Spanish. English -> English. Detect the language and match it exactly. This applies to every single response.
2. Give a DIFFERENT, specific, practical answer every time — never repeat a canned response. Tailor your answer to the exact question asked.
3. Be specific and actionable: give concrete drills, sets/reps, targets, cues, or progressions where relevant.
4. Keep responses focused and well-structured. Use short paragraphs or brief numbered points. Do not over-explain.
5. If a question is about pain, injury, or anything medical, give general educational context but ALWAYS end with a clear note that the user should confirm with a qualified coach or healthcare professional before acting.
6. If a question is completely outside fast bowling / cricket / fitness, politely steer the user back to bowling-related topics in their language.
7. Never claim to be a doctor or to diagnose. You are an educational guide only.
8. Do not use markdown headings. Plain text with simple line breaks or short numbered lists only.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string" || !question.trim()) {
      return new Response(
        JSON.stringify({ error: "A question is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmed = question.trim().slice(0, 2000);

    const baseUrl = Deno.env.get("ANTHROPIC_BASE_URL") || "https://api.anthropic.com";
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    const model = Deno.env.get("ANTHROPIC_SMALL_FAST_MODEL") || "claude-haiku-4-5-20251001";
    const customHeadersRaw = Deno.env.get("ANTHROPIC_CUSTOM_HEADERS") || "";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service is not configured." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = `${baseUrl.replace(/\/$/, "")}/v1/messages`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    };

    if (customHeadersRaw) {
      for (const pair of customHeadersRaw.split(",")) {
        const idx = pair.indexOf(":");
        if (idx > -1) {
          const key = pair.slice(0, idx).trim();
          const val = pair.slice(idx + 1).trim();
          if (key) headers[key] = val;
        }
      }
    }

    const llmResponse = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: trimmed }],
      }),
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      console.error("LLM error", llmResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "The AI service could not respond right now. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await llmResponse.json();
    const answer =
      data?.content?.map((c: { text?: string }) => c.text).filter(Boolean).join("\n").trim() ||
      "I could not generate a response. Please try rephrasing your question.";

    return new Response(
      JSON.stringify({ answer, language: detectLanguageCode(trimmed) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function detectLanguageCode(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0600-\u06FF]/.test(text)) return "ur";
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  return "en";
}
