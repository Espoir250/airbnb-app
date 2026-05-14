import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import styles from "./AuthPage.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await login(email, password);
      toast.success("Logged in successfully. Welcome back.", { id: "login-success" });
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed. Please try again.");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>
            Log in to manage your stays and saved places.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            className={styles.input}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button
          type="button"
          className={styles.switchButton}
          onClick={() => navigate("/register")}
        >
          Create an account
        </button>
      </div>
    </div>
  );
}
