export function MathBackground() {
  return (
    <div className="math-global-background" aria-hidden="true">
      <div className="math-global-grid" />
      <svg
        className="math-global-curve math-global-curve-a"
        viewBox="0 0 800 320"
        fill="none"
        preserveAspectRatio="none"
      >
        <path d="M-20 268 C 150 250, 210 30, 395 118 S 620 315, 830 44" />
        <path className="math-global-curve-secondary" d="M-20 205 C 140 65, 270 345, 460 162 S 690 42, 830 205" />
      </svg>
      <span className="math-global-symbol math-global-symbol-1">π</span>
      <span className="math-global-symbol math-global-symbol-2">Σ</span>
      <span className="math-global-symbol math-global-symbol-3">x²</span>
      <span className="math-global-symbol math-global-symbol-4">∞</span>
      <span className="math-global-symbol math-global-symbol-5">∫</span>
      <span className="math-global-symbol math-global-symbol-6">θ</span>
    </div>
  );
}
