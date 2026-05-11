type TierBadgeProps = {
  tier: string;
  subtitle: string;
  description: string;
  highlight?: boolean;
};

export default function TierBadge({ tier, subtitle, description, highlight }: TierBadgeProps) {
  return (
    <div className={`rounded-3xl border p-6 shadow-xl shadow-black/20 ${highlight ? 'border-brand-gold bg-white/10' : 'border-white/10 bg-white/5'}`}>
      <p className="text-sm uppercase tracking-[0.3em] text-brand-pink">{tier}</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">{subtitle}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
