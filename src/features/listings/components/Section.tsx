import { FaArrowRight } from "react-icons/fa";

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 24, lineHeight: 1.15 }}>{title}</h2>
        <span
          aria-hidden="true"
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#111827",
            background: "#f3f4f6",
          }}
        >
          <FaArrowRight aria-hidden="true" />
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}
