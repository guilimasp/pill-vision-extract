import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_PROMPT = `Analyze this Brazilian medication box front image. Extract the following information:

NOME: [Product name exactly as shown]
PRINCIPIO ATIVO: [Active ingredient]  
DOSAGEM: [Dosage like 5mg, 10ml, etc.]
QUANTIDADE: [Quantity number only, like 30]
LABORATORIO: [Manufacturer name]
TARJA: [TV, TP, VL, or blank if no stripe visible]

Leave any field empty if the information is unclear or not visible. Return only the requested information in the exact format above.`;

const PromptEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    // Load saved prompt or use default
    const savedPrompt = localStorage.getItem("medicationPrompt");
    setPrompt(savedPrompt || DEFAULT_PROMPT);
  }, []);

  const handleSave = () => {
    localStorage.setItem("medicationPrompt", prompt);
    toast({
      title: "Sucesso",
      description: "Prompt salvo com sucesso!",
    });
    navigate("/");
  };

  const handleBack = () => {
    navigate("/");
  };

  const resetToDefault = () => {
    setPrompt(DEFAULT_PROMPT);
    toast({
      title: "Prompt restaurado",
      description: "Prompt padrão foi restaurado.",
    });
  };

  return (
    <div className="min-h-screen bg-medical-bg">
      {/* Header */}
      <div className="p-4 bg-medical-surface border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">Editar Prompt</h1>
      </div>

      {/* Content */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prompt de Análise</CardTitle>
            <p className="text-sm text-muted-foreground">
              Personalize as instruções para a análise dos medicamentos
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={12}
              className="resize-none"
              placeholder="Digite seu prompt personalizado..."
            />
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetToDefault} className="flex-1">
                Restaurar Padrão
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromptEditor;