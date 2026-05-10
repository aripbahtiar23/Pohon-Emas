export type PriceRow = {
  id: string;
  weight: string;
  unit: string;
  price: string;
};

export type MovementDirection = "up" | "down";

export type StoryData = {
  logo: string;
  brandName: string;
  subBrand: string;
  city: string;
  whatsapp: string;
  title: string;
  productType: string;
  date: string;
  movementValue: string;
  movementDirection: MovementDirection;
  priceNote: string;
  disclaimer: string;
  rows: PriceRow[];
};

interface Props {
  data: StoryData;
  rows?: PriceRow[];
}

const COLORS = {
  bg: "#F2EBDD",
  text: "#3D2914",
  textMuted: "#5A3A1F",
  gold: "#C9A76A",
  goldDark: "#A6824A",
  divider: "#D9C9A8",
  up: "#2E7D52",
  down: "#B94040",
};

const SERIF = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
const SANS = "'Montserrat', 'Inter', system-ui, sans-serif";

const formatIDR = (digits: string) => {
  if (!digits) return "IDR 0";
  const n = Number(digits.replace(/\D/g, "")) || 0;
  return "IDR " + n.toLocaleString("id-ID");
};

const formatDateID = (iso: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const formatWeight = (w: string, unit: string) => {
  const trimmed = (w || "").replace(",", ".");
  const n = Number(trimmed);
  const num = Number.isFinite(n) ? n : trimmed;
  const u = (unit || "gram").toUpperCase();
  return `${num} ${u}`;
};


const FloralFrame = ({
  size = 1040,
  color = COLORS.gold,
  opacity = 0.13,
}: {
  size?: number;
  color?: string;
  opacity?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 400 400"
    fill="none"
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity }}
    aria-hidden="true"
  >
    {/* Lingkaran luar */}
    <circle cx="200" cy="200" r="185" strokeWidth="0.8" />
    {/* Lingkaran dalam */}
    <circle cx="200" cy="200" r="170" strokeWidth="0.4" />
    {/* Lingkaran dekoratif tengah */}
    <circle cx="200" cy="200" r="155" strokeWidth="0.3" strokeDasharray="4 3" />

    {/* Ornamen atas */}
    <path d="M200 15 C195 25 185 30 180 40 C185 38 192 36 200 35 C208 36 215 38 220 40 C215 30 205 25 200 15Z" strokeWidth="0.6" fill={color} />
    <path d="M200 35 L200 45" strokeWidth="0.6" />
    <path d="M185 40 Q190 50 200 52 Q210 50 215 40" strokeWidth="0.5" />
    <circle cx="200" cy="15" r="3" strokeWidth="0.6" fill={color} />
    <circle cx="180" cy="40" r="2" strokeWidth="0.5" fill={color} />
    <circle cx="220" cy="40" r="2" strokeWidth="0.5" fill={color} />

    {/* Ornamen bawah */}
    <path d="M200 385 C195 375 185 370 180 360 C185 362 192 364 200 365 C208 364 215 362 220 360 C215 370 205 375 200 385Z" strokeWidth="0.6" fill={color} />
    <path d="M200 365 L200 355" strokeWidth="0.6" />
    <path d="M185 360 Q190 350 200 348 Q210 350 215 360" strokeWidth="0.5" />
    <circle cx="200" cy="385" r="3" strokeWidth="0.6" fill={color} />
    <circle cx="180" cy="360" r="2" strokeWidth="0.5" fill={color} />
    <circle cx="220" cy="360" r="2" strokeWidth="0.5" fill={color} />

    {/* Ornamen kiri */}
    <path d="M15 200 C25 195 30 185 40 180 C38 185 36 192 35 200 C36 208 38 215 40 220 C30 215 25 205 15 200Z" strokeWidth="0.6" fill={color} />
    <path d="M35 200 L45 200" strokeWidth="0.6" />
    <path d="M40 185 Q50 190 52 200 Q50 210 40 215" strokeWidth="0.5" />
    <circle cx="15" cy="200" r="3" strokeWidth="0.6" fill={color} />

    {/* Ornamen kanan */}
    <path d="M385 200 C375 195 370 185 360 180 C362 185 364 192 365 200 C364 208 362 215 360 220 C370 215 375 205 385 200Z" strokeWidth="0.6" fill={color} />
    <path d="M365 200 L355 200" strokeWidth="0.6" />
    <path d="M360 185 Q350 190 348 200 Q350 210 360 215" strokeWidth="0.5" />
    <circle cx="385" cy="200" r="3" strokeWidth="0.6" fill={color} />

    {/* Ornamen sudut kiri atas */}
    <path d="M69 69 Q80 75 85 85 Q75 80 69 69Z" strokeWidth="0.5" fill={color} />
    <path d="M75 58 Q82 72 90 78 Q78 76 75 58Z" strokeWidth="0.5" fill={color} />
    <path d="M58 75 Q72 82 78 90 Q76 78 58 75Z" strokeWidth="0.5" fill={color} />
    <circle cx="66" cy="66" r="2.5" strokeWidth="0.5" fill={color} />

    {/* Ornamen sudut kanan atas */}
    <path d="M331 69 Q320 75 315 85 Q325 80 331 69Z" strokeWidth="0.5" fill={color} />
    <path d="M325 58 Q318 72 310 78 Q322 76 325 58Z" strokeWidth="0.5" fill={color} />
    <path d="M342 75 Q328 82 322 90 Q324 78 342 75Z" strokeWidth="0.5" fill={color} />
    <circle cx="334" cy="66" r="2.5" strokeWidth="0.5" fill={color} />

    {/* Ornamen sudut kiri bawah */}
    <path d="M69 331 Q80 325 85 315 Q75 320 69 331Z" strokeWidth="0.5" fill={color} />
    <path d="M75 342 Q82 328 90 322 Q78 324 75 342Z" strokeWidth="0.5" fill={color} />
    <path d="M58 325 Q72 318 78 310 Q76 322 58 325Z" strokeWidth="0.5" fill={color} />
    <circle cx="66" cy="334" r="2.5" strokeWidth="0.5" fill={color} />

    {/* Ornamen sudut kanan bawah */}
    <path d="M331 331 Q320 325 315 315 Q325 320 331 331Z" strokeWidth="0.5" fill={color} />
    <path d="M325 342 Q318 328 310 322 Q322 324 325 342Z" strokeWidth="0.5" fill={color} />
    <path d="M342 325 Q328 318 322 310 Q324 322 342 325Z" strokeWidth="0.5" fill={color} />
    <circle cx="334" cy="334" r="2.5" strokeWidth="0.5" fill={color} />

    {/* Garis dekoratif melengkung antara ornamen */}
    <path d="M200 45 Q230 50 248 62" strokeWidth="0.4" />
    <path d="M200 45 Q170 50 152 62" strokeWidth="0.4" />
    <path d="M200 355 Q230 350 248 338" strokeWidth="0.4" />
    <path d="M200 355 Q170 350 152 338" strokeWidth="0.4" />
    <path d="M45 200 Q50 230 62 248" strokeWidth="0.4" />
    <path d="M45 200 Q50 170 62 152" strokeWidth="0.4" />
    <path d="M355 200 Q350 230 338 248" strokeWidth="0.4" />
    <path d="M355 200 Q350 170 338 152" strokeWidth="0.4" />

    {/* Titik dekoratif di lingkaran */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const x = 200 + 185 * Math.cos(rad);
      const y = 200 + 185 * Math.sin(rad);
      return <circle key={deg} cx={x} cy={y} r="1.5" fill={color} strokeWidth="0" />;
    })}
  </svg>
);

