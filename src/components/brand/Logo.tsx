/** Yuancheng mark: cinnabar seal (愿) + wordmark. Seal is the only cinnabar use. */
export function Logo({ wordmark = true, size = 28 }: { wordmark?: boolean; size?: number }) {
  return (
    <span className="yc-logo">
      <span className="yc-seal" style={{ width: size, height: size, fontSize: Math.round(size * 0.62) }} aria-hidden>愿</span>
      {wordmark ? <span className="yc-word">Yuancheng 愿成</span> : null}
    </span>
  );
}
