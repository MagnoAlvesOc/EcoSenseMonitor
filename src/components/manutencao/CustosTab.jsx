import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

const TIPO_COLORS = {
  peca: "bg-blue-500/15 text-blue-600 border-blue-500/20",
  tecnico: "bg-violet-500/15 text-violet-600 border-violet-500/20",
  transporte: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  equipamento: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  outro: "bg-gray-500/15 text-gray-600 border-gray-500/20",
};

const EMPTY = { estacao_id: "", tipo: "peca", descricao: "", valor: "", data: moment().format("YYYY-MM-DD"), fornecedor: "", nota_fiscal: "", observacoes: "" };

export default function CustosTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [filterEstacao, setFilterEstacao] = useState("all");

  const { data: estacoes = [] } = useQuery({ queryKey: ["estacoes"], queryFn: () => base44.entities.Estacoes.list() });
  const { data: custos = [] } = useQuery({ queryKey: ["custos"], queryFn: () => base44.entities.CustoManutencao.list("-data", 500) });

  const create = useMutation({
    mutationFn: (d) => base44.entities.CustoManutencao.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["custos"] }); setOpen(false); setForm(EMPTY); toast({ title: "Custo registrado" }); },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.CustoManutencao.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["custos"] }),
  });

  const filtered = filterEstacao === "all" ? custos : custos.filter(c => c.estacao_id === filterEstacao);
  const totalGeral = custos.reduce((s, c) => s + (c.valor || 0), 0);
  const totalFiltrado = filtered.reduce((s, c) => s + (c.valor || 0), 0);

  const custosPorEstacao = estacoes.map(e => ({
    ...e,
    total: custos.filter(c => c.estacao_id === e.id).reduce((s, c) => s + (c.valor || 0), 0),
  })).sort((a, b) => b.total - a.total);

  const handleSubmit = () => {
    const est = estacoes.find(e => e.id === form.estacao_id);
    create.mutate({ ...form, valor: parseFloat(form.valor), estacao_nome: est?.nome || "" });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Custo Total</p>
          <p className="text-2xl font-bold">R$ {totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Registros</p>
          <p className="text-2xl font-bold">{custos.length}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Estações</p>
          <p className="text-2xl font-bold">{estacoes.length}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Custo Médio/Estação</p>
          <p className="text-2xl font-bold">R$ {estacoes.length ? (totalGeral / estacoes.length).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "0,00"}</p>
        </GlassCard>
      </div>

      {/* Ranking por estação */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custo por Estação</p>
        </div>
        <div className="space-y-2">
          {custosPorEstacao.map(e => {
            const pct = totalGeral > 0 ? (e.total / totalGeral) * 100 : 0;
            return (
              <div key={e.id} className="flex items-center gap-3">
                <span className="text-xs w-32 truncate text-muted-foreground">{e.nome}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-2 bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-bold w-24 text-right">R$ {e.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            );
          })}
          {custosPorEstacao.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Nenhum custo registrado</p>}
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Select value={filterEstacao} onValueChange={setFilterEstacao}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue placeholder="Filtrar estação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as estações</SelectItem>
                {estacoes.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">Total: R$ {totalFiltrado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Registrar Custo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar Custo de Manutenção</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Estação</Label>
                  <Select value={form.estacao_id} onValueChange={v => setForm({ ...form, estacao_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar estação" /></SelectTrigger>
                    <SelectContent>{estacoes.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="peca">Peça</SelectItem>
                        <SelectItem value="tecnico">Técnico</SelectItem>
                        <SelectItem value="transporte">Transporte</SelectItem>
                        <SelectItem value="equipamento">Equipamento</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Valor (R$)</Label>
                    <Input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição do gasto" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Data</Label><Input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></div>
                  <div><Label>Fornecedor</Label><Input value={form.fornecedor} onChange={e => setForm({ ...form, fornecedor: e.target.value })} /></div>
                </div>
                <div><Label>Nota Fiscal</Label><Input value={form.nota_fiscal} onChange={e => setForm({ ...form, nota_fiscal: e.target.value })} /></div>
                <Button className="w-full" onClick={handleSubmit} disabled={!form.estacao_id || !form.valor || create.isPending}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Estação</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">Nenhum custo registrado</TableCell></TableRow>
              ) : filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="text-xs">{moment(c.data).format("DD/MM/YYYY")}</TableCell>
                  <TableCell className="text-sm font-medium">{c.estacao_nome}</TableCell>
                  <TableCell><Badge variant="outline" className={TIPO_COLORS[c.tipo]}>{c.tipo}</Badge></TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{c.descricao || "—"}</TableCell>
                  <TableCell className="text-sm">{c.fornecedor || "—"}</TableCell>
                  <TableCell className="text-sm font-bold">R$ {(c.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove.mutate(c.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlassCard>
    </div>
  );
}