const PinIcon = ({ size = 26, color = COLORS.textMuted }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s-7-7.58-7-13a7 7 0 0 1 14 0c0 5.42-7 13-7 13z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const PhoneIcon = ({ size = 26, color = COLORS.textMuted }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const ArrowUpIcon = ({ size = 28, color = COLORS.up }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ArrowDownIcon = ({ size = 28, color = COLORS.down }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Auto-size tabel berdasar jumlah baris — semakin banyak makin compact
const getTableScale = (count: number) => {
  if (count <= 4) return { font: 52, padY: 22 };
  if (count <= 6) return { font: 46, padY: 18 };
  if (count <= 8) return { font: 40, padY: 14 };
  if (count <= 10) return { font: 36, padY: 11 };
  if (count <= 12) return { font: 32, padY: 9 };
  return { font: 28, padY: 7 };
};

export const StoryPreview = ({ data, rows }: Props) => {
  const allRows = (rows ?? data.rows).filter(
    (r) => r.weight.trim() !== "" || r.price.trim() !== "",
  );

  const count = allRows.length;
  const ts = getTableScale(count);

  const titleText = data.title || "Pricelist Pohon Emas";
  const titleFont =
    titleText.length <= 16 ? 96
    : titleText.length <= 22 ? 82
    : titleText.length <= 28 ? 70
    : titleText.length <= 34 ? 60
    : 52;

  // FIX BUG: cek semua kasus string kosong / "0" / undefined
  const rawMov = String(data.movementValue ?? "").trim();
  const hasMovement = rawMov !== "" && rawMov !== "0";
  const movementAmount = hasMovement
    ? Number(rawMov.replace(/\D/g, "")) || 0
    : 0;
  const isUp = data.movementDirection === "up";

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: SANS,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Background ornamen — logo sebagai watermark */}
      {data.logo && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1080,
            height: 1920,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <img
            src={data.logo}
            alt=""
            aria-hidden="true"
            crossOrigin="anonymous"
            style={{
              width: 1080,
              height: 1080,
              objectFit: "contain",
              opacity: 0.08,
            }}
          />
        </div>
      )}

      {/* Konten */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "36px 100px 72px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Logo — lebih besar */}
        {data.logo ? (
          <img
            src={data.logo}
            alt="Logo"
            crossOrigin="anonymous"
            style={{
              maxHeight: 270,
              maxWidth: 440,
              objectFit: "contain",
              marginBottom: -40,
            }}
          />
        ) : (
          <div style={{ height: 230 }} />
        )}

        {/* Headline */}
        <div
          style={{
            fontFamily: SERIF,
            fontSize: titleFont,
            fontWeight: 500,
            color: COLORS.text,
            textAlign: "center",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
          }}
        >
          {titleText}
        </div>

        {/* Garis emas */}
        <div
          style={{
            width: 120,
            height: 1,
            background: COLORS.goldDark,
            marginTop: 24,
          }}
        />

        {/* Sub brand */}
        {data.subBrand && (
          <div
            style={{
              fontFamily: SANS,
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: "0.30em",
              textTransform: "uppercase",
              color: COLORS.text,
              marginTop: 16,
            }}
          >
            BY {data.subBrand.replace(/^by\s+/i, "").toUpperCase()}
          </div>
        )}

        {/* Produk + tanggal + pergerakan */}
        <div style={{ textAlign: "center", marginTop: 36 }}>
          {data.productType && (
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 38,
                fontWeight: 500,
                color: COLORS.text,
                lineHeight: 1.25,
              }}
            >
              {data.productType}
            </div>
          )}
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 38,
              fontWeight: 500,
              color: COLORS.text,
              lineHeight: 1.25,
              marginTop: 4,
            }}
          >
            {formatDateID(data.date)}
          </div>

          {/* Pergerakan harga — FIXED */}
          {hasMovement && movementAmount > 0 && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 20,
                padding: "10px 30px",
                borderRadius: 40,
                background: isUp ? "rgba(46,125,82,0.10)" : "rgba(185,64,64,0.10)",
                border: `1px solid ${isUp ? "rgba(46,125,82,0.30)" : "rgba(185,64,64,0.30)"}`,
              }}
            >
              {isUp ? <ArrowUpIcon size={30} color={COLORS.up} /> : <ArrowDownIcon size={30} color={COLORS.down} />}
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 28,
                  fontWeight: 600,
                  color: isUp ? COLORS.up : COLORS.down,
                }}
              >
                Rp {movementAmount.toLocaleString("id-ID")}
              </span>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 22,
                  fontWeight: 400,
                  color: isUp ? COLORS.up : COLORS.down,
                  opacity: 0.8,
                }}
              >
                / gram
              </span>
            </div>
          )}
        </div>

        {/* Spacer 1 — dorong tabel turun proporsional */}
        <div style={{ flex: 0.3 }} />

        {/* TABEL HARGA */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "0 28px",
          }}
        >
          {allRows.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: COLORS.textMuted,
                fontFamily: SERIF,
                fontSize: 34,
                fontStyle: "italic",
              }}
            >
              Tambahkan harga untuk ditampilkan
            </div>
          )}

          {allRows.map((row, i) => (
            <div key={row.id}>
              {i > 0 && (
                <div
                  style={{
                    width: "100%",
                    height: 1,
                    background: COLORS.divider,
                    opacity: 0.55,
                  }}
                />
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: `${ts.padY}px 0`,
                  fontFamily: SERIF,
                  fontSize: ts.font,
                }}
              >
                <span style={{ fontWeight: 400, color: COLORS.text, letterSpacing: "0.04em" }}>
                  {formatWeight(row.weight, row.unit)}
                </span>
                <span style={{ fontWeight: 700, color: COLORS.text }}>
                  {formatIDR(row.price)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Spacer 2 — dorong footer ke bawah */}
        <div style={{ flex: 0.3 }} />

        {/* Footer */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {data.priceNote && (
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 28,
                color: COLORS.text,
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              {data.priceNote}
            </div>
          )}
          {data.disclaimer && (
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 24,
                fontStyle: "italic",
                color: COLORS.textMuted,
                textAlign: "center",
                marginTop: 6,
                maxWidth: 800,
                lineHeight: 1.4,
              }}
            >
              {data.disclaimer}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 56,
              marginTop: 32,
              fontFamily: SERIF,
              fontSize: 30,
              color: COLORS.text,
            }}
          >
            {data.city && (
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <PinIcon size={28} color={COLORS.goldDark} />
                <span>{data.city}</span>
              </span>
            )}
            {data.whatsapp && (
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <PhoneIcon size={28} color={COLORS.goldDark} />
                <span>{data.whatsapp}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
