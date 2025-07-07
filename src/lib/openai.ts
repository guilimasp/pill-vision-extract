export interface MedicationData {
  name: string;
  activeIngredient: string;
  dosage: string;
  quantity: string;
  laboratory: string;
  stripe: string;
}

export const analyzeMedicationImage = async (
  imageBase64: string,
  prompt: string
): Promise<MedicationData> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("API key do OpenAI não configurada");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Erro na API: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da API");
    }

    // Parse da resposta da API
    const lines = content.split("\n").filter((line) => line.trim());
    const result: MedicationData = {
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
        result.activeIngredient =
          line.split("PRINCIPIO ATIVO:")[1]?.trim() || "";
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

    return result;
  } catch (error) {
    console.error("Erro na análise da imagem:", error);
    throw error;
  }
};
