import React from "react";
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import ResponsiveSelect from "@/components/shared/ResponsiveSelect";

export default function StationSelect({ label, value, onChange, stations }) {
  return (
    <div className="flex-1 min-w-[180px]">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <ResponsiveSelect value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione a estação" />
        </SelectTrigger>
        <SelectContent>
          {stations.map(s => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </ResponsiveSelect>
    </div>
  );
}