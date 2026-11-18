import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/authContext";
import { useToast } from "../../context/toastContext";
import type { User } from "../../types/api";
import { api } from "../../Utils/api";
import TextInput from "../form/TextInput";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const EMPTY_FORM: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ChangePasswordForm = () => {
  const { startSession } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const change = (field: keyof PasswordForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const reply = await api<{
        message: string;
        token: string;
        user: User;
      }>("/account/password", {
        method: "PATCH",
        body: form,
      });
      startSession({ token: reply.token, user: reply.user });
      setForm(EMPTY_FORM);
      showToast({ type: "success", title: reply.message });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-surface p-6 shadow-card"
    >
      <h2 className="mb-4 text-xl font-semibold text-ink">Change Password</h2>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}
      <div className="grid gap-4">
        <TextInput
          label="Current Password"
          type="password"
          autoComplete="current-password"
          required
          value={form.currentPassword}
          onChange={(event) => change("currentPassword", event.target.value)}
        />
        <TextInput
          label="New Password"
          type="password"
          autoComplete="new-password"
          required
          value={form.newPassword}
          onChange={(event) => change("newPassword", event.target.value)}
        />
        <TextInput
          label="Confirm New Password"
          type="password"
          autoComplete="new-password"
          required
          value={form.confirmPassword}
          onChange={(event) => change("confirmPassword", event.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="mt-5 h-11 rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {saving ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
