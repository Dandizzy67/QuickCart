import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/authContext";
import type { Address } from "../../types/api";
import { api } from "../../Utils/api";
import { localPhone, toInternational } from "../../Utils/nigeria";
import TextInput from "../form/TextInput";

type AddressFields = Omit<Address, "_id">;

type AddressFormProps = {
  address?: Address;
  onDone: (message: string) => void;
  onCancel: () => void;
};

const AdressForm = ({ address, onDone, onCancel }: AddressFormProps) => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState<AddressFields>(() => ({
    label: address?.label ?? "Home",
    fullName: address?.fullName ?? "",
    phone: localPhone(address?.phone),
    street: address?.street ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    country: address?.country ?? "Nigeria",
    instructions: address?.instructions ?? "",
    isDefault: address?.isDefault ?? !user?.addresses.length,
  }));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const change = <K extends keyof AddressFields>(
    field: K,
    value: AddressFields[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setError("Please sign in again to manage your addresses.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const body = { ...form, phone: toInternational(form.phone) };
      const reply = address
        ? await api<{ addresses: Address[] }>(
            `/account/addresses/${address._id}`,
            { method: "PATCH", body },
          )
        : await api<{ addresses: Address[] }>("/account/addresses", {
            method: "POST",
            body,
          });
      setUser({ ...user, addresses: reply.addresses });
      onDone(address ? "Address updated." : "Address added.");
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
      <h2 className="mb-4 text-xl font-semibold text-ink">
        {address ? "Edit Address" : "Add New Address"}
      </h2>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Address Label"
          autoComplete="off"
          required
          value={form.label}
          onChange={(event) => change("label", event.target.value)}
        />
        <TextInput
          label="Full Name"
          autoComplete="name"
          required
          value={form.fullName}
          onChange={(event) => change("fullName", event.target.value)}
        />
        <TextInput
          label="Phone Number"
          type="tel"
          autoComplete="tel"
          required
          value={form.phone}
          onChange={(event) => change("phone", event.target.value)}
        />
        <TextInput
          label="Street Address"
          autoComplete="street-address"
          required
          value={form.street}
          onChange={(event) => change("street", event.target.value)}
        />
        <TextInput
          label="City"
          autoComplete="address-level2"
          required
          value={form.city}
          onChange={(event) => change("city", event.target.value)}
        />
        <TextInput
          label="State"
          autoComplete="address-level1"
          required
          value={form.state}
          onChange={(event) => change("state", event.target.value)}
        />
        <TextInput
          label="Country"
          autoComplete="country-name"
          required
          value={form.country}
          onChange={(event) => change("country", event.target.value)}
        />
        <label className="flex items-center gap-2 self-end pb-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(event) => change("isDefault", event.target.checked)}
            className="size-4 accent-primary"
          />
          Set as my default address
        </label>
      </div>
      <label className="mt-4 block text-sm font-medium text-ink">
        Delivery Instructions (optional)
        <textarea
          value={form.instructions ?? ""}
          onChange={(event) => change("instructions", event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-xl bg-field px-4 py-3 text-[15px] text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
        />
      </label>
      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-xl px-5 font-medium text-ink hover:bg-field"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? "Saving..." : address ? "Save Address" : "Add Address"}
        </button>
      </div>
    </form>
  );
};

export default AdressForm;
