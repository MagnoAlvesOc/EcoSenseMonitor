import React from "react";
import moment from "moment";
import { Zap, Moon, X } from "lucide-react";

// ── Formatação ────────────────────────────────────────────────────────────────
// Segundos → "Xmin Ys" / "Xh Ymin"; abaixo de 1 min mostra só segundos.
function fmtDur(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (isNaN(n)) return null;
  const total = Math.max(0, Math.round(n));
  if (total < 60) return `${total}s`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m < 60) return s ? `${m}min ${s}s` : `${m}min`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm ? `${h}h ${mm}min` : `${h}h`;
}

// Próximo despertar: aceita epoch (s/ms), segundos restantes ou data ISO.
function fmtProximo(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!isNaN(n)) {
    if (n > 1e12) return moment(n).format("DD/MM HH:mm:ss");
    if (n > 1e9) return moment(n * 1000).format("DD/MM HH:mm:ss");
    const d = fmtDur(n);
    return d != null ? `em ${d}` : String(v);
  }
  const m = moment(v, moment.ISO_8601);
  return m.isValid() ? m.format("DD/MM HH:mm:ss") : String(v);
}

// ── Painel "Energia da Estação" (aberto pelo ToggleGroup do Dashboard) ───────
export default function EnergyPanel({ row, open, onClose }) {
  if (!open) return null;

  const estado = String(row?.estado_energia || "").toUpperCase();
  const isSleep = estado === "DEEP_SLEEP";
  const isCollecting = estado === "COLETANDO";

  const items = [
    { label: "Ciclo", value: row?.ciclo_deepsleep != null && row.ciclo_deepsleep !== "" ? `#${row.ciclo_deepsleep}` : null },
    { label: "Evento atual", value: row?.evento_energia || null },
    { label: "Tempo ativo", value: fmtDur(row?.tempo_ativo_s) },
    { label: "Restante acordado", value: fmtDur(row?.tempo_restante_ativo_s) },
    { label: "Deep sleep programado", value: fmtDur(row?.tempo_sleep_programado_s) },
    { label: "Último deep sleep", value: fmtDur(row?.duracao_sleep_anterior_s) },
    { label: "Motivo do despertar", value: row?.motivo_despertar || null },
    { label: "Próximo despertar", value: fmtProximo(row?.proximo_despertar_previsto) },
  ];

  return (
    <div className="fixed inset-0 z-[55] pointer-events-none">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute right-3 top-12 md:left-[182px] md:right-auto w-[250px] max-h-[70vh] overflow-y-auto pointer-events-auto bg-card/95 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl p-3 dark:bg-card/90">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-1.5">
            {isSleep ? <Moon className="w-3.5 h-3.5 text-amber-500" /> : <Zap className="w-3.5 h-3.5 text-primary" />}
            <span className="text-[11px] font-bold text-foreground">Energia da Estação</span>
          </div>
          <button onClick={onClose} className="p-0.5 rounded-md hover:bg-muted transition-colors">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>

        {/* Estado atual */}
        {isCollecting && (
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-2 mb-2">
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
              ESTAÇÃO ATIVA - Coletando dados
            </p>
          </div>
        )}
        {isSleep && (
          <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 px-2.5 py-2 mb-2">
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 leading-tight">
              MODO ECONOMIA - Deep Sleep
            </p>
          </div>
        )}
        {!isCollecting && !isSleep && (
          <div className="rounded-xl bg-muted/40 px-2.5 py-2 mb-2">
            <p className="text-[11px] font-semibold text-muted-foreground leading-tight">
              Sem informação de energia {estado ? `(${estado})` : "ainda"}
            </p>
          </div>
        )}

        {/* Detalhes do ciclo */}
        <div className="space-y-1">
          {items.map((it) => (
            <div
              key={it.label}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 bg-muted/30"
            >
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{it.label}</span>
              <span className={`text-[11px] font-semibold text-right ${it.value ? "text-foreground" : "text-muted-foreground/50"}`}>
                {it.value ?? "--"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}