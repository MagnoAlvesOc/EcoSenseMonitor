import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// rows: [{ key, label, unit, avgA, avgB, delta }]
export default function CompareTable({ rows }) {
  const fmtVal = (v, unit) => v !== null ? `${v.toFixed(2)}${unit ? ` ${unit}` : ""}` : "—";
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Variável (média do período)</TableHead>
          <TableHead>Estação A</TableHead>
          <TableHead>Estação B</TableHead>
          <TableHead>Δ (A − B)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(r => (
          <TableRow key={r.key}>
            <TableCell className="font-medium">{r.label} ({r.unit})</TableCell>
            <TableCell>{fmtVal(r.avgA)}</TableCell>
            <TableCell>{fmtVal(r.avgB)}</TableCell>
            <TableCell className={r.delta !== null && Math.abs(r.delta) > 0.01 ? "font-semibold text-amber-500" : "text-muted-foreground"}>
              {r.delta !== null ? `${r.delta > 0 ? "+" : ""}${r.delta.toFixed(2)} ${r.unit}` : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}