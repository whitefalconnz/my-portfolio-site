"use client";

import { useState, useEffect, useRef } from "react";

import { sendEmail } from "./actions";
import { useAutoImageTracking } from "../hooks/useAutoMemoryManagement";
import MemoryStatsDebugger from "../components/common/MemoryStatsDebugger";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Auto memory management for images on this page (though contact page has no images currently)
  const contactPageRef = useRef<HTMLDivElement>(null);
  const { trackAllElements, getStats: getContactTrackingStats } =
    useAutoImageTracking(contactPageRef, {
      enabled: true,
      debugLog: process.env.NODE_ENV === "development",
      selector: "img, video, iframe",
      trackOnMount: true,
      retryInterval: 2000,
    });

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Set up observer for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Track elements when page loads (though contact page has minimal media)
  useEffect(() => {
    const timer = setTimeout(() => {
      trackAllElements();

      if (process.env.NODE_ENV === "development") {
        console.log(
          "📊 Contact page auto-tracking stats:",
          getContactTrackingStats()
        );
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [trackAllElements, getContactTrackingStats]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Create FormData from the form fields
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("message", formData.message);

      // Send the email using the server action
      const result = await sendEmail(formDataToSend);

      if (result.success) {
        setFormSubmitted(true);
      } else {
        setSubmitError(
          result.error || "Failed to send message. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={contactPageRef}
      className="min-h-screen bg-ground grid-pattern relative"
    >

      <main className="pt-32 md:pt-40 pb-20 max-w-6xl mx-auto px-6 md:flex md:gap-8 relative">
        <div
          className="p-8 mb-12 md:mb-0 md:w-[400px] md:flex-shrink-0 border relative z-10 transition-all duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--line)",
          }}
        >
          <div className="flex flex-col h-full">
            <div
              className="border-b mb-8 pb-4"
              style={{ borderBottomColor: "var(--line)" }}
            >
              <h1 className="font-display text-4xl md:text-5xl text-accent">
                Get in Touch
              </h1>
            </div>

            <div className="flex-grow font-satoshi mb-8">
              <p className="text-lg text-dark dark:text-light">
                Please don't hesitate to reach out with any thoughts or
                inquiries.
              </p>
            </div>

            <a
              href="mailto:jakobbackhouse@gmail.com"
              className="block w-full px-6 py-3 bg-ink text-ground font-medium text-center
                hover:border-accent
                transition-all border font-satoshi"
              style={{ borderColor: "var(--line)" }}
            >
              jakobbackhouse@gmail.com
            </a>
          </div>
        </div>

        <div
          className="md:flex-1 relative"
        >
          {!formSubmitted ? (
            <div
              className="p-8 border relative z-10 hover:border-accent transition-all duration-300"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--line)",
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-6 font-satoshi">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-dark dark:text-light"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-4 py-2 bg-ground 
                      text-dark dark:text-light focus:outline-none focus:ring-0
                      hover:border-accent
                      transition-all border"
                    placeholder="Your Name..."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    style={{ borderColor: "var(--line)" }}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-dark dark:text-light"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-2 bg-ground 
                      text-dark dark:text-light focus:outline-none focus:ring-0
                      hover:border-accent
                      transition-all border"
                    placeholder="Your Email Address..."
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    style={{ borderColor: "var(--line)" }}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-dark dark:text-light"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    className="w-full px-4 py-2 bg-ground 
                      text-dark dark:text-light focus:outline-none focus:ring-0
                      hover:border-accent
                      transition-all border"
                    placeholder="Your Message..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    style={{ borderColor: "var(--line)" }}
                  />
                </div>

                {submitError && (
                  <div className="text-red-500 text-sm py-2">{submitError}</div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-ink text-ground font-medium 
                    hover:border-accent
                    transition-all border disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ borderColor: "var(--line)" }}
                >
                  {isSubmitting ? "Sending..." : "Send Message →"}
                </button>
              </form>
            </div>
          ) : (
            <div
              className="p-8 border relative z-10 hover:border-accent transition-all duration-300"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--line)",
              }}
            >
              <div className="text-center space-y-4">
                <div
                  className="inline-block bg-green-500 text-white p-4 mb-4 border"
                  style={{ borderColor: "var(--line)" }}
                >
                  <svg
                    className="w-8 h-8 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="font-display text-2xl text-accent">
                  Message Sent Successfully!
                </h3>
                <p className="font-satoshi text-secondary dark:text-secondary-light">
                  Thanks for reaching out. I'll get back to you as soon as
                  possible.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Memory stats debugger - development only */}
      <MemoryStatsDebugger position="top-right" />
    </div>
  );
}
