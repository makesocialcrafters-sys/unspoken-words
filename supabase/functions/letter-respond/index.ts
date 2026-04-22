// Edge function: receives a letter and returns a warm, supportive response
// using the Lovable AI Gateway. No external API key required.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipient, mood, letter, nickname } = await req.json();

    if (!letter || typeof letter !== "string" || letter.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Brief ist zu kurz." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI Gateway nicht konfiguriert." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = `Du bist Frauenmoment — eine warme, einfühlsame, weibliche Stimme.
Du antwortest auf Briefe von Frauen, die sich öffnen.
Deine Stimme ist:
- zart, ehrlich, niemals belehrend
- poetisch aber bodenständig
- in der Du-Form, weiblich
- ohne Ratschläge zu erteilen, außer sie werden gewünscht
- du validierst Gefühle, ohne sie zu bewerten
- du benutzt einfache, sinnliche Sprache (kein Coaching-Jargon)
- 3 bis 6 Sätze. Kurz. Warm. Nah.
- niemals "Ich verstehe" — zeige Verständnis durch Spiegelung
- keine Emojis, keine Listen, keine Überschriften
- antworte auf Deutsch`;

    const userContext = [
      nickname ? `Geschrieben von: ${nickname}` : null,
      recipient ? `An: ${recipient}` : null,
      mood ? `Stimmung: ${mood}` : null,
      "",
      "Brief:",
      letter.trim(),
    ].filter(Boolean).join("\n");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContext },
        ],
      }),
    });

    if (aiRes.status === 429) {
      return new Response(
        JSON.stringify({ error: "Zu viele Anfragen. Bitte einen Moment warten." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (aiRes.status === 402) {
      return new Response(
        JSON.stringify({ error: "Guthaben aufgebraucht. Bitte später nochmal." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error("AI Gateway error", aiRes.status, text);
      return new Response(
        JSON.stringify({ error: "Konnte keine Antwort schreiben." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await aiRes.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() ?? "";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("letter-respond error", e);
    return new Response(
      JSON.stringify({ error: "Unerwarteter Fehler." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
