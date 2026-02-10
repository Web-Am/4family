import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f6f7fb",
                flexDirection: "column",
                fontFamily: "Inter, sans-serif",
            }}
        >
            <h1 style={{ fontSize: 64, margin: 0 }}>404</h1>

            <h2 style={{ marginTop: 10 }}>Pagina non trovata</h2>

            <p style={{ color: "#666", marginBottom: 30 }}>
                L'indirizzo che stai cercando non esiste.
            </p>

            <button
                onClick={() => navigate("/")}
                style={{
                    padding: "12px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "#111",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 14,
                }}
            >
                Torna alla dashboard
            </button>
        </div>
    );
}
