import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  Trash2,
  GripVertical,
  Copy,
  ChevronDown,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { StoryData, PriceRow } from "./StoryPreview";

interface Props {
  data: StoryData;
  onChange: (data: StoryData) => void;
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const formatThousand = (v: string) =>
  v ? v.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";

const PRODUCT_SUGGESTIONS = [
  "Antam Redmark",
  "Antam Non Redmark",
  "Antam Retro",
  "UBS Gold",
  "Galeri24",
];

const UNITS = ["gram", "kg", "oz"];

export const StoryForm = ({ data, onChange }: Props) => {
  const update = <K extends keyof StoryData>(key: K, value: StoryData[K]) =>
    onChange({ ...data, [key]: value });

  const updateRow = (id: string, patch: Partial<PriceRow>) =>
    update(
      "rows",
      data.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );

  const removeRow = (id: string) => {
    const removed = data.rows.find((r) => r.id === id);
    const idx = data.rows.findIndex((r) => r.id === id);
    update(
      "rows",
      data.rows.filter((r) => r.id !== id),
    );
    if (removed) {
      toast("Baris dihapus", {
        action: {
          label: "Urungkan",
          onClick: () => {
            const next = [...data.rows];
            // re-insert
            const without = next.filter((r) => r.id !== id);
            without.splice(idx, 0, removed);
            update("rows", without);
          },
        },
      });
    }
  };

  const duplicateRow = (id: string) => {
    const idx = data.rows.findIndex((r) => r.id === id);
    if (idx < 0) return;
    const copy: PriceRow = { ...data.rows[idx], id: newId() };
    const next = [...data.rows];
    next.splice(idx + 1, 0, copy);
    update("rows", next);
  };

  const addRow = (weight = "", unit = "gram") => {
    update("rows", [...data.rows, { id: newId(), weight, unit, price: "" }]);
  };

  const handlePrice = (id: string, value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    updateRow(id, { price: digits });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = data.rows.findIndex((r) => r.id === active.id);
    const newIdx = data.rows.findIndex((r) => r.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    update("rows", arrayMove(data.rows, oldIdx, newIdx));
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1 — Quick Setup */}
      <section className="space-y-4">
        <h3 className="font-serif text-lg font-semibold">Quick Setup</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productType">Produk</Label>
            <Select
              value={data.productType}
              onValueChange={(v) => update("productType", v)}
            >
              <SelectTrigger id="productType" className="w-full truncate-none">
                <SelectValue placeholder="Pilih produk" className="whitespace-normal" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_SUGGESTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="whitespace-normal">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={data.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </div>
        </div>

        {/* Movement price */}
        <div className="grid grid-cols-[auto_1fr] gap-3 items-end">
          <div className="space-y-2">
            <Label>Pergerakan</Label>
            <div className="flex rounded-md border border-input overflow-hidden">
              <button
                type="button"
                onClick={() => update("movementDirection", "up")}
                className={`px-3 h-10 flex items-center gap-1 text-sm transition-colors ${
                  data.movementDirection === "up"
                    ? "bg-[hsl(var(--story-up))] text-white"
                    : "bg-background hover:bg-muted"
                }`}
                aria-label="Naik"
              >
                <TrendingUp className="w-4 h-4" /> Naik
              </button>
              <button
                type="button"
                onClick={() => update("movementDirection", "down")}
                className={`px-3 h-10 flex items-center gap-1 text-sm border-l border-input transition-colors ${
                  data.movementDirection === "down"
                    ? "bg-[hsl(var(--story-down))] text-white"
                    : "bg-background hover:bg-muted"
                }`}
                aria-label="Turun"
              >
                <TrendingDown className="w-4 h-4" /> Turun
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="movementValue">Nilai (kosongkan jika tidak ada)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                Rp
              </span>
              <Input
                id="movementValue"
                inputMode="numeric"
                placeholder="25.000"
                className="pl-9"
                value={formatThousand(data.movementValue)}
                onChange={(e) =>
                  update(
                    "movementValue",
                    e.target.value.replace(/\D/g, "").slice(0, 12),
                  )
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Price Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold">Daftar Harga</h3>
          <span className="text-xs text-muted-foreground">
            {data.rows.length} baris
          </span>
        </div>

        <div className="grid grid-cols-[auto_1fr_auto_1.4fr_auto] gap-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="w-6" />
          <span>Berat</span>
          <span>Unit</span>
          <span>Harga</span>
          <span className="w-[68px]" />
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={data.rows.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {data.rows.map((row, i) => (
                <SortableRow
                  key={row.id}
                  row={row}
                  isLast={i === data.rows.length - 1}
                  onWeight={(v) => updateRow(row.id, { weight: v })}
                  onUnit={(v) => updateRow(row.id, { unit: v })}
                  onPrice={(v) => handlePrice(row.id, v)}
                  onDelete={() => removeRow(row.id)}
                  onDuplicate={() => duplicateRow(row.id)}
                  onEnter={() => addRow()}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Quick add chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[0.5, 1, 2, 5, 10].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => addRow(String(w), "gram")}
              className="text-xs px-3 h-8 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
            >
              + {w} gr
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => addRow()}
          className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Baris
        </Button>
      </section>

      {/* SECTION 3 — Contact */}
      <section className="space-y-4">
        <h3 className="font-serif text-lg font-semibold">Kontak</h3>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">
            WhatsApp <span className="text-destructive">*</span>
          </Label>
          <Input
            id="whatsapp"
            placeholder="+62 812 3456 7890"
            value={data.whatsapp}
            maxLength={25}
            onChange={(e) => update("whatsapp", e.target.value)}
            className={!data.whatsapp.trim() ? "ring-1 ring-destructive/40" : ""}
          />
        </div>
      </section>

      {/* SECTION 4 — Brand Settings (collapsible) */}
      <Collapsible className="border border-border/60 rounded-lg">
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 rounded-lg [&[data-state=open]>svg]:rotate-180">
          <span className="font-serif text-base">Pengaturan Brand</span>
          <ChevronDown className="w-4 h-4 transition-transform" />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo">Logo (opsional)</Label>

            {/* Kotak imbauan PNG transparan */}
            <div className="flex items-start gap-2 rounded-md border border-amber-300/60 bg-amber-50/60 px-3 py-2.5">
              <span className="text-amber-600 mt-0.5 shrink-0">⚠️</span>
              <p className="text-[12px] text-amber-800 leading-snug">
                <span className="font-semibold">Gunakan file PNG dengan background transparan.</span>
                {" "}Logo JPEG atau tanpa transparansi akan memunculkan kotak putih di atas desain.
                Konversi di{" "}
                <span className="underline decoration-dotted">remove.bg</span> jika perlu.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {data.logo && (
                <div className="shrink-0 w-20 h-20 rounded border border-border bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAJElEQVQoU2NkYGD4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==')] bg-repeat flex items-center justify-center">
                  <img
                    src={data.logo}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1 flex items-center gap-2">
                <Input
                  id="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 3 * 1024 * 1024) {
                      toast.error("Logo terlalu besar (maks 3MB).");
                      e.target.value = "";
                      return;
                    }
                    // Peringatkan jika bukan PNG
                    if (file.type !== "image/png" && file.type !== "image/svg+xml") {
                      toast.warning(
                        "Disarankan pakai PNG transparan agar logo tidak punya background putih.",
                        { duration: 5000 }
                      );
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                      update("logo", String(reader.result || ""));
                      e.target.value = "";
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="cursor-pointer"
                />
                {data.logo && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => update("logo", "")}
                  >
                    Hapus
                  </Button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Format: PNG (transparan), SVG, atau JPEG · Maks 3MB
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="brandName">Nama Brand</Label>
            <Input
              id="brandName"
              placeholder="POHON EMAS"
              value={data.brandName}
              maxLength={40}
              onChange={(e) => update("brandName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subBrand">Sub Brand</Label>
            <Input
              id="subBrand"
              placeholder="By Camilla"
              value={data.subBrand}
              maxLength={40}
              onChange={(e) => update("subBrand", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Lokasi</Label>
            <Input
              id="city"
              placeholder="Jakarta"
              value={data.city}
              maxLength={40}
              onChange={(e) => update("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Headline</Label>
            <Input
              id="title"
              placeholder="Harga Emas Hari Ini"
              value={data.title}
              maxLength={50}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* SECTION 5 — Optional Footer */}
      <Collapsible className="border border-border/60 rounded-lg">
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 rounded-lg [&[data-state=open]>svg]:rotate-180">
          <span className="font-serif text-base">Footer (opsional)</span>
          <ChevronDown className="w-4 h-4 transition-transform" />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="priceNote">Catatan Harga</Label>
            <Input
              id="priceNote"
              placeholder="Harga dapat berubah sewaktu-waktu"
              value={data.priceNote}
              maxLength={80}
              onChange={(e) => update("priceNote", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disclaimer">Disclaimer</Label>
            <Textarea
              id="disclaimer"
              placeholder="Disclaimer tambahan"
              value={data.disclaimer}
              maxLength={160}
              rows={2}
              onChange={(e) => update("disclaimer", e.target.value)}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

/* ---------- Sortable row ---------- */

interface SortableRowProps {
  row: PriceRow;
  isLast: boolean;
  onWeight: (v: string) => void;
  onUnit: (v: string) => void;
  onPrice: (v: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnter: () => void;
}

const SortableRow = ({
  row,
  onWeight,
  onUnit,
  onPrice,
  onDelete,
  onDuplicate,
  onEnter,
}: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });
  const priceRef = useRef<HTMLInputElement>(null);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[auto_1fr_auto_1.4fr_auto] gap-2 items-center bg-card/50 rounded-md p-1"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="w-6 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag row"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <Input
        inputMode="decimal"
        placeholder="1"
        value={row.weight}
        maxLength={8}
        onChange={(e) => onWeight(e.target.value)}
      />
      <Select value={row.unit || "gram"} onValueChange={onUnit}>
        <SelectTrigger className="w-[88px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {UNITS.map((u) => (
            <SelectItem key={u} value={u}>
              {u}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          Rp
        </span>
        <Input
          ref={priceRef}
          inputMode="numeric"
          placeholder="1.125.000"
          className="pl-9"
          value={formatThousand(row.price)}
          onChange={(e) => onPrice(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter();
            }
          }}
        />
      </div>
      <div className="flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDuplicate}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Duplikat"
        >
          <Copy className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label="Hapus"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
