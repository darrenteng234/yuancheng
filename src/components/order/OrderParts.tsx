import type { CSSProperties } from "react";
import { Check, Camera, Landmark, Info } from "lucide-react";
import { EVIDENCE_DISCLAIMER } from "@/lib/domain/evidence";

/**
 * Demo bank-transfer receipt, rendered inline so it always matches its order
 * (amount + reference) and shows the order's own upload time (relative, KL) —
 * not a fixed image. Styled like a Maybank app receipt (kept in English).
 */
export function ReceiptSVG({
  amount, reference, date, bank, payee, account, style,
}: {
  amount: string; reference: string; date: string;
  bank: string; payee: string; account: string;
  style?: CSSProperties;
}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1040" width="720" height="1040"
      style={{ width: "100%", height: "auto", display: "block", ...style }} role="img"
      aria-label={`${bank} transfer receipt, ${amount}, ${reference}`}
      fontFamily="-apple-system,Segoe UI,Roboto,sans-serif">
      <rect width="720" height="1040" fill="#F1EDE4" />
      <rect x="60" y="70" width="600" height="900" rx="20" fill="#FFFFFF" stroke="#E1DED5" />
      <rect x="60" y="70" width="600" height="110" rx="20" fill="#5A3A22" />
      <text x="90" y="140" fill="#FFFFFF" fontSize="30" fontWeight="700">{bank}</text>
      <text x="630" y="140" fill="#E8DCCD" fontSize="22" textAnchor="end">Transfer receipt</text>
      <text x="90" y="250" fill="#5F6761" fontSize="22">Status</text>
      <text x="630" y="250" fill="#2E6B55" fontSize="24" fontWeight="700" textAnchor="end">Successful</text>
      <line x1="90" y1="290" x2="630" y2="290" stroke="#E1DED5" />
      <text x="90" y="350" fill="#5F6761" fontSize="22">Amount</text>
      <text x="630" y="356" fill="#1F2A24" fontSize="40" fontWeight="700" textAnchor="end">{amount}</text>
      <line x1="90" y1="400" x2="630" y2="400" stroke="#E1DED5" />
      <text x="90" y="460" fill="#5F6761" fontSize="22">Reference</text>
      <text x="630" y="460" fill="#1F2A24" fontSize="26" fontWeight="600" textAnchor="end">{reference}</text>
      <text x="90" y="540" fill="#5F6761" fontSize="22">To</text>
      <text x="630" y="540" fill="#1F2A24" fontSize="24" textAnchor="end">{payee}</text>
      <text x="90" y="620" fill="#5F6761" fontSize="22">Account</text>
      <text x="630" y="620" fill="#1F2A24" fontSize="24" textAnchor="end">{account}</text>
      <text x="90" y="700" fill="#5F6761" fontSize="22">Date</text>
      <text x="630" y="700" fill="#1F2A24" fontSize="24" textAnchor="end">{date}</text>
      <line x1="90" y1="760" x2="630" y2="760" stroke="#E1DED5" />
      <text x="360" y="850" fill="#8A918B" fontSize="20" textAnchor="middle">Demo receipt — Investor Demo</text>
      <text x="360" y="885" fill="#8A918B" fontSize="20" textAnchor="middle">Not a real transaction</text>
    </svg>
  );
}

/** Vertical order timeline. Steps marked done/current/upcoming. */
export interface TimelineStep { label: string; state: "done" | "current" | "upcoming"; sub?: string; }
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="timeline">
      {steps.map((s, i) => (
        <li key={i} className={`timeline-step timeline-step--${s.state}`}>
          <span className="timeline-dot">{s.state === "done" ? <Check size={13} /> : null}</span>
          <div className="timeline-body">
            <div className="timeline-label">{s.label}</div>
            {s.sub ? <div className="timeline-sub">{s.sub}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Private completion evidence. Photos + video, with the required disclaimer. */
export function EvidenceGallery({
  items, locale = "en", disclaimer = true,
}: { items: { type: "photo" | "video"; url: string; label?: string | { en: string; zh: string } }[]; locale?: string; disclaimer?: boolean }) {
  const zh = locale === "zh";
  const lbl = (l?: string | { en: string; zh: string }) => (typeof l === "object" && l ? (zh ? l.zh : l.en) : l);
  if (!items.length) {
    return <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>{zh ? "尚未提交完成记录。" : "Evidence has not been submitted yet."}</p>;
  }
  return (
    <div>
      <div className="evidence-gallery">
        {items.map((e, i) =>
          e.type === "video" ? (
            <video key={i} className="evidence-media" controls preload="metadata" src={e.url} />
          ) : (
            <a key={i} href={e.url} target="_blank" rel="noreferrer" className="evidence-media-wrap">
              <img className="evidence-media" src={e.url} alt={lbl(e.label) ?? "Evidence"} />
              <span className="evidence-tag"><Camera size={12} /> {lbl(e.label)}</span>
            </a>
          )
        )}
      </div>
      {disclaimer ? (
        <p className="evidence-disclaimer"><Info size={14} /> {zh
          ? "完成记录仅记录服务商所提交的内容，并非宗教或精神结果的保证。"
          : EVIDENCE_DISCLAIMER}</p>
      ) : null}
    </div>
  );
}

/** Provider payment instructions (manual, provider-direct). */
export function PaymentMethodCard({
  method, locale = "en",
}: {
  method: { display_name: string; bank_name?: string; account_name?: string; account_number?: string; instructions?: { en: string; zh: string } };
  locale?: string;
}) {
  const zh = locale === "zh";
  return (
    <div className="pay-method">
      <div className="pay-method-head"><Landmark size={18} /> {zh ? "直接向服务商付款" : "Pay the provider directly"}</div>
      <dl className="pay-method-grid">
        <div><dt>{zh ? "收款名称" : "Display name"}</dt><dd>{method.display_name}</dd></div>
        {method.bank_name ? <div><dt>{zh ? "银行" : "Bank"}</dt><dd>{method.bank_name}</dd></div> : null}
        {method.account_name ? <div><dt>{zh ? "账户名称" : "Account name"}</dt><dd>{method.account_name}</dd></div> : null}
        {method.account_number ? <div><dt>{zh ? "账号" : "Account number"}</dt><dd>{method.account_number}</dd></div> : null}
      </dl>
      {method.instructions ? <p className="pay-method-note">{zh ? method.instructions.zh : method.instructions.en}</p> : null}
    </div>
  );
}

/** Customer-facing package (Service → Package). Never says "SKU". */
export function PackageCard({
  name, price, includes, selected, onSelect, cta, locale = "en",
}: {
  name: string; price: string; includes: string[]; selected?: boolean;
  onSelect?: () => void; cta?: string; locale?: string;
}) {
  return (
    <div className={`package-card${selected ? " package-card--selected" : ""}`}>
      <div className="package-card-head">
        <span className="package-card-name">{name}</span>
        <span className="package-card-price">{price}</span>
      </div>
      <ul className="package-card-includes">
        {includes.map((inc, i) => <li key={i}><Check size={14} /> {inc}</li>)}
      </ul>
      {onSelect ? (
        <button className={`btn btn-sm ${selected ? "btn-primary" : "btn-secondary"} btn-full`} onClick={onSelect}>
          {selected ? (locale === "zh" ? "已选择" : "Selected") : (cta ?? (locale === "zh" ? "选择" : "Select"))}
        </button>
      ) : null}
    </div>
  );
}
