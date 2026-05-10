import { useEffect, useRef, type ReactNode } from "react";
import { Wand2 } from "lucide-react";

interface PreviewFrameProps {
  children: ReactNode;
}

/**
 * Membungkus StoryPreview (1080x1920) supaya tampil scaled-down di chrome
 * tanpa kehilangan rasio aspek. Internal element di-scale via transform.
 */
export const PreviewFrame = ({ children }: PreviewFrameProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;
    const inner = el.firstElementChild as HTMLElement | null;

    const update = () => {
      const w = parent.clientWidth;
      const scale = w / 1080;
      el.style.height = `${1920 * scale}px`;
      if (inner) inner.style.transform = `scale(${scale})`;
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="rounded-[1.5rem] shadow-story ring-1 ring-primary/15 bg-background overflow-hidden"
      style={{
        width: "min(100%, 380px)",
        maxHeight: "82vh",
        overflowY: "auto",
        position: "relative",
      }}
    >
      <div
        ref={wrapperRef}
        style={{
          position: "relative",
          width: "100%",
          height: "calc(min(100%, 380px) * (1920 / 1080))",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1080,
            height: 1920,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export const PlaceholderFrame = () => (
  <div
    className="rounded-[1.5rem] border-2 border-dashed border-primary/30 bg-card/40 flex items-center justify-center text-center px-6"
    style={{
      width: "min(100%, 380px)",
      aspectRatio: "1080 / 1920",
      maxHeight: "82vh",
    }}
  >
    <div className="space-y-2">
      <Wand2 className="w-8 h-8 text-primary/60 mx-auto" />
      <p className="font-serif text-2xl">Klik Generate Story</p>
      <p className="text-xs text-muted-foreground">
        Pratinjau akan muncul di sini
      </p>
    </div>
  </div>
);
