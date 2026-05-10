/**
 * Helper untuk membagikan gambar ke aplikasi lain (WhatsApp, dll).
 *
 * Strategi:
 * 1. Coba Web Share API (modern, native — bisa pilih app tujuan)
 * 2. Fallback: download PNG + buka WhatsApp Web/intent
 *
 * Web Share API butuh HTTPS dan dukungan browser (most mobile browsers OK).
 */

export type ShareOptions = {
  dataUrl: string;
  filename: string;
  title?: string;
  text?: string;
};

/** Convert data URL ke File supaya bisa di-share. */
const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};

/** Cek apakah browser support sharing file via Web Share API. */
export const canShareFiles = (): boolean => {
  if (typeof navigator === "undefined") return false;
  if (!("share" in navigator) || !("canShare" in navigator)) return false;
  // Buat file dummy untuk cek
  try {
    const dummy = new File([""], "test.png", { type: "image/png" });
    return navigator.canShare({ files: [dummy] });
  } catch {
    return false;
  }
};

/**
 * Share gambar ke aplikasi lain. Return true jika berhasil di-share.
 * Throws jika gagal sehingga caller bisa fallback ke download.
 */
export const sharePNG = async ({ dataUrl, filename, title, text }: ShareOptions): Promise<boolean> => {
  if (!canShareFiles()) {
    return false;
  }
  try {
    const file = await dataUrlToFile(dataUrl, filename);
    await navigator.share({
      files: [file],
      title: title || "Pohon Emas Story",
      text: text || "",
    });
    return true;
  } catch (err) {
    // User cancel = AbortError, jangan dianggap error
    if (err instanceof Error && err.name === "AbortError") return false;
    throw err;
  }
};

/**
 * Trigger browser download untuk PNG.
 */
export const downloadPNG = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

/**
 * Buka WhatsApp dengan pesan teks (tanpa lampiran — WA Web tidak support
 * pre-filled image attachment via URL). User harus paste manual.
 */
export const openWhatsAppWithText = (text: string, phone?: string) => {
  const cleanPhone = phone ? phone.replace(/\D/g, "") : "";
  const base = cleanPhone ? `https://wa.me/${cleanPhone}` : "https://wa.me/";
  const url = `${base}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
};
