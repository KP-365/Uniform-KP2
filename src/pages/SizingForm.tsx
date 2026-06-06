import { useState } from "react";

const AIRTABLE_TOKEN   = import.meta.env.VITE_AIRTABLE_TOKEN   ?? "";
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID ?? "";
const AIRTABLE_TABLE   = import.meta.env.VITE_AIRTABLE_TABLE   ?? "Submissions";

const PRIMARY = "#0d0d0d";
const ACCENT = "#b8982a";
const ACCENT_LIGHT = "#f5edcc";
const BG = "#f9f7f4";
const CARD = "#ffffff";
const BORDER = "#e4ddd2";
const MUTED = "#7a7060";
const DARK_SECTION = "#111111";

const UK_SHOE_SIZES = ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13", "14"];
const COLLAR_SIZES = ["14", "14.5", "15", "15.5", "16", "16.5", "17", "17.5", "18", "18.5", "19", "19.5", "20"];
const JACKET_SIZES = [
  "34S", "34R", "34L",
  "36S", "36R", "36L",
  "38S", "38R", "38L",
  "40S", "40R", "40L",
  "42S", "42R", "42L",
  "44S", "44R", "44L",
  "46S", "46R", "46L",
  "48S", "48R", "48L",
  "50S", "50R", "50L",
  "52S", "52R", "52L",
];
const WAIST_SIZES = Array.from({ length: 26 }, (_, i) => String(28 + i)); // 28–53
const LEG_SIZES = ["28", "29", "30", "31", "32", "33", "34", "35", "36"];
const JUMPER_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

type FormData = {
  name: string;
  shoeSize: string;
  collarSize: string;
  jacketSize: string;
  jumperSize: string;
  trouserWaist: string;
  trouserLeg: string;
  notes: string;
};

const EMPTY: FormData = {
  name: "",
  shoeSize: "",
  collarSize: "",
  jacketSize: "",
  jumperSize: "",
  trouserWaist: "",
  trouserLeg: "",
  notes: "",
};

