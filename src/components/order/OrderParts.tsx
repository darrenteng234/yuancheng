import { Check, Camera, Landmark, Info } from "lucide-react";
import { EVIDENCE_DISCLAIMER } from "@/lib/domain/evidence";

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
}: { items: { type: "photo" | "video"; url: string; label?: string }[]; locale?: string; disclaimer?: boolean }) {
  const zh = locale === "zh";
  if (!items.length) {
    return <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>{zh ? "尚未提交凭证。" : "Evidence has not been submitted yet."}</p>;
  }
  return (
    <div>
      <div className="evidence-gallery">
        {items.map((e, i) =>
          e.type === "video" ? (
            <video key={i} className="evidence-media" controls preload="metadata" src={e.url} />
          ) : (
            <a key={i} href={e.url} target="_blank" rel="noreferrer" className="evidence-media-wrap">
              <img className="evidence-media" src={e.url} alt={e.label ?? "Evidence"} />
              <span className="evidence-tag"><Camera size={12} /> {e.label}</span>
            </a>
          )
        )}
      </div>
      {disclaimer ? (
        <p className="evidence-disclaimer"><Info size={14} /> {zh
          ? "完成凭证记录服务商所提交的内容，并非宗教或精神结果的保证。"
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
