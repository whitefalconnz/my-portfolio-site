"use client";

import { useState } from "react";
import { sendEmail } from "../actions";
import { CONTACT } from "../data/work";
import { trackEvent } from "../lib/analytics";

/** The email address and the message form, unfolded at the foot of the page. */
export default function Contact({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError("");

    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("email", form.email);
      data.append("message", form.message);

      const result = await sendEmail(data);
      if (result.success) {
        setSent(true);
        trackEvent("generate_lead");
      } else {
        setError(result.error || "Failed to send message. Please try again.");
      }
    } catch (caught) {
      console.error("Error submitting form:", caught);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const field = (name: keyof typeof form) => ({
    id: `contact-${name}`,
    required: true,
    value: form[name],
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm({ ...form, [name]: event.target.value }),
  });

  return (
    <section
      className="contact"
      data-contact
      aria-labelledby="contact-title"
      tabIndex={-1}
    >
      <div className="contact-intro">
        <header className="panel-head">
          <h2 id="contact-title">Get in Touch</h2>
          <button type="button" className="word" onClick={onClose}>
            Close
          </button>
        </header>
        <p>Please don't hesitate to reach out with any thoughts or inquiries.</p>
        <p>
          <a className="word" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
        </p>
      </div>

      {sent ? (
        <div className="contact-form" role="status">
          <h3>Message Sent Successfully!</h3>
          <p>
            Thanks for reaching out. I'll get back to you as soon as possible.
          </p>
        </div>
      ) : (
        <form className="contact-form" onSubmit={submit}>
          <label htmlFor="contact-name">Name *</label>
          <input type="text" autoComplete="name" placeholder="Your Name..." {...field("name")} />

          <label htmlFor="contact-email">Email Address *</label>
          <input
            type="email"
            autoComplete="email"
            placeholder="Your Email Address..."
            {...field("email")}
          />

          <label htmlFor="contact-message">Message *</label>
          <textarea rows={5} placeholder="Your Message..." {...field("message")} />

          {error && (
            <p className="contact-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="send" disabled={sending}>
            {sending ? "Sending..." : "Send Message →"}
          </button>
        </form>
      )}
    </section>
  );
}