export default function SizingForm() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function set(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): Partial<FormData> {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.shoeSize) e.shoeSize = "Required";
    if (!form.collarSize) e.collarSize = "Required";
    if (!form.jacketSize) e.jacketSize = "Required";
    if (!form.jumperSize) e.jumperSize = "Required";
    if (!form.trouserWaist) e.trouserWaist = "Required";
    if (!form.trouserLeg) e.trouserLeg = "Required";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setSubmitError("");

    try {
      if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) throw new Error("Airtable not configured");

      const res = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: {
              "Full Name":          form.name,
              "Shoe Size (UK)":     form.shoeSize,
              "Collar Size (in)":   form.collarSize,
              "Jacket Size":        form.jacketSize,
              "Trouser Waist (in)": form.trouserWaist,
              "Trouser Leg (in)":   form.trouserLeg,
              "Notes":              form.notes,
            },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any)?.error?.message ?? `HTTP ${res.status}`);
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError("Something went wrong — please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: MUTED,
    marginBottom: "6px",
  };

  const selectStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "10px 14px",
    fontSize: "0.95rem",
    border: `1.5px solid ${hasError ? "#c0392b" : BORDER}`,
    borderRadius: "8px",
    background: CARD,
    color: PRIMARY,
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237a7060' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    cursor: "pointer",
    outline: "none",
  });

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "10px 14px",
    fontSize: "0.95rem",
    border: `1.5px solid ${hasError ? "#c0392b" : BORDER}`,
    borderRadius: "8px",
    background: CARD,
    color: PRIMARY,
    outline: "none",
    boxSizing: "border-box",
  });

  const errMsg = (msg?: string) =>
    msg ? <p style={{ color: "#b91c1c", fontSize: "0.75rem", marginTop: "5px", margin: "5px 0 0" }}>{msg}</p> : null;

  const SectionHeader = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
      <div style={{ width: "3px", height: "18px", background: ACCENT, borderRadius: "2px", flexShrink: 0 }} />
      <h3 style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED, margin: 0 }}>
        {children}
      </h3>
      <div style={{ flex: 1, height: "1px", background: BORDER }} />
    </div>
  );

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: DARK_SECTION, display: "flex", flexDirection: "column" }}>
        {/* Nav bar */}
        <div style={{ padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", color: ACCENT }}>
            KHARIS · KP2
          </span>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ background: CARD, borderRadius: "2px", padding: "56px 48px", maxWidth: "480px", width: "100%", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", border: `2px solid ${ACCENT}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, margin: "0 0 14px" }}>Received</p>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 300, color: PRIMARY, margin: "0 0 16px", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
              Thank you
            </h2>
            <p style={{ color: MUTED, lineHeight: 1.7, margin: 0, fontSize: "0.9rem" }}>
              Your sizing information has been submitted. We'll ensure everything is prepared for you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

      {/* Top nav bar */}
      <div style={{ background: DARK_SECTION, padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", color: ACCENT }}>
          KHARIS
        </span>
        <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
          KP2
        </span>
      </div>

      {/* Hero header */}
      <div style={{ background: DARK_SECTION, padding: "56px 40px 64px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Subtle gold divider lines */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: ACCENT, margin: "0 0 20px" }}>
          Uniform Programme
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 200, color: "#ffffff", margin: "0 0 16px", letterSpacing: "0.04em", lineHeight: 1.15 }}>
          SIZING FORM
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", margin: "0 auto", maxWidth: "420px", lineHeight: 1.7, letterSpacing: "0.01em" }}>
          Fill in your measurements below. All fields are required unless marked optional.
        </p>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, rgba(184,152,42,0.3), transparent)` }} />
      </div>

      {/* Form body */}
      <div style={{ flex: 1, padding: "48px 24px 64px", background: BG }}>
        <div style={{ maxWidth: "620px", margin: "0 auto" }}>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0" }}>

            {/* Section: Your Details */}
            <div style={{ background: CARD, padding: "36px 36px 28px", marginBottom: "2px" }}>
              <SectionHeader>Your Details</SectionHeader>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle(!!errors.name)} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="John Smith" />
                {errMsg(errors.name)}
              </div>
            </div>

            {/* Section: Footwear */}
            <div style={{ background: CARD, padding: "36px 36px 28px", marginBottom: "2px" }}>
              <SectionHeader>Footwear</SectionHeader>
              <div style={{ maxWidth: "240px" }}>
                <label style={labelStyle}>Shoe Size (UK)</label>
                <select style={selectStyle(!!errors.shoeSize)} value={form.shoeSize} onChange={(e) => set("shoeSize", e.target.value)}>
                  <option value="">Select size…</option>
                  {UK_SHOE_SIZES.map((s) => <option key={s} value={s}>UK {s}</option>)}
                </select>
                {errMsg(errors.shoeSize)}
              </div>
            </div>

            {/* Section: Shirt */}
            <div style={{ background: CARD, padding: "36px 36px 28px", marginBottom: "2px" }}>
              <SectionHeader>Shirt</SectionHeader>
              <div style={{ maxWidth: "240px" }}>
                <label style={labelStyle}>Collar Size (inches)</label>
                <select style={selectStyle(!!errors.collarSize)} value={form.collarSize} onChange={(e) => set("collarSize", e.target.value)}>
                  <option value="">Select size…</option>
                  {COLLAR_SIZES.map((s) => <option key={s} value={s}>{s}"</option>)}
                </select>
                {errMsg(errors.collarSize)}
              </div>
            </div>

            {/* Section: Jumper */}
            <div style={{ background: CARD, padding: "36px 36px 28px", marginBottom: "2px" }}>
              <SectionHeader>Jumper</SectionHeader>
              <div style={{ maxWidth: "240px" }}>
                <label style={labelStyle}>Jumper Size</label>
                <select style={selectStyle(!!errors.jumperSize)} value={form.jumperSize} onChange={(e) => set("jumperSize", e.target.value)}>
                  <option value="">Select size…</option>
                  {JUMPER_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errMsg(errors.jumperSize)}
              </div>
            </div>

            {/* Section: Suit */}
            <div style={{ background: CARD, padding: "36px 36px 28px", marginBottom: "2px" }}>
              <SectionHeader>Suit</SectionHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ maxWidth: "240px" }}>
                  <label style={labelStyle}>Jacket Size</label>
                  <select style={selectStyle(!!errors.jacketSize)} value={form.jacketSize} onChange={(e) => set("jacketSize", e.target.value)}>
                    <option value="">Select size…</option>
                    {JACKET_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <p style={{ fontSize: "0.72rem", color: MUTED, margin: "6px 0 0", letterSpacing: "0.02em" }}>S = Short &nbsp;·&nbsp; R = Regular &nbsp;·&nbsp; L = Long</p>
                  {errMsg(errors.jacketSize)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "480px" }}>
                  <div>
                    <label style={labelStyle}>Trouser Waist (inches)</label>
                    <select style={selectStyle(!!errors.trouserWaist)} value={form.trouserWaist} onChange={(e) => set("trouserWaist", e.target.value)}>
                      <option value="">Select waist…</option>
                      {WAIST_SIZES.map((s) => <option key={s} value={s}>{s}"</option>)}
                    </select>
                    {errMsg(errors.trouserWaist)}
                  </div>
                  <div>
                    <label style={labelStyle}>Trouser Leg (inches)</label>
                    <select style={selectStyle(!!errors.trouserLeg)} value={form.trouserLeg} onChange={(e) => set("trouserLeg", e.target.value)}>
                      <option value="">Select leg…</option>
                      {LEG_SIZES.map((s) => <option key={s} value={s}>{s}"</option>)}
                    </select>
                    {errMsg(errors.trouserLeg)}
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Notes */}
            <div style={{ background: CARD, padding: "36px 36px 28px", marginBottom: "2px" }}>
              <SectionHeader>Additional Notes</SectionHeader>
              <label style={labelStyle}>
                Notes&nbsp;
                <span style={{ color: MUTED, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
              </label>
              <textarea
                style={{ ...inputStyle(false), minHeight: "88px", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Any fit preferences, alterations, or extra info…"
              />
            </div>

            {/* Submit */}
            <div style={{ background: CARD, padding: "28px 36px 36px" }}>
              {submitError && (
                <p style={{ color: "#b91c1c", fontSize: "0.84rem", margin: "0 0 16px", padding: "12px 14px", background: "#fef2f2", borderLeft: `3px solid #b91c1c` }}>
                  {submitError}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? MUTED : DARK_SECTION,
                  color: "#fff",
                  border: "none",
                  borderRadius: "0",
                  padding: "16px 36px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  transition: "background 0.2s",
                  width: "100%",
                }}
              >
                {loading ? "Submitting…" : "Submit My Sizes"}
              </button>
              <p style={{ textAlign: "center", color: MUTED, fontSize: "0.72rem", marginTop: "16px", letterSpacing: "0.02em" }}>
                Your information is kept private and used only for fitting purposes.
              </p>
            </div>

          </form>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: DARK_SECTION, padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
          KHARIS CHURCH · KP2 PROGRAMME
        </span>
      </div>

    </div>
  );
}
