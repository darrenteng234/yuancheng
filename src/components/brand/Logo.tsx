/** Yuancheng mark: cinnabar seal (愿) + wordmark. Seal is the only cinnabar use.
 *  `light` renders the wordmark in a light colour for dark backgrounds (footer). */
export function Logo({ wordmark = true, size = 28, light = false }: { wordmark?: boolean; size?: number; light?: boolean }) {
  return (
    <span className={`yc-logo${light ? " yc-logo--light" : ""}`}>
      <span className="yc-seal" style={{ width: size, height: size, fontSize: Math.round(size * 0.62) }} aria-hidden>愿</span>
      {wordmark ? <span className="yc-word">Yuancheng 愿成</span> : null}
    </span>
  );
}
