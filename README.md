# Pohon Emas

Aplikasi generator story harga emas harian untuk reseller emas Indonesia. Buat gambar pricelist yang elegan dalam 30 detik, langsung siap dibagikan ke WhatsApp atau Instagram.

## Fitur

- **Generate gambar pricelist** dengan desain klasik elegan (Cormorant Garamond + ornamen pohon emas)
- **Auto-fill harga Antam** — satu klik untuk mengambil harga emas terkini
- **Drag-drop reorder** baris harga
- **Auto-save** — data tersimpan otomatis di browser
- **Export PNG resolusi tinggi** (1080×1920px, siap WhatsApp Story)
- **Bagikan langsung** ke WhatsApp via Web Share API
- **Mobile-first** responsive layout

## Teknologi

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **dnd-kit** untuk drag-drop
- **html-to-image** untuk PNG export
- **Sonner** untuk toast notifications

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build untuk production
npm run build

# Run tests
npm test
```

## Struktur folder

```
src/
├── components/
│   ├── StoryPreview.tsx    # Canvas 1080x1920 yang di-render ke PNG
│   ├── StoryForm.tsx       # Form input dengan drag-drop
│   ├── PreviewFrame.tsx    # Wrapper scaled-down preview
│   └── ui/                 # shadcn/ui components
├── hooks/
│   └── useGoldPrice.ts     # Hook fetch harga emas dari API
├── lib/
│   ├── share.ts            # Helper Web Share API
│   └── utils.ts
└── pages/
    └── Index.tsx           # Main page
```

## Customization

### Ganti palette warna

Edit `src/index.css` — semua warna dikontrol via CSS variables (`--primary`, `--background`, dll).

### Ganti API harga emas

Edit `src/hooks/useGoldPrice.ts` — ganti endpoint di fungsi `fetchGoldPrice()`. Default pakai `logam-mulia-api.vercel.app` (publik gratis).

### Ganti font

Edit import URL di top `src/index.css` dan `font-family` di `StoryPreview.tsx`.

## Lisensi

Internal — Pohon Emas
