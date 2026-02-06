import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { topic, subject, difficulty = "medium", questionCount = 5 } = await req.json();
    console.log(`Generating ${questionCount} questions for ${topic} (${subject}) - ${difficulty}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert educator creating exam questions. Generate exactly ${questionCount} multiple-choice questions about the given topic.

RULES:
- Each question must have exactly 4 options (A, B, C, D)
- Only one option should be correct
- Questions should be at ${difficulty} difficulty level
- Include a brief explanation for the correct answer
- Questions should test understanding, not just memorization

You MUST respond with valid JSON in this exact format:
{
  "questions": [
    {
      "id": 1,
      "question": "What is...",
      "options": {
        "A": "First option",
        "B": "Second option", 
        "C": "Third option",
        "D": "Fourth option"
      },
      "correctAnswer": "A",
      "explanation": "Brief explanation of why A is correct"
    }
  ]
}`
          },
          {
            role: "user",
            content: `Generate ${questionCount} ${difficulty}-level multiple choice questions about "${topic}" in the subject of ${subject}.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quiz",
              description: "Generate multiple choice quiz questions",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        question: { type: "string" },
                        options: {
                          type: "object",
                          properties: {
                            A: { type: "string" },
                            B: { type: "string" },
                            C: { type: "string" },
                            D: { type: "string" }
                          },
                          required: ["A", "B", "C", "D"]
                        },
                        correctAnswer: { type: "string", enum: ["A", "B", "C", "D"] },
                        explanation: { type: "string" }
                      },
                      required: ["id", "question", "options", "correctAnswer", "explanation"]
                    }
                  }
                },
                required: ["questions"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_quiz" } }
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const errorText = await response.text();
      console.error("Error details:", errorText);
      throw new Error("Failed to generate questions");
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      // Try parsing from content if no tool call
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch {
          throw new Error("Failed to parse questions from response");
        }
      }
      throw new Error("No questions generated");
    }

    const questions = JSON.parse(toolCall.function.arguments);
    console.log(`Generated ${questions.questions?.length || 0} questions`);

    return new Response(JSON.stringify(questions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Generate quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
