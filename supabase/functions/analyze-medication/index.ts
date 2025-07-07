import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Function called with method:", req.method);
    const { fileName, prompt } = await req.json();
    console.log("Received fileName:", fileName);
    console.log("Received prompt length:", prompt?.length || 0);

    if (!fileName || !prompt) {
      return new Response(
        JSON.stringify({ error: "fileName and prompt are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the image from storage
    console.log("Attempting to download image:", fileName);
    const { data: imageData, error: downloadError } = await supabase
      .storage
      .from("boxes")
      .download(fileName);

    if (downloadError) {
      console.error("Error downloading image:", downloadError);
      return new Response(
        JSON.stringify({
          error: "Failed to download image: " + downloadError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      "Image downloaded successfully, size:",
      imageData?.size || "unknown",
    );

    // Convert image to base64
    console.log("Converting image to base64...");
    const imageBuffer = await imageData.arrayBuffer();

    // Convert to base64 more efficiently
    const uint8Array = new Uint8Array(imageBuffer);
    let binary = "";
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Image = btoa(binary);

    console.log("Base64 conversion completed, length:", base64Image.length);

    // Call OpenAI API
    console.log("Checking OpenAI API key...");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("OpenAI API key not found in environment variables");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    console.log("OpenAI API key found, making request...");

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
          temperature: 0.1,
        }),
      },
    );

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({
          error: `OpenAI API error: ${
            errorData.error?.message || openaiResponse.statusText
          }`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Empty response from OpenAI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse the response
    const lines: string[] = content.split("\n").filter((line: string) =>
      line.trim()
    );
    const result = {
      name: "",
      activeIngredient: "",
      dosage: "",
      quantity: "",
      laboratory: "",
      stripe: "",
    };

    for (const line of lines) {
      if (line.includes("NOME:")) {
        result.name = line.split("NOME:")[1]?.trim() || "";
      } else if (line.includes("PRINCIPIO ATIVO:")) {
        result.activeIngredient = line.split("PRINCIPIO ATIVO:")[1]?.trim() ||
          "";
      } else if (line.includes("DOSAGEM:")) {
        result.dosage = line.split("DOSAGEM:")[1]?.trim() || "";
      } else if (line.includes("QUANTIDADE:")) {
        result.quantity = line.split("QUANTIDADE:")[1]?.trim() || "";
      } else if (line.includes("LABORATORIO:")) {
        result.laboratory = line.split("LABORATORIO:")[1]?.trim() || "";
      } else if (line.includes("TARJA:")) {
        result.stripe = line.split("TARJA:")[1]?.trim() || "";
      }
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
