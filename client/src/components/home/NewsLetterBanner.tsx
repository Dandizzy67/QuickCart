import { useState, type FormEvent } from "react";
import { MdOutlineMail } from "react-icons/md";
import { useToast } from "../../context/toastContext";
import { api } from "../../Utils/api";

const NewsletterBanner = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const { message } = await api<{ message: string }>(
        "/newsletter/subscribe",
        { method: "POST", body: { email } },
      );
      setEmail("");
      showToast({ type: "success", title: message });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="newsletter-title"
      className="rounded-3xl bg-footer p-6 text-white shadow-card md:p-10"
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-white/10 text-mint">
          <MdOutlineMail size={24} aria-hidden="true" />
        </span>
        <h2
          id="newsletter-title"
          className="text-3xl font-bold tracking-tight"
        >
          Get QuickCart VIP Drops
        </h2>
        <p className="mt-2 text-sm text-white/75">
          Sign up for product news, special offers, and a welcome gift.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            placeholder="Enter your email address"
            className="h-12 min-w-0 flex-1 rounded-xl bg-white px-4 text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-mint"
          />
          <button
            type="submit"
            disabled={submitting}
            className="h-12 rounded-xl bg-success px-6 font-semibold text-white hover:bg-forest disabled:opacity-60"
          >
            {submitting ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>
    </section>
  );
};

export default NewsletterBanner;
