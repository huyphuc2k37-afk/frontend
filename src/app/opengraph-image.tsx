import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "VStory – Đọc Truyện Chữ Online Miễn Phí";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            V
          </div>
          <span
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            VStory
          </span>
        </div>
        <p
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.9)",
            margin: 0,
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          Nền tảng đọc truyện chữ online miễn phí hàng đầu Việt Nam
        </p>
        <p
          style={{
            fontSize: "20px",
            color: "rgba(255,255,255,0.7)",
            marginTop: "12px",
          }}
        >
          vstory.vn
        </p>
      </div>
    ),
    { ...size }
  );
}
