export function ListingRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "15px",
        overflowX: "auto",
        paddingBottom: "10px",
      }}
    >
      {children}
    </div>
  );
}