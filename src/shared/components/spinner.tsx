export function Spinner() {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb", // light gray
    borderTop: "4px solid #3b82f6", // blue
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};