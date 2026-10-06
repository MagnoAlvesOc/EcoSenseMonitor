import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResponsiveSelect from "@/components/shared/ResponsiveSelect";
import { Activity, AlertCircle, Info, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import moment from "moment";
import { useExternalIoT, generateLogs, getTs } from "@/lib/useExternalIoT";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

const severityConfig = {
  info:    { color: "bg-blue-500/15 text-blue-600 border-blue-500/20", icon: Info },
  aviso:   { color: "bg-amber-500/15 text-amber-600 border-amber-500/20", icon: AlertTriangle },
  erro:    { color: "bg-red-500/15 text-red-600 border-red-500/20", icon: AlertCircle },
  critico: { color: "bg-red-700/15 text-red-700 border-red-700/20", icon: AlertCircle },
};

const tipoIcon = {
  "ONLINE": Wifi,
  "OFFLINE": WifiOff,
  "LACUNA DE COLETA": AlertTriangle,
  "ERRO SENSOR": AlertCircle,
  "FRACO SINAL": AlertTriangle,
};

export default function SystemLogsPage() {
  const [filter, setFilter] = useState("all");

  const { data: allData = [], isLoading } = useExternalIoT();

  const logs = useMemo(() => generateLogs(allData), [allData]);

  const filteredLogs = useMemo(() => {
    if (filter === "all") return logs;
    return logs.filter(l => l.severidade === filter);
  }, [logs, filter]);

  const latest = allData[0];
  const latestTs = latest ? getTs(latest) : null;
  const isOnline = latestTs ? (Date.now() - latestTs) / 1000 < 90 : false;
  const secsSince = latestTs ? (Date.now() - latestTs) / 1000 : null;

  const stats = {
    total: logs.length,
    criticos: logs.filter(l => l.severidade === "critico").length,
    erros: logs.filter(l => l.severidade === "erro").length,
    avisos: logs.filter(l => l.severidade === "aviso").length,
    info: logs.filter(l => l.severidade === "info").length,
  };

  return (
    <div className="space-y-4 max-w-5xl pointer-events-auto">
      <GlassCard className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Logs do Sistema</h1>
          <p className="text-xs text-muted-foreground">Logs automáticos gerados com base na API em tempo real</p>
        </div>
        <ResponsiveSelect value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="aviso">Avisos</SelectItem>
            <SelectItem value="erro">Erros</SelectItem>
            <SelectItem value="critico">Críticos</SelectItem>
          </SelectContent>
        </ResponsiveSelect>
      </GlassCard>

      {/* Status atual */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Status</p>
          <p className={`text-lg font-bold ${isOnline ? "text-emerald-500" : "text-red-500"}`}>
            {latestTs ? (isOnline ? "ONLINE" : "OFFLINE") : "—"}
          </p>
          {!isOnline && secsSince !== null && (
            <p className="text-[10px] text-red-400">
              há {secsSince < 60 ? `${Math.round(secsSince)}s` : `${Math.round(secsSince / 60)}min`}
            </p>
          )}
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Última leitura</p>
          <p className="text-sm font-bold">{latestTs ? moment(latestTs).format("HH:mm:ss") : "—"}</p>
          <p className="text-[10px] text-muted-foreground">{latestTs ? moment(latestTs).format("DD/MM/YYYY") : ""}</p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Erros/Críticos</p>
          <p className="text-lg font-bold text-red-500">{stats.criticos + stats.erros}</p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Avisos</p>
          <p className="text-lg font-bold text-amber-500">{stats.avisos}</p>
        </GlassCard>
      </div>

      {/* Log table */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Eventos ({filteredLogs.length})
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estação</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">Nenhum evento encontrado</TableCell>
                </TableRow>
              ) : (
                filteredLogs.map(log => {
                  const cfg = severityConfig[log.severidade] || severityConfig.info;
                  const Icon = tipoIcon[log.tipo] || Info;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs font-mono whitespace-nowrap">
                        {log.timestamp ? moment(log.timestamp).format("DD/MM HH:mm:ss") : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cfg.color}>{log.severidade}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="flex items-center gap-1">
                          <Icon className="w-3 h-3 flex-shrink-0" />
                          {log.tipo}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{log.estacao_nome || "—"}</TableCell>
                      <TableCell className="text-xs max-w-xs">{log.mensagem}</TableCell>
                      <TableCell className="text-xs font-mono">{log.ip_origem || "—"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </GlassCard>
    </div>
  );
}