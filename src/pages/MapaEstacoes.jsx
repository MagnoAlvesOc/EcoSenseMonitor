import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, MapPin, Wifi, WifiOff, Trash2, Download, Pencil, Crosshair } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import GeoLocateButton from "@/components/stations/GeoLocateButton";
import { useStation } from "@/lib/StationContext";
import useHashDialog from "@/lib/useHashDialog";
import { useExternalIoT, getTs, ONLINE_THRESHOLD_S } from "@/lib/useExternalIoT";
import moment from "moment";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

export default function MapaEstacoes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { clickedCoords, setClickedCoords } = useStation();
  // Diálogos sincronizados com o hash da URL (#dialog-add / #dialog-edit) —
  // o botão voltar do Android fecha o overlay em vez de sair da página
  const [addOpen, openAddDialog, closeAddDialog] = useHashDialog("dialog-add");
  const [editOpen, openEditDialog, closeEditDialog] = useHashDialog("dialog-edit");
  const [editingStation, setEditingStation] = useState(null);
  const [form, setForm] = useState({ nome: "", descricao: "", latitude: "", longitude: "", ip_local: "" });
  const [editForm, setEditForm] = useState({ nome: "", descricao: "", latitude: "", longitude: "", ip_local: "" });

  const { data: estacoes = [] } = useQuery({
    queryKey: ["estacoes"],
    queryFn: () => base44.entities.Estacoes.list(),
  });

  const { data: leituras = [] } = useQuery({
    queryKey: ["leituras-mapa"],
    queryFn: () => base44.entities.HistoricoLeituras.list("-timestamp_recebimento", 100),
    refetchInterval: 60000,
  });

  // Fonte ao vivo (mesma API do mapa) — usada para o status online/offline
  const { data: rawApiData } = useExternalIoT();
  const apiData = rawApiData ?? [];

  const createStation = useMutation({
    mutationFn: (data) => base44.entities.Estacoes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estacoes"] });
      closeAddDialog();
      setForm({ nome: "", descricao: "", latitude: "", longitude: "", ip_local: "" });
      toast({ title: "Estação adicionada" });
    },
  });

  const deleteStation = useMutation({
    mutationFn: (id) => base44.entities.Estacoes.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["estacoes"] });
      const previous = queryClient.getQueryData(["estacoes"]);
      queryClient.setQueryData(["estacoes"], (old) => (old || []).filter(e => e.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => queryClient.setQueryData(["estacoes"], context?.previous),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["estacoes"] }),
  });

  const updateStation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Estacoes.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["estacoes"] });
      const previous = queryClient.getQueryData(["estacoes"]);
      queryClient.setQueryData(["estacoes"], (old) => (old || []).map(e => e.id === id ? { ...e, ...data } : e));
      return { previous };
    },
    onError: (_err, _vars, context) => queryClient.setQueryData(["estacoes"], context?.previous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estacoes"] });
      closeEditDialog();
      toast({ title: "Estação atualizada" });
    },
  });

  const openEdit = (est) => {
    setEditingStation(est);
    setEditForm({ nome: est.nome || "", descricao: est.descricao || "", latitude: est.latitude ?? "", longitude: est.longitude ?? "", ip_local: est.ip_local || "" });
    openEditDialog();
  };

  const getStationStatus = (estacao) => {
    const stationReadings = apiData.filter(r =>
      r.estacao_id === estacao.id ||
      r.estacao_id === estacao.ip_local ||
      r.estacao_nome === estacao.nome ||
      r.ip_local_estacao === estacao.ip_local
    );
    if (!stationReadings.length) return "offline";
    const latest = Math.max(...stationReadings.map(r => getTs(r)));
    return (Date.now() - latest) / 1000 < ONLINE_THRESHOLD_S ? "online" : "offline";
  };

  const handleExportCSV = () => {
    if (!leituras.length) return;
    const headers = "timestamp,estacao_id,temperatura,umidade,pressao,altitude,uv,co2,bateria,ip\n";
    const rows = leituras.map(l =>
      `${l.timestamp_recebimento},${l.estacao_id || ""},${l.temperatura_c || ""},${l.umidade_relativa_perc || ""},${l.pressao_atmosferica_hpa || ""},${l.altitude_m || ""},${l.indice_uv || ""},${l.nivel_co2 || ""},${l.status_bateria_v || ""},${l.ip_local_estacao || ""}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `estacoes_dados_${moment().format("YYYYMMDD_HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-md pointer-events-auto">
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Mapa de Estações</h1>
            <p className="text-xs text-muted-foreground">Clique nos marcadores no mapa</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={openAddDialog}><Plus className="w-4 h-4 mr-1" /> Nova</Button>
            <Dialog open={addOpen} onOpenChange={(o) => (o ? openAddDialog() : closeAddDialog())}>
              <DialogContent>
                <DialogHeader><DialogTitle>Adicionar Estação</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Nome</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Estação Mangue Norte" /></div>
                  <div><Label>Descrição</Label><Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Latitude</Label><Input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} placeholder="-2.5" /></div>
                    <div><Label>Longitude</Label><Input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} placeholder="-44.28" /></div>
                  </div>
                  <GeoLocateButton
                    onLocate={(lat, lng) => setForm(f => ({ ...f, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }))}
                  />
                  {clickedCoords && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => setForm(f => ({ ...f, latitude: clickedCoords.lat.toFixed(6), longitude: clickedCoords.lng.toFixed(6) }))}
                    >
                      <Crosshair className="w-4 h-4 mr-1" />
                      Definir posição da estação aqui ({clickedCoords.lat.toFixed(4)}, {clickedCoords.lng.toFixed(4)})
                    </Button>
                  )}
                  <div><Label>IP / Endpoint da Estação</Label><Input value={form.ip_local} onChange={e => setForm({ ...form, ip_local: e.target.value })} placeholder="192.168.1.50 ou http://..." /></div>
                  <Button
                    className="w-full"
                    onClick={() => createStation.mutate({ ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude), ip_local: form.ip_local })}
                    disabled={!form.nome || !form.latitude || !form.longitude}
                  >
                    Salvar Estação
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Clicked coords banner */}
        {clickedCoords && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                <Crosshair className="w-3 h-3" /> Ponto clicado no mapa
              </span>
              <button onClick={() => setClickedCoords(null)} className="text-blue-400 hover:text-blue-600 text-sm leading-none">×</button>
            </div>
            <p className="text-xs font-mono text-blue-600">
              Lat: <strong>{clickedCoords.lat.toFixed(6)}</strong> &nbsp; Lng: <strong>{clickedCoords.lng.toFixed(6)}</strong>
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estações ({estacoes.length})</p>
          {estacoes.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma estação cadastrada</p>
          )}
          {estacoes.map(est => {
            const status = getStationStatus(est);
            return (
              <div key={est.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{est.nome}</p>
                    <p className="text-xs text-muted-foreground">{est.latitude?.toFixed(4)}, {est.longitude?.toFixed(4)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {status === "online" ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-red-500" />}
                  <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => openEdit(est)}>
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => deleteStation.mutate(est.id)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => (o ? openEditDialog() : closeEditDialog())}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Estação</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome</Label><Input value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} /></div>
            <div><Label>Descrição</Label><Input value={editForm.descricao} onChange={e => setEditForm({ ...editForm, descricao: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Latitude</Label><Input type="number" step="any" value={editForm.latitude} onChange={e => setEditForm({ ...editForm, latitude: e.target.value })} /></div>
              <div><Label>Longitude</Label><Input type="number" step="any" value={editForm.longitude} onChange={e => setEditForm({ ...editForm, longitude: e.target.value })} /></div>
            </div>
            <GeoLocateButton
              onLocate={(lat, lng) => setEditForm(f => ({ ...f, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }))}
            />
            {clickedCoords && (
              <Button
                type="button"
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  setEditForm(f => ({ ...f, latitude: clickedCoords.lat.toFixed(6), longitude: clickedCoords.lng.toFixed(6) }));
                  toast({ title: "Posição atualizada", description: `${clickedCoords.lat.toFixed(6)}, ${clickedCoords.lng.toFixed(6)}` });
                }}
              >
                <Crosshair className="w-4 h-4 mr-1" />
                Definir posição da estação aqui ({clickedCoords.lat.toFixed(4)}, {clickedCoords.lng.toFixed(4)})
              </Button>
            )}
            <div><Label>IP / Endpoint</Label><Input value={editForm.ip_local} onChange={e => setEditForm({ ...editForm, ip_local: e.target.value })} placeholder="192.168.1.50" /></div>
            <Button
              className="w-full"
              onClick={() => updateStation.mutate({ id: editingStation.id, data: { ...editForm, latitude: parseFloat(editForm.latitude), longitude: parseFloat(editForm.longitude) } })}
              disabled={!editForm.nome || updateStation.isPending}
            >
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}