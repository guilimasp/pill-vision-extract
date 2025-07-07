import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera as CameraIcon, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
        // Store the image temporarily and navigate to results
        sessionStorage.setItem("capturedImage", image.base64String);
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
    <div className="min-h-screen bg-medical-bg flex flex-col">
      {/* Header */}
      <div className="p-4 bg-medical-surface border-b border-border">
        <Button
          variant="outline"
          onClick={handleEditPrompt}
          className="w-full"
          size="lg"
        >
          <Edit className="mr-2 h-5 w-5" />
          Editar Prompt
        </Button>
      </div>

      {/* Camera Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm aspect-[3/4] bg-muted/20 border-2 border-dashed border-primary/30 flex items-center justify-center">
          <div className="text-center">
            <CameraIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aponte a câmera para a{" "}
              <br />
              frente da caixa do medicamento
            </p>
          </div>
        </Card>
      </div>

      {/* Bottom Action */}
      <div className="p-6 bg-medical-surface border-t border-border">
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