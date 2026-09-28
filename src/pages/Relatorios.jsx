import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import DateRangeSelector from "../components/shared/DateRangeSelector";
import moment from "moment";
import { useExternalIoT, filterByRange, safeNum, fmt, getTs, ONLINE_THRESHOLD_S } from "@/lib/useExternalIoT";
import * as XLSX from "xlsx";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

export default function Relatorios() {
  const [activePreset, setActivePreset] = useState("Tudo");
  const [startDate, setStartDate] = useState("2000-01-01T00:00");
  const [endDate, setEndDate] = useState(moment().add(1, "day").format("YYYY-MM-DDTHH:mm"));

  const { data: allData = [], isLoading } = useExternalIoT();

  const latest = allData[0];
  const latestTs = latest ? getTs(latest) : null;
  const secsSince = latestTs ? (Date.now() - latestTs) / 1000 : null;
  const isOnline = secsSince !== null && secsSince < ONLINE_THRESHOLD_S;

  const filteredData = useMemo(() => filterByRange(allData, startDate, endDate), [allData, startDate, endDate]);

  const handlePreset = (label, hours) => {
    setActivePreset(label);
    if (hours === 0) {
      // "Tudo": exibe todos os registros já existentes na tabela, mesmo antigos
      setStartDate("2000-01-01T00:00");
      setEndDate(moment().add(1, "day").format("YYYY-MM-DDTHH:mm"));
      return;
    }
    setStartDate(moment().subtract(hours, "hours").format("YYYY-MM-DDTHH:mm"));
    setEndDate(moment().format("YYYY-MM-DDTHH:mm"));
  };

  const exportCSV = () => {
    if (!filteredData.length) return;
    const headers = "Data/Hora,Estação,Temperatura(°C),Umidade(%),Pressão(hPa),Altitude(m),UV,CO2(ppm),Bateria(V),RSSI(dBm),Latitude,Longitude,GPS Fix,Local de Coleta,IP\n";
    const rows = filteredData.map(r => {
      const ts = moment(getTs(r)).format("YYYY-MM-DD HH:mm:ss");
      return `${ts},${r.estacao_id || ""},${safeNum(r.temperatura_c) ?? ""},${safeNum(r.umidade_relativa_perc) ?? ""},${safeNum(r.pressao_atmosferica_hpa) ?? ""},${safeNum(r.altitude_m) ?? ""},${safeNum(r.indice_uv) ?? ""},${safeNum(r.nivel_co2) ?? ""},${safeNum(r.status_bateria_v) ?? ""},${safeNum(r.rssi) ?? ""},${safeNum(r.latitude) ?? ""},${safeNum(r.longitude) ?? ""},${r.gps_fix ? "sim" : "não"},${r.local_coleta || ""},${r.ip_local_estacao || ""}`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historico_${moment().format("YYYYMMDD_HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    if (!filteredData.length) return;
    const rows = filteredData.map(r => ({
      "Data/Hora": moment(getTs(r)).format("YYYY-MM-DD HH:mm:ss"),
      "Estação": r.estacao_nome || r.estacao_id || "",
      "Temperatura (°C)": safeNum(r.temperatura_c) ?? "",
      "Umidade (%)": safeNum(r.umidade_relativa_perc) ?? "",
      "Pressão (hPa)": safeNum(r.pressao_atmosferica_hpa) ?? "",
      "Altitude (m)": safeNum(r.altitude_m) ?? "",
      "Índice UV": safeNum(r.indice_uv) ?? "",
      "CO2 (ppm)": safeNum(r.nivel_co2) ?? "",
      "Bateria (V)": safeNum(r.status_bateria_v) ?? "",
      "RSSI (dBm)": safeNum(r.rssi) ?? "",
      "Latitude": safeNum(r.latitude) ?? "",
      "Longitude": safeNum(r.longitude) ?? "",
      "GPS Fix": r.gps_fix ? "sim" : "não",
      "Local de Coleta": r.local_coleta || "",
      "IP": r.ip_local_estacao || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leituras");
    XLSX.writeFile(wb, `historico_${moment().format("YYYYMMDD_HHmm")}.xlsx`);
  };

  const exportTXT = () => {
    const text = filteredData.map(r =>
      `[${moment(getTs(r)).format("DD/MM/YYYY HH:mm:ss")}] T:${fmt(r.temperatura_c)}°C | U:${fmt(r.umidade_relativa_perc)}% | P:${fmt(r.pressao_atmosferica_hpa, 1)}hPa | Alt:${fmt(r.altitude_m)}m | RSSI:${fmt(r.rssi, 0)}dBm`
    ).join("\n");
    const header = `Relatório EcoSenseIoT\nPeríodo: ${moment(startDate).format("DD/MM/YYYY HH:mm")} - ${moment(endDate).format("DD/MM/YYYY HH:mm")}\nTotal de registros: ${filteredData.length}\nStatus atual: ${isOnline ? "ONLINE" : "OFFLINE"}\n\n`;
    const blob = new Blob([header + text], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_${moment().format("YYYYMMDD_HHmm")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-5xl pointer-events-auto">
      {/* Header */}
      <GlassCard className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Relatórios</h1>
          <p className="text-xs text-muted-foreground">Dados históricos reais — histórico preservado mesmo offline</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCSV} size="sm" disabled={!filteredData.length}>
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" onClick={exportExcel} size="sm" disabled={!filteredData.length} className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
            <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
          </Button>
          <Button variant="outline" onClick={exportTXT} size="sm" disabled={!filteredData.length}>
            <FileText className="w-4 h-4 mr-1" /> TXT
          </Button>
        </div>
      </GlassCard>

      {/* Status banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Status</p>
          <p className={`text-lg font-bold ${isOnline ? "text-emerald-500" : "text-red-500"}`}>
            {latestTs ? (isOnline ? "ONLINE" : "OFFLINE") : "—"}
          </p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Última leitura</p>
          <p className="text-sm font-bold">{latestTs ? moment(latestTs).format("HH:mm:ss") : "—"}</p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Tempo offline</p>
          <p className="text-sm font-bold">
            {secsSince !== null && !isOnline
              ? secsSince < 60 ? `${Math.round(secsSince)}s` : `${Math.round(secsSince / 60)}min`
              : isOnline ? "—" : "—"}
          </p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Registros no período</p>
          <p className="text-lg font-bold">{filteredData.length}</p>
        </GlassCard>
      </div>

      {/* Date filter */}
      <GlassCard className="p-4">
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          activePreset={activePreset}
          onPresetChange={handlePreset}
        />
      </GlassCard>

      {/* Table */}
      <GlassCard className="p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Histórico ({filteredData.length} registros)
          {!isOnline && latestTs && (
            <span className="ml-2 text-amber-500">• Estação offline — histórico preservado</span>
          )}
        </p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Estação</TableHead>
                <TableHead>Temp (°C)</TableHead>
                <TableHead>Umid (%)</TableHead>
                <TableHead>Pressão (hPa)</TableHead>
                <TableHead>Alt (m)</TableHead>
                <TableHead>UV</TableHead>
                <TableHead>CO₂</TableHead>
                <TableHead>Bat (V)</TableHead>
                <TableHead>GPS</TableHead>
                <TableHead>RSSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(11).fill(0).map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded w-16" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground py-12">
                    Sem dados no período selecionado
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.slice(0, 300).map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-mono">{moment(getTs(r)).format("DD/MM HH:mm:ss")}</TableCell>
                    <TableCell className="text-xs">{r.estacao_nome || r.estacao_id || "—"}</TableCell>
                    <TableCell>{fmt(r.temperatura_c)}</TableCell>
                    <TableCell>{fmt(r.umidade_relativa_perc)}</TableCell>
                    <TableCell>{fmt(r.pressao_atmosferica_hpa, 2)}</TableCell>
                    <TableCell>{fmt(r.altitude_m, 1)}</TableCell>
                    <TableCell>{fmt(r.indice_uv, 1)}</TableCell>
                    <TableCell>{fmt(r.nivel_co2, 0)}</TableCell>
                    <TableCell>{fmt(r.status_bateria_v, 2)}</TableCell>
                    <TableCell className="text-xs font-mono">
                      {safeNum(r.latitude) !== null && safeNum(r.longitude) !== null
                        ? `${safeNum(r.latitude).toFixed(4)}, ${safeNum(r.longitude).toFixed(4)}${r.gps_fix ? " 🛰️" : ""}`
                        : "—"}
                    </TableCell>
                    <TableCell className={safeNum(r.rssi) !== null && safeNum(r.rssi) < -70 ? "text-amber-500 font-semibold" : ""}>{fmt(r.rssi, 0)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {filteredData.length > 300 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Exibindo 300 de {filteredData.length}. Exporte CSV para ver todos.
          </p>
        )}
      </GlassCard>
    </div>
  );
}