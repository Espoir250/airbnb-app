import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../../../shared/api";
import styles from "./AuthPage.module.css";

export function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"GUEST" | "HOST">("GUEST");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await registerUser({ name, username, phone, role, email, password });
      toast.success("Account created successfully. You can log in now.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create your account</h2>
          <p className={styles.subtitle}>
            Join Airbnb to book stays and keep track of favorites.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />

          <input
            className={styles.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            className={styles.input}
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
          />

          <select
            className={styles.input}
            value={role}
            onChange={(e) => setRole(e.target.value as "GUEST" | "HOST")}
            required
          >
            <option value="GUEST">Guest</option>
            <option value="HOST">Host</option>
          </select>

          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <button type="submit" className={styles.button}>
            Register
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button
          type="button"
          className={styles.switchButton}
          onClick={() => navigate("/login")}
        >
          Already have an account? Log in
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;
