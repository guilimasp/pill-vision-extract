import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera as CameraIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeMedicationImage, MedicationData } from "@/lib/openai";

const ResultsScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [medicationData, setMedicationData] = useState<MedicationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzeImage();
  }, []);

  const analyzeImage = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const imageBase64 = sessionStorage.getItem("capturedImage");
      const prompt = localStorage.getItem("medicationPrompt") || "";

      if (!imageBase64) {
        throw new Error("No image found");
      }

      // Chamada real para a API do OpenAI
      const medicationData = await analyzeMedicationImage(imageBase64, prompt);
      setMedicationData(medicationData);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setError("Erro de análise. Tente novamente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    sessionStorage.removeItem("capturedImage");
    navigate("/");
  };

  const getStripeColor = (stripe: string) => {
    switch (stripe) {
      case "TV": return "bg-destructive";
      case "TP": return "bg-medical-warning";
      case "VL": return "bg-medical-success";
      default: return "bg-muted";
    }
  };

  const getStripeText = (stripe: string) => {
    switch (stripe) {
      case "TV": return "Tarja Vermelha";
      case "TP": return "Tarja Preta";
      case "VL": return "Venda Livre";
      default: return "Não identificado";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-medical-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium">Analisando...</p>
          <p className="text-sm text-muted-foreground">
            Processando informações do medicamento
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-medical-bg flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-6">
            <div className="text-destructive text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold mb-2">Erro de Análise</h2>
            <p className="text-muted-foreground mb-6">
              Não foi possível analisar a imagem. Tente novamente com uma foto mais clara.
            </p>
            <Button onClick={handleTryAgain} className="w-full">
              <CameraIcon className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medical-bg">
      {/* Header */}
      <div className="p-4 bg-medical-surface border-b border-border">
        <h1 className="text-lg font-semibold text-center">Resultado da Análise</h1>
      </div>

      {/* Results */}
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Informações do Medicamento
              {medicationData?.stripe && (
                <Badge className={getStripeColor(medicationData.stripe)}>
                  {getStripeText(medicationData.stripe)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">NOME</label>
                <p className="text-base font-medium">
                  {medicationData?.name || "Não identificado"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">PRINCÍPIO ATIVO</label>
                <p className="text-base">
                  {medicationData?.activeIngredient || "Não identificado"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">DOSAGEM</label>
                  <p className="text-base">
                    {medicationData?.dosage || "Não identificado"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">QUANTIDADE</label>
                  <p className="text-base">
                    {medicationData?.quantity || "Não identificado"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">LABORATÓRIO</label>
                <p className="text-base">
                  {medicationData?.laboratory || "Não identificado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-medical-surface border-t border-border">
        <Button onClick={handleTryAgain} className="w-full" size="lg">
          <CameraIcon className="mr-2 h-5 w-5" />
          Tentar Novamente
        </Button>
      </div>
    </div>
  );
};

export default ResultsScreen;