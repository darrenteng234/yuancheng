import Link from "next/link";
import { MapPin, ShieldCheck, Camera, Video, Store, ArrowRight, Package } from "lucide-react";

/** Reusable discovery cards. Pure presentational — data passed in by the page. */

export interface ServiceCardData {
  slug: string;
  name: string;
  provider: string;
  place?: string;
  price: string;         // pre-formatted, e.g. "RM 88"
  verified?: boolean;
  evidence?: "none" | "photo" | "photo_video";
  fulfilment?: string;   // e.g. "Provider fulfilled"
  image?: string;
}

const EVIDENCE_LABEL: Record<NonNullable<ServiceCardData["evidence"]>, string> = {
  none: "No evidence",
  photo: "Photo",
  photo_video: "Photo + video",
};

function Thumb({ image, label }: { image?: string; label: string }) {
  if (image) return <img src={image} alt={label} className="card-thumb" />;
  return <div className="card-thumb card-thumb--placeholder" aria-hidden><Store size={28} /></div>;
}

export function ServiceCard({ locale, s }: { locale: string; s: ServiceCardData }) {
  return (
    <Link href={`/${locale}/services/${s.slug}`} className="disc-card">
      <Thumb image={s.image} label={s.name} />
      <div className="disc-card-body">
        <div className="disc-card-title">{s.name}</div>
        <div className="disc-card-sub">{s.provider}</div>
        {s.place ? (
          <div className="disc-card-meta"><MapPin size={13} /> {s.place}</div>
        ) : null}
        <div className="disc-card-tags">
          {s.verified ? <span className="tag tag--verified"><ShieldCheck size={13} /> Verified provider</span> : null}
          {s.evidence && s.evidence !== "none" ? (
            <span className="tag">{s.evidence === "photo_video" ? <Video size={13} /> : <Camera size={13} />} {EVIDENCE_LABEL[s.evidence]}</span>
          ) : null}
          {s.fulfilment ? <span className="tag">{s.fulfilment}</span> : null}
        </div>
        <div className="disc-card-foot">
          <span className="disc-card-price">{s.price}</span>
          <span className="disc-card-cta">View service <ArrowRight size={15} /></span>
        </div>
      </div>
    </Link>
  );
}

export interface ProviderCardData {
  slug: string; name: string; place?: string; verified?: boolean; serviceCount?: number;
}
export function ProviderCard({ locale, p }: { locale: string; p: ProviderCardData }) {
  return (
    <Link href={`/${locale}/providers/${p.slug}`} className="disc-card disc-card--row">
      <div className="card-thumb card-thumb--placeholder" aria-hidden><Store size={24} /></div>
      <div className="disc-card-body">
        <div className="disc-card-title">{p.name}</div>
        {p.place ? <div className="disc-card-meta"><MapPin size={13} /> {p.place}</div> : null}
        <div className="disc-card-tags">
          {p.verified ? <span className="tag tag--verified"><ShieldCheck size={13} /> Verified provider</span> : null}
          {typeof p.serviceCount === "number" ? <span className="tag">{p.serviceCount} services</span> : null}
        </div>
      </div>
    </Link>
  );
}

export interface PlaceCardData {
  slug: string; name: string; location?: string; providerCount?: number; serviceCount?: number;
}
export function PlaceCard({ locale, pl }: { locale: string; pl: PlaceCardData }) {
  return (
    <Link href={`/${locale}/places/${pl.slug}`} className="disc-card">
      <div className="card-thumb card-thumb--placeholder" aria-hidden><MapPin size={28} /></div>
      <div className="disc-card-body">
        <div className="disc-card-title">{pl.name}</div>
        {pl.location ? <div className="disc-card-meta"><MapPin size={13} /> {pl.location}</div> : null}
        <div className="disc-card-stats">
          <span><strong>{pl.providerCount ?? 0}</strong> providers</span>
          <span><strong>{pl.serviceCount ?? 0}</strong> services</span>
        </div>
      </div>
    </Link>
  );
}

export interface ProductCardData {
  slug: string; name: string; provider: string; price: string; image?: string;
}
export function ProductCard({ locale, pr }: { locale: string; pr: ProductCardData }) {
  return (
    <Link href={`/${locale}/products/${pr.slug}`} className="disc-card">
      <Thumb image={pr.image} label={pr.name} />
      <div className="disc-card-body">
        <div className="disc-card-title">{pr.name}</div>
        <div className="disc-card-sub">{pr.provider}</div>
        <div className="disc-card-tags"><span className="tag"><Package size={13} /> Physical product</span></div>
        <div className="disc-card-foot">
          <span className="disc-card-price">{pr.price}</span>
          <span className="disc-card-cta">Contact provider <ArrowRight size={15} /></span>
        </div>
      </div>
    </Link>
  );
}
