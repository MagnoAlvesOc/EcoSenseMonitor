import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResponsiveSelect from "@/components/shared/ResponsiveSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, AlertTriangle, CheckCircle2, Clock, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

const TIPO_LABELS = {
  calibracao: "Calibração",
  troca_sensor: "Troca de Sensor",
  limpeza: "Limpeza",
  firmware: "Atualiz. Firmware",
  inspecao_geral: "Inspeção Geral",
  outro: "Outro",
};

const STATUS_CONFIG = {
  ok: { label: "OK", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20", Icon: CheckCircle2 },
  pendente: { label: "Pendente", color: "bg-amber-500/15 text-amber-600 border-amber-500/20", Icon: Clock },
  critico: { label: "Crítico", color: "bg-red-500/15 text-red-600 border-red-500/20", Icon: AlertTriangle },
};

const EMPTY = {
  estacao_id: "", tipo: "calibracao", data_realizada: moment().format("YYYY-MM-DD"),
  proxima_revisao: moment().add(6, "months").format("YYYY-MM-DD"),
  tecnico_responsavel: "", status: "ok", sensores_afetados: "", observacoes: "",
};

function getDaysUntil(date) {
  if (!date) return null;
  return moment(date).diff(moment().startOf("day"), "days");
}

function AlertaBadge({ proxima_revisao }) {
  const days = getDaysUntil(proxima_revisao);
  if (days === null) return null;
  if (days < 0) return <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Vencida {Math.abs(days)}d</span>;
  if (days <= 30) return <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Em {days}d</span>;
  return <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Em {days}d</span>;
}

export default function ManutencaoTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [filterEstacao, setFilterEstacao] = useState("all");

  const { data: estacoes = [] } = useQuery({ queryKey: ["estacoes"], queryFn: () => base44.entities.Estacoes.list() });
  const { data: manutencoes = [] } = useQuery({ queryKey: ["manutencoes"], queryFn: () => base44.entities.ManutencaoPreventiva.list("-data_realizada", 500) });

  const create = useMutation({
    mutationFn: (d) => base44.entities.ManutencaoPreventiva.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["manutencoes"] }); setOpen(false); setForm(EMPTY); toast({ title: "Manutenção registrada" }); },
  });

  const update = useMutation({
    mutationFn: ({ id, d }) => base44.entities.ManutencaoPreventiva.update(id, d),
    onMutate: async ({ id, d }) => {
      await qc.cancelQueries({ queryKey: ["manutencoes"] });
      const previous = qc.getQueryData(["manutencoes"]);
      qc.setQueryData(["manutencoes"], (old) => (old || []).map(m => m.id === id ? { ...m, ...d } : m));
      return { previous };
    },
    onError: (_err, _vars, context) => qc.setQueryData(["manutencoes"], context?.previous),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["manutencoes"] }); setOpen(false); setEditingId(null); setForm(EMPTY); toast({ title: "Manutenção atualizada" }); },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.ManutencaoPreventiva.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["manutencoes"] });
      const previous = qc.getQueryData(["manutencoes"]);
      qc.setQueryData(["manutencoes"], (old) => (old || []).filter(m => m.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => qc.setQueryData(["manutencoes"], context?.previous),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["manutencoes"] }),
  });

  const filtered = filterEstacao === "all" ? manutencoes : manutencoes.filter(m => m.estacao_id === filterEstacao);

  // Alertas próximas revisões
  const alertas = manutencoes.filter(m => {
    const d = getDaysUntil(m.proxima_revisao);
    return d !== null && d <= 30;
  }).sort((a, b) => getDaysUntil(a.proxima_revisao) - getDaysUntil(b.proxima_revisao));

  const startEdit = (m) => {
    setEditingId(m.id);
    setForm({
      estacao_id: m.estacao_id || "",
      tipo: m.tipo || "calibracao",
      data_realizada: m.data_realizada ? moment(m.data_realizada).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
      proxima_revisao: m.proxima_revisao ? moment(m.proxima_revisao).format("YYYY-MM-DD") : "",
      tecnico_responsavel: m.tecnico_responsavel || "",
      status: m.status || "ok",
      sensores_afetados: m.sensores_afetados || "",
      observacoes: m.observacoes || "",
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    const est = estacoes.find(e => e.id === form.estacao_id);
    const data = { ...form, estacao_nome: est?.nome || "" };
    if (editingId) update.mutate({ id: editingId, d: data });
    else create.mutate(data);
  };

  return (
    <div className="space-y-4">
      {/* Alertas */}
      {alertas.length > 0 && (
        <GlassCard className="p-4 border-amber-300/50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Revisões Próximas ou Vencidas ({alertas.length})</p>
          </div>
          <div className="space-y-2">
            {alertas.map(m => (
              <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-amber-500/5 border border-amber-200">
                <div>
                  <span className="text-sm font-semibold">{m.estacao_nome}</span>
                  <span className="text-xs text-muted-foreground ml-2">— {TIPO_LABELS[m.tipo]}</span>
                </div>
                <AlertaBadge proxima_revisao={m.proxima_revisao} />
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Total Registros</p><p className="text-2xl font-bold">{manutencoes.length}</p></GlassCard>
        <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Críticos</p><p className="text-2xl font-bold text-red-500">{manutencoes.filter(m => m.status === "critico").length}</p></GlassCard>
        <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Pendentes</p><p className="text-2xl font-bold text-amber-500">{manutencoes.filter(m => m.status === "pendente").length}</p></GlassCard>
      </div>

      {/* List */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <ResponsiveSelect value={filterEstacao} onValueChange={setFilterEstacao}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Filtrar estação" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as estações</SelectItem>
              {estacoes.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
            </SelectContent>
          </ResponsiveSelect>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o && !editingId) setForm(EMPTY); if (!o) setEditingId(null); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Registrar Manutenção</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? "Editar Manutenção Preventiva" : "Registrar Manutenção Preventiva"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Estação</Label>
                  <ResponsiveSelect value={form.estacao_id} onValueChange={v => setForm({ ...form, estacao_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar estação" /></SelectTrigger>
                    <SelectContent>{estacoes.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
                  </ResponsiveSelect>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <ResponsiveSelect value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(TIPO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </ResponsiveSelect>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <ResponsiveSelect value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ok">OK</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="critico">Crítico</SelectItem>
                      </SelectContent>
                    </ResponsiveSelect>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Data Realizada</Label><Input type="date" value={form.data_realizada} onChange={e => setForm({ ...form, data_realizada: e.target.value })} /></div>
                  <div><Label>Próxima Revisão</Label><Input type="date" value={form.proxima_revisao} onChange={e => setForm({ ...form, proxima_revisao: e.target.value })} /></div>
                </div>
                <div><Label>Técnico Responsável</Label><Input value={form.tecnico_responsavel} onChange={e => setForm({ ...form, tecnico_responsavel: e.target.value })} /></div>
                <div><Label>Sensores Afetados</Label><Input value={form.sensores_afetados} onChange={e => setForm({ ...form, sensores_afetados: e.target.value })} placeholder="DHT22, BMP280, MQ-135..." /></div>
                <div><Label>Observações</Label><Input value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
                <Button className="w-full" onClick={handleSubmit} disabled={!form.estacao_id || create.isPending || update.isPending}>{editingId ? "Salvar Alterações" : "Salvar"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Nenhuma manutenção registrada</p>
          ) : filtered.map(m => {
            const sc = STATUS_CONFIG[m.status] || STATUS_CONFIG.ok;
            const Icon = sc.Icon;
            return (
              <div key={m.id} className="flex items-start justify-between p-3 rounded-xl bg-muted/40 gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: m.status === "ok" ? "#10b981" : m.status === "pendente" ? "#f59e0b" : "#ef4444" }} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-bold">{m.estacao_nome}</span>
                      <Badge variant="outline" className={sc.color}>{sc.label}</Badge>
                      <Badge variant="outline" className="text-[10px]">{TIPO_LABELS[m.tipo]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Realizada: {moment(m.data_realizada).format("DD/MM/YYYY")}
                      {m.tecnico_responsavel && ` • ${m.tecnico_responsavel}`}
                      {m.sensores_afetados && ` • ${m.sensores_afetados}`}
                    </p>
                    {m.observacoes && <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.observacoes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <AlertaBadge proxima_revisao={m.proxima_revisao} />
                  <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => startEdit(m)} title="Editar manutenção">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => remove.mutate(m.id)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}