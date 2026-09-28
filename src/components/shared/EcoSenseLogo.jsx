import React from "react";

// Logo oficial da EcoSense Monitor (imagem pública)
export const LOGO_URL =
  "https://media.base44.com/images/public/6ab9c2047f11e4a7e4e64994/b2a6779f8_Designsemnome3.png";

/**
 * Recorte da logo central (a imagem original tem margens brancas grandes).
 * O chip branco garante legibilidade no tema claro e escuro.
 */
export default function EcoSenseLogo({ className = "w-8 h-8", rounded = "rounded-xl" }) {
  return (
    <div
      className={`${className} ${rounded} overflow-hidden bg-white flex-shrink-0 ring-1 ring-black/10`}
      title="EcoSense Monitor"
    >
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `url(${LOGO_URL})`,
          backgroundSize: "401.6% auto",
          backgroundPosition: "50.1% 49.8%",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}