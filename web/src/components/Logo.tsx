// Light and dark app-icon tiles, swapped by the OS color scheme.
export function Logo({ size = 28, withName = true }: { size?: number; withName?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <picture className="shrink-0">
        <source srcSet="/brand/icon-dark-96.png" media="(prefers-color-scheme: dark)" />
        <img src="/brand/icon-light-96.png" alt={withName ? "" : "Elissya"} width={size} height={size} className="max-w-none" />
      </picture>
      {withName && <span className="font-display text-[19px] font-semibold tracking-tight">elissya</span>}
    </span>
  );
}
