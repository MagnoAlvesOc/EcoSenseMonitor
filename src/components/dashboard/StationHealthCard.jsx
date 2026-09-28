import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, WifiOff, Clock, Globe } from "lucide-react";
import moment from "moment";

export default function StationHealthCard({ latestReading }) {
  const lastTimestamp = latestReading?.timestamp_recebimento;
  const minutesAgo = lastTimestamp ? moment().diff(moment(lastTimestamp), "minutes") : null;
  const isOnline = minutesAgo !== null && minutesAgo < 10;
  const ip = latestReading?.ip_local_estacao || "—";

  return (
    <Card className="border-none shadow-lg bg-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Saúde da Estação</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
            isOnline 
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
              : "bg-red-500/15 text-red-600 dark:text-red-400"
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? "bg-emerald-500" : "bg-red-500"}`} />
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            {isOnline ? <Wifi className="w-5 h-5 text-emerald-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-semibold">{isOnline ? "Conectada" : "Desconectada"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">IP Estação</p>
              <p className="text-sm font-semibold font-mono">{ip}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Última Sync</p>
              <p className="text-sm font-semibold">
                {lastTimestamp ? moment(lastTimestamp).fromNow() : "Sem dados"}
              </p>
            </div>
          </div>
        </div>

        {!isOnline && lastTimestamp && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              ⚠ Falha de comunicação — a estação não envia dados há {minutesAgo} minutos. Verifique a alimentação e conexão WiFi do ESP32.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}