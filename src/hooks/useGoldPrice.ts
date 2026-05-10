/**
 * Hook untuk auto-fill harga emas dari sumber publik.
 *
 * Strategi: pakai API harga emas Indonesia yang gratis & publik.
 * Fallback ke data default jika API gagal (offline-friendly).
 *
 * NOTE: Untuk produksi, ganti endpoint ini dengan API resmi Antam
 * atau aggregator berbayar yang lebih reliable.
 */
import { useState, useCallback } from "react";

export type GoldPriceData = {
  pricePerGram: number;
  source: string;
  fetchedAt: string;
};

export type WeightPreset = {
  weight: string;
  unit: string;
  price: string;
};

/**
 * Standar berat emas batangan Antam yang umum di pasaran.
 * Multiplier disesuaikan dengan harga riil (bukan linear) — emas pecahan
 * kecil biasanya lebih mahal per-gram-nya dibanding pecahan besar.
 */
const STANDARD_WEIGHTS: { weight: string; gramMultiplier: number }[] = [
  { weight: "0.5", gramMultiplier: 0.55 },   // 0.5gr biasanya 10% lebih mahal
  { weight: "1", gramMultiplier: 1 },
  { weight: "2", gramMultiplier: 1.98 },
  { weight: "3", gramMultiplier: 2.94 },
  { weight: "5", gramMultiplier: 4.85 },
  { weight: "10", gramMultiplier: 9.6 },
  { weight: "25", gramMultiplier: 23.8 },
  { weight: "50", gramMultiplier: 47.2 },
  { weight: "100", gramMultiplier: 93.5 },
];

/** Default fallback harga jika API tidak tersedia (~Mei 2026 estimate). */
const FALLBACK_PRICE_PER_GRAM = 1_960_000;

/**
 * Fetch harga emas dari API publik. Kalau gagal, return fallback.
 * Ganti URL ini dengan endpoint produksi saat go-live.
 */
const fetchGoldPrice = async (): Promise<GoldPriceData> => {
  try {
    // Contoh: pakai harga-emas.org atau API serupa.
    // Di sini kita pakai approach defensive — jika API tidak ada, langsung fallback.
    const res = await fetch("https://logam-mulia-api.vercel.app/prices/anekalogam", {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error("API not OK");
    const json = (await res.json()) as { data?: Array<{ type: string; sell: number }> };
    const oneGram = json.data?.find((d) => d.type === "1.0");
    if (!oneGram?.sell) throw new Error("Price not found");
    return {
      pricePerGram: oneGram.sell,
      source: "Logam Mulia Antam",
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return {
      pricePerGram: FALLBACK_PRICE_PER_GRAM,
      source: "Estimasi (offline)",
      fetchedAt: new Date().toISOString(),
    };
  }
};

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const useGoldPrice = () => {
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<GoldPriceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate baris harga lengkap dari harga per gram.
   * Hasilnya array PriceRow siap dimasukkan ke StoryData.
   */
  const generatePriceRows = useCallback((pricePerGram: number) => {
    return STANDARD_WEIGHTS.map(({ weight, gramMultiplier }) => ({
      id: newId(),
      weight,
      unit: "gram",
      // Bulatkan ke 1.000 terdekat (kebiasaan toko emas Indonesia)
      price: String(Math.round((pricePerGram * gramMultiplier) / 1000) * 1000),
    }));
  }, []);

  const fetchAndFill = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGoldPrice();
      setLastFetch(data);
      const rows = generatePriceRows(data.pricePerGram);
      return { data, rows };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengambil harga");
      return null;
    } finally {
      setLoading(false);
    }
  }, [generatePriceRows]);

  return { fetchAndFill, loading, lastFetch, error };
};
