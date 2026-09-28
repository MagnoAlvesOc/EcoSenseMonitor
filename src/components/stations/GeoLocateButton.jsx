import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LocateFixed, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Botão de GPS automático. Usa a API de Geolocalização do navegador, que
 * combina GPS, Wi-Fi (triangulação por BSSID) e torres de celular para obter
 * a posição atual e preencher latitude/longitude automaticamente.
 */
export default function GeoLocateButton({ onLocate, disabled }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLococate = () => {
    if (!("geolocation" in navigator)) {
      toast({ title: "Geolocalização indisponível", description: "Seu navegador não suporta GPS.", variant: "destructive" });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        const { latitude, longitude, accuracy } = pos.coords;
        onLocate?.(latitude, longitude, accuracy);
        toast({
          title: "Posição detectada",
          description: `${latitude.toFixed(6)}, ${longitude.toFixed(6)} (precisão ~${Math.round(accuracy)} m)`,
        });
      },
      (err) => {
        setLoading(false);
        const msgs = {
          1: "Permissão de localização negada. Autorize o acesso à localização no navegador.",
          2: "Posição indisponível (GPS/Wi-Fi não puderam determinar a localização).",
          3: "Tempo esgotado ao obter a localização.",
        };
        toast({ title: "Falha no GPS", description: msgs[err.code] || err.message, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
      onClick={handleLococate}
      disabled={loading || disabled}
    >
      {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <LocateFixed className="w-4 h-4 mr-1" />}
      {loading ? "Detectando localização..." : "GPS automático (Wi-Fi/GPS)"}
    </Button>
  );
}