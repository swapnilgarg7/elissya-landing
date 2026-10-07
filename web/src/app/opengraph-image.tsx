import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Meet Elissya, your agentic social media manager";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const icon = await readFile(join(process.cwd(), "public/brand/icon-light.png"));
  const story = await readFile(join(process.cwd(), "public/demo/story.jpg"));
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#f4f3f6", padding: 72 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <img src={`data:image/png;base64,${icon.toString("base64")}`} width={88} height={88} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 108, fontWeight: 700, letterSpacing: -4, color: "#131218", lineHeight: 1 }}>
              Meet Elissya.
            </div>
            <div style={{ fontSize: 46, color: "#5d5b66", marginTop: 18, letterSpacing: -1 }}>
              Your agentic social media manager.
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 270,
            height: 486,
            borderRadius: 44,
            overflow: "hidden",
            border: "8px solid #0b0b0a",
            boxShadow: "0 30px 60px -20px rgba(60,40,120,0.35)",
          }}
        >
          <img src={`data:image/jpeg;base64,${story.toString("base64")}`} width={270} height={486} style={{ objectFit: "cover" }} alt="" />
        </div>
      </div>
    ),
    size,
  );
}
