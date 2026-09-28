import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock } from "lucide-react";

const PRESETS = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 168 },
  { label: "30d", hours: 720 },
  { label: "Tudo", hours: 0 },
];

export default function DateRangeSelector({ startDate, endDate, onStartChange, onEndChange, activePreset, onPresetChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {PRESETS.map(p => (
          <Button
            key={p.label}
            variant={activePreset === p.label ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => onPresetChange(p.label, p.hours)}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <Input
          type="datetime-local"
          value={startDate}
          onChange={e => onStartChange(e.target.value)}
          className="h-8 text-xs w-auto"
        />
        <span className="text-muted-foreground">—</span>
        <Input
          type="datetime-local"
          value={endDate}
          onChange={e => onEndChange(e.target.value)}
          className="h-8 text-xs w-auto"
        />
      </div>
    </div>
  );
}