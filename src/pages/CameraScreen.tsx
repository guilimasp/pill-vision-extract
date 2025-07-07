import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera as CameraIcon, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

const CameraScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleEditPrompt = () => {
    navigate("/prompt-editor");
  };

  const takePicture = async () => {
    try {
      setIsLoading(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      if (image.base64String) {
        // Converter base64 para Blob
        const byteCharacters = atob(image.base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/jpeg" });

        // Gerar nome único para o arquivo
        const fileName = `${uuidv4()}.jpg`;

        // Upload para o Supabase Storage
        const { error } = await supabase.storage.from("boxes").upload(fileName, blob, {
          cacheControl: "3600",
          upsert: false,
        });

        if (error) {
          throw new Error("Erro ao fazer upload da imagem: " + error.message);
        }

        // Salvar nome do arquivo e navegar
        sessionStorage.setItem("uploadedFileName", fileName);
        navigate("/results");
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      toast({
        title: "Erro",
        description: "Não foi possível tirar a foto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-medical-bg flex flex-col overflow-hidden">
      {/* Header - altura fixa */}
      <div className="flex-shrink-0 p-3 bg-medical-surface border-b border-border">
        <Button
          variant="outline"
          onClick={handleEditPrompt}
          className="w-full"
          size="sm"
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar Prompt
        </Button>
      </div>

      {/* Camera Area - ocupa o espaço restante */}
      <div className="flex-1 flex items-center justify-center p-3 min-h-0">
        <Card className="w-full max-w-sm aspect-[3/4] bg-muted/20 border-2 border-dashed border-primary/30 flex items-center justify-center">
          <div className="text-center p-4">
            <CameraIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-tight">
              Aponte a câmera para a{" "}
              <br />
              frente da caixa do medicamento
            </p>
          </div>
        </Card>
      </div>

      {/* Bottom Action - altura fixa */}
      <div className="flex-shrink-0 p-3 bg-medical-surface border-t border-border">
        <Button
          onClick={takePicture}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          <CameraIcon className="mr-2 h-5 w-5" />
          {isLoading ? "Capturando..." : "Tirar Foto"}
        </Button>
      </div>
    </div>
  );
};

export default CameraScreen;