import { useEffect, useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Download,
  RotateCcw,
  Sparkles,
  Wand2,
  Share2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { StoryForm } from "@/components/StoryForm";
import { PreviewFrame, PlaceholderFrame } from "@/components/PreviewFrame";
import {
  StoryPreview,
  type StoryData,
  type PriceRow,
} from "@/components/StoryPreview";
import { useGoldPrice } from "@/hooks/useGoldPrice";
import { sharePNG, downloadPNG, canShareFiles } from "@/lib/share";

const STORAGE_KEY = "pohon-emas:data";

const todayISO = () => new Date().toISOString().slice(0, 10);

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const defaultRows = (): PriceRow[] =>
  [
    ["0.5", "gram", ""],
    ["1", "gram", ""],
    ["2", "gram", ""],
    ["3", "gram", ""],
    ["5", "gram", ""],
    ["10", "gram", ""],
  ].map(([weight, unit, price]) => ({ id: newId(), weight, unit, price }));

const defaultData = (): StoryData => ({
  logo: "",
  brandName: "Pohon Emas",
  subBrand: "Camilla",
  city: "Bandung",
  whatsapp: "",
  title: "Pricelist Pohon Emas",
  productType: "Logam Mulia Antam Redmark",
  date: todayISO(),
  movementValue: "",
  movementDirection: "down",
  priceNote: "Buyback di atas pasaran. Chat untuk detail.",
  disclaimer: "*Harga sewaktu-waktu bisa berubah",
  rows: defaultRows(),
});

const loadFromStorage = (): StoryData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoryData>;
    return { ...defaultData(), ...parsed, date: parsed.date || todayISO() };
  } catch {
    return null;
  }
};

const Index = () => {
  const [data, setData] = useState<StoryData>(
    () => loadFromStorage() ?? defaultData(),
  );
  const [previewData, setPreviewData] = useState<StoryData | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const { fetchAndFill, loading: loadingPrice } = useGoldPrice();

  // Auto-save
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data]);

  const validRowCount = data.rows.filter(
    (r) => r.weight.trim() && r.price.trim(),
  ).length;
  const canGenerate = validRowCount > 0;

  const handleGenerate = () => {
    if (!canGenerate) {
      toast.error("Tambahkan minimal 1 baris harga.");
      return;
    }
    setPreviewData(structuredClone(data));
    toast.success("Story berhasil di-generate!");
  };

  /**
   * Render preview ke PNG data URL (1080x1920).
   * Dipakai bersama oleh download dan share.
   */
  const renderToPNG = useCallback(async (): Promise<string | null> => {
    if (!previewData) {
      toast.error("Klik Generate Story dulu.");
      return null;
    }
    const node = exportRef.current;
    if (!node) {
      toast.error("Canvas belum siap, coba lagi.");
      return null;
    }
    return await toPng(node, {
      width: 1080,
      height: 1920,
      canvasWidth: 1080,
      canvasHeight: 1920,
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#F2EBDD",
    });
  }, [previewData]);

  const buildFilename = useCallback(() => {
    const safe = (previewData?.brandName || "pohon-emas")
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase();
    return `${safe}-${previewData?.date || todayISO()}.png`;
  }, [previewData]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const dataUrl = await renderToPNG();
      if (!dataUrl) return;
      downloadPNG(dataUrl, buildFilename());
      toast.success("PNG berhasil diunduh!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh. Coba lagi.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const dataUrl = await renderToPNG();
      if (!dataUrl) return;
      const shared = await sharePNG({
        dataUrl,
        filename: buildFilename(),
        title: previewData?.title || "Harga Emas Hari Ini",
        text: `${previewData?.title || "Harga Emas"} — ${previewData?.productType || ""}`,
      });
      if (shared) {
        toast.success("Berhasil dibagikan!");
      } else {
        // Fallback: download + tip user
        downloadPNG(dataUrl, buildFilename());
        toast("PNG diunduh — silakan attach manual ke WhatsApp.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal share. Coba download saja.");
    } finally {
      setSharing(false);
    }
  };

  const handleAutoFillPrice = async () => {
    const result = await fetchAndFill();
    if (!result) {
      toast.error("Gagal mengambil harga.");
      return;
    }
    setData((prev) => ({ ...prev, rows: result.rows }));
    toast.success(`Harga dari ${result.data.source} berhasil diisi!`);
  };

  const handleReset = () => {
    const fresh = defaultData();
    setData(fresh);
    setPreviewData(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    toast.success("Data direset.");
  };

  const showShareButton = canShareFiles();

  return (
    <main className="min-h-screen">
      <header className="border-b border-border/60 backdrop-blur-sm bg-background/70 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center shadow-gold shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-xl sm:text-2xl font-semibold leading-none truncate">
                Pohon Emas
              </h1>
              <p className="text-[11px] text-muted-foreground mt-1 hidden sm:block">
                Story harga emas elegan dalam 30 detik
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="shrink-0"
          >
            <RotateCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-5 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-6 lg:gap-8 items-start">
          {/* FORM */}
          <Card className="p-5 sm:p-7 shadow-card border-border/60 bg-card/80 backdrop-blur-sm order-1">
            <div className="mb-5 flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold">
                  Detail Story
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Data tersimpan otomatis di perangkat ini.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoFillPrice}
                disabled={loadingPrice}
                className="border-primary/40 text-primary hover:bg-primary/5 shrink-0"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loadingPrice ? "animate-spin" : ""}`}
                />
                {loadingPrice ? "Mengambil..." : "Isi Harga Otomatis"}
              </Button>
            </div>

            <StoryForm data={data} onChange={setData} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="h-12 text-base font-semibold bg-gold hover:opacity-90 shadow-gold transition-smooth"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!previewData || downloading}
                variant="outline"
                className="h-12 text-base font-semibold border-primary/40 text-primary hover:bg-primary/5"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloading ? "..." : "Download"}
              </Button>
              {showShareButton && (
                <Button
                  onClick={handleShare}
                  disabled={!previewData || sharing}
                  variant="outline"
                  className="h-12 text-base font-semibold border-primary/40 text-primary hover:bg-primary/5"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {sharing ? "..." : "Bagikan"}
                </Button>
              )}
            </div>
            {!canGenerate && (
              <p className="text-[11px] text-destructive/80 text-center mt-2">
                Tambahkan minimal 1 baris harga.
              </p>
            )}
          </Card>

          {/* PREVIEW */}
          <div className="order-2 flex flex-col items-center w-full min-w-0 lg:sticky lg:top-20">
            <div className="mb-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Pratinjau
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                1080 × 1920 px
              </p>
            </div>

            {previewData ? (
              <PreviewFrame>
                <StoryPreview data={previewData} />
              </PreviewFrame>
            ) : (
              <PlaceholderFrame />
            )}
          </div>
        </div>

        {/* Hidden export canvas (full-resolution) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0,
            pointerEvents: "none",
          }}
        >
          <div
            ref={exportRef}
            style={{ width: 1080, height: 1920, position: "relative" }}
          >
            {previewData && <StoryPreview data={previewData} />}
          </div>
        </div>
      </div>

      <footer className="container mx-auto px-4 py-6 text-center text-[11px] text-muted-foreground">
        Untuk reseller emas Indonesia · Pohon Emas
      </footer>
    </main>
  );
};

export default Index;
