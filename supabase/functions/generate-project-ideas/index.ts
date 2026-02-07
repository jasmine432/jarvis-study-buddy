import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProjectIdeaRequest {
  skills: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  count?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { skills, difficulty, count = 3 }: ProjectIdeaRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating project ideas for:", { skills, difficulty, count });

    const systemPrompt = `You are a project idea generator for software developers. Generate creative and practical project ideas based on the user's skills and preferred difficulty level.

For each project idea, provide:
1. A catchy, descriptive title
2. A detailed description (2-3 sentences) explaining what the project does and what the user will learn
3. Relevant technology tags
4. A starter code snippet that gives users a head start (15-30 lines of actual functional code)

Difficulty levels:
- beginner: Simple projects focusing on fundamentals, fewer technologies, straightforward logic
- intermediate: More complex features, API integrations, database usage, authentication
- advanced: Complex architectures, performance optimization, advanced patterns, microservices

Always respond with valid JSON matching this exact structure:
{
  "ideas": [
    {
      "title": "Project Title",
      "description": "Detailed description of the project...",
      "tags": ["Tag1", "Tag2", "Tag3"],
      "codeSnippet": "// Starter code here..."
    }
  ]
}`;

    const userPrompt = `Generate ${count} unique project ideas for a developer with these skills: ${skills.join(", ")}.

Difficulty level: ${difficulty}

Make sure each project:
1. Uses at least 2-3 of the specified skills
2. Is realistic and achievable for the ${difficulty} level
3. Has practical real-world applications
4. Includes a working starter code snippet in the most relevant language/framework

Return ONLY valid JSON with the ideas array.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to generate project ideas");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("Raw AI response:", content);

    // Parse the JSON response - handle potential markdown code blocks
    let ideas;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonString = jsonMatch[1].trim();
      const parsed = JSON.parse(jsonString);
      ideas = parsed.ideas || parsed;
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Invalid response format from AI");
    }

    // Validate and format the ideas
    const formattedIdeas = ideas.map((idea: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      title: idea.title || "Untitled Project",
      description: idea.description || "No description provided",
      difficulty: difficulty,
      tags: Array.isArray(idea.tags) ? idea.tags : [],
      codeSnippet: idea.codeSnippet || idea.code_snippet || null,
    }));

    console.log("Generated ideas:", formattedIdeas.length);

    return new Response(
      JSON.stringify({ ideas: formattedIdeas }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating project ideas:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate project ideas" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
