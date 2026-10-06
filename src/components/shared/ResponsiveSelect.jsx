import React, { useEffect, useMemo, useState } from "react";
import { ChevronUp, Check } from "lucide-react";
import { Select, SelectItem } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

// Coleta os <SelectItem> aninhados em SelectContent para montar a lista do drawer.
function collectItems(children, acc = []) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === SelectItem) {
      acc.push({ value: child.props.value, label: child.props.children, disabled: child.props.disabled });
    }
    if (child.props && child.props.children != null) collectItems(child.props.children, acc);
  });
  return acc;
}

/**
 * Select responsivo: no desktop renderiza o Select (popover) do Radix;
 * em telas < 768px abre um bottom sheet (vaul Drawer) com as opções,
 * no estilo nativo do iOS. API compatível com o Select do Radix.
 */
export default function ResponsiveSelect({
  value,
  onValueChange,
  defaultValue,
  placeholder,
  children,
  className = "",
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const fn = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const items = useMemo(() => collectItems(children), [children]);
  const current = items.find((i) => i.value === (value ?? defaultValue));

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange} defaultValue={defaultValue}>
        {children}
      </Select>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={`flex items-center justify-between w-full min-h-[44px] px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground ${className}`}
      >
        <span className="truncate text-left">
          {current ? current.label : (placeholder || "Selecionar")}
        </span>
        <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-left text-sm">
              {placeholder || "Selecionar"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-3 pb-[calc(1.5rem_+_env(safe-area-inset-bottom))] max-h-[50vh] overflow-y-auto">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground px-3 py-4">Nenhuma opção</p>
            )}
            {items.map((it) => {
              const selected = it.value === (value ?? defaultValue);
              return (
                <button
                  key={it.value}
                  type="button"
                  disabled={it.disabled}
                  onClick={() => { onValueChange?.(it.value); setOpen(false); }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-3 min-h-[44px] rounded-lg text-left text-sm transition-colors ${
                    selected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted active:bg-muted"
                  }`}
                >
                  <span className="truncate">{it.label}</span>
                  {selected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}