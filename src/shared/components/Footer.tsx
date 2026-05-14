import { useState } from "react";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaInstagram,
  FaTwitter,
  FaFacebookF,
} from "react-icons/fa";

export function Footer() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <footer className="appFooter" id="contact">
      <div className="footerTop">
        {/* LEFT */}
        <div className="footerBrand">
          <h2>Airbnb<span>On.</span></h2>
          <p>
            Comfortable stays, trusted hosts, and seamless booking experiences
            designed for modern travelers.
          </p>
          <div className="footerInfo">
            <a href="tel:+250783031696">
              <FaPhoneAlt />
              <span>+250 783 031 696</span>
            </a>
            <a href="mailto:airbnbon250@gmail.com">
              <FaEnvelope />
              <span>airbnbon250@gmail.com</span>
            </a>
          </div>
          <div className="footerSocials">
            <a href="/"><FaInstagram /></a>
            <a href="/"><FaTwitter /></a>
            <a href="/"><FaFacebookF /></a>
          </div>
        </div>

        {/* RIGHT */}
        <div className="footerForm">
          <h3>Contact <span> Us</span></h3>
          <p>
            Have questions, suggestions, or partnership inquiries? Send us a
            message anytime.
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <textarea
              rows={5}
              name="message"
              placeholder="Write your message..."
              value={form.message}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
            {status === "sent" && (
              <p className="successMsg">✅ Message sent successfully!</p>
            )}
            {status === "error" && (
              <p className="errorMsg">❌ Something went wrong. Please try again.</p>
            )}
          </form>
        </div>
      </div>
    </footer>
  );
}
