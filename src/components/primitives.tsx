import * as React from "react";
import { cn } from "../cn";

/* ---------------------------------- Button --------------------------------- */
type ButtonVariant = "primary" | "ghost" | "soft" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** md = standard (défaut) ; sm = action inline ; lg = CTA proéminent. */
  size?: ButtonSize;
}
export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "lt-btn",
        `lt-btn--${variant}`,
        size === "sm" && "lt-btn--sm",
        size === "lg" && "lt-btn--lg",
        className,
      )}
      {...props}
    />
  );
}

/* ----------------------------------- Card ---------------------------------- */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  /** Ombre portée. Défaut true. false = carte plate (sur fond déjà contrasté). */
  elevated?: boolean;
  /** Padding interne 24px (opt-in). Défaut true. false = AUCUN padding posé par
   *  le package → l'écran impose le sien via className (p-4, p-5…). */
  padded?: boolean;
}
export function Card({ hover, elevated = true, padded = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "lt-card",
        hover && "lt-card--hover",
        !elevated && "lt-card--flat",
        padded && "lt-card--pad",
        className,
      )}
      {...props}
    />
  );
}

/* ---------------------------------- Badge ---------------------------------- */
type Tone = "ok" | "warn" | "err" | "info" | "neutral" | "accent";
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Point coloré devant le libellé (style « option 2 » validé). Défaut true ;
   *  passer dot={false} pour un badge sans point. */
  dot?: boolean;
}
export function Badge({ tone = "ok", dot = true, children, className, ...props }: BadgeProps) {
  return (
    <span className={cn("lt-badge", `lt-badge--${tone}`, className)} {...props}>
      {dot && <span className="lt-dot" />}
      {children}
    </span>
  );
}

/* --------------------------------- StatCard -------------------------------- */
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: React.ReactNode;
  label: React.ReactNode;
}
export function StatCard({ value, label, className, ...props }: StatCardProps) {
  return (
    <div className={cn("lt-stat", className)} {...props}>
      <div className="lt-stat__v">{value}</div>
      <div className="lt-stat__k">{label}</div>
    </div>
  );
}

/* --------------------------------- StatTile -------------------------------- */
/**
 * LA TUILE DE CHIFFRE — basse (64 px), libellé et chiffre CENTRÉS, sans ligne
 * dessous. Née de l'écran Appels du CRM (maquette validée le 02/11/2026) : c'est
 * le référent de TOUT écran de chiffres refait ensuite.
 *  - `label` et `value` acceptent un bouton ou un lien (le chiffre mène à ce
 *    qu'il compte) : ils en héritent la typographie. Un libellé long se tronque
 *    s'il est du texte, ou s'il est mis dans un `<span>` à l'intérieur du bouton ;
 *  - `aside` : ce qui décompose le chiffre, sur le CÔTÉ (« 15 intéressés »),
 *    jamais dessous — la tuile reste basse : DEUX `StatTileAside` au plus ;
 *  - `dashed` : une information hors du tunnel ou de la période (le stock) ;
 *  - `children` : un détail flottant éventuel (la tuile est `position: relative`
 *    et passe au-dessus de ses voisines au survol ou quand `active`).
 * Les styles vivent dans `@layer components` : un `className` Tailwind les surcharge.
 */
export interface StatTileProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label: React.ReactNode;
  value: React.ReactNode;
  aside?: React.ReactNode;
  dashed?: boolean;
  active?: boolean;
  children?: React.ReactNode;
}
export const StatTile = React.forwardRef<HTMLDivElement, StatTileProps>(function StatTile(
  { label, value, aside, dashed, active, className, children, ...props },
  ref,
) {
  // Un tableau vide est « vrai » : compter, sinon un rail vide décentre le chiffre.
  const aDuCote = React.Children.count(aside) > 0;
  return (
    <div ref={ref} className={cn("lt-tile", dashed && "lt-tile--dashed", active && "lt-tile--active", className)} {...props}>
      <div className="lt-tile__main">
        <div className="lt-tile__k">{typeof label === "string" ? <span>{label}</span> : label}</div>
        <div className="lt-tile__v">{value}</div>
      </div>
      {aDuCote ? <div className="lt-tile__aside">{aside}</div> : null}
      {children}
    </div>
  );
});

/** Une ligne du côté d'une `StatTile` : le chiffre en gras, puis ses mots. Cliquable si `onClick`. */
export interface StatTileAsideProps {
  value: React.ReactNode;
  label: React.ReactNode;
  onClick?: () => void;
}
export function StatTileAside({ value, label, onClick }: StatTileAsideProps) {
  const contenu = (
    <>
      <b>{value}</b>
      <span>{label}</span>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className="lt-tile__aside-row">
      {contenu}
    </button>
  ) : (
    <span className="lt-tile__aside-row">{contenu}</span>
  );
}

/**
 * La flèche d'un tunnel entre deux tuiles, avec son taux. Visible par défaut :
 * l'écran qui porte la grille la cache là où les tuiles se rangent autrement
 * (`className="hidden xl:flex"`). Le libellé est lu par les lecteurs d'écran.
 */
export function FunnelArrow({ rate, label, className }: { rate: React.ReactNode; label: string; className?: string }) {
  return (
    <div className={cn("lt-funnel-arrow", className)} title={label}>
      <span className="lt-sr-only">{label} : </span>
      <span aria-hidden="true">{rate}</span>
      <svg viewBox="0 0 34 14" width="28" height="12" aria-hidden="true" fill="none" strokeWidth="1.6">
        <path d="M1 7h30M25 2l6 5-6 5" />
      </svg>
    </div>
  );
}

/**
 * Le filet qui ÉCARTE une information du tunnel (le stock). `vertical` à côté des
 * tuiles, `horizontal` quand elles s'empilent ; l'écran pose l'un ou l'autre selon
 * sa grille (`className="hidden xl:flex"` / `"xl:hidden"`).
 */
export function FunnelDivider({ orientation = "vertical", className }: { orientation?: "vertical" | "horizontal"; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("lt-funnel-divider", `lt-funnel-divider--${orientation}`, className)}>
      <span />
    </div>
  );
}

/* -------------------------------- ProgressBar ------------------------------ */
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0..100
}
export function ProgressBar({ value, className, ...props }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("lt-bar", className)} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} {...props}>
      <i style={{ width: `${v}%` }} />
    </div>
  );
}

/* -------------------------------- ProgressRing ----------------------------- */
export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Valeur courante (0..max). */
  value: number;
  /** Borne haute. Défaut 100. */
  max?: number;
  /** Diamètre en px. Défaut 76. */
  size?: number;
  /** Épaisseur du trait. Défaut 7. */
  thickness?: number;
  /** Couleur de l'arc rempli. Défaut var(--primary). Accepte n'importe quelle
   *  couleur CSS / var() (ex. "var(--success)", "#86C2A0"). */
  color?: string;
  /** Couleur de la piste. Défaut var(--lt-ring-track). */
  trackColor?: string;
  /** Extrémités arrondies. Défaut true. */
  rounded?: boolean;
  /** Contenu centré (valeur, libellé court…). */
  children?: React.ReactNode;
}
export function ProgressRing({
  value,
  max = 100,
  size = 76,
  thickness = 7,
  color = "var(--primary)",
  trackColor = "var(--lt-ring-track)",
  rounded = true,
  className,
  children,
  style,
  ...props
}: ProgressRingProps) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const c = size / 2;
  return (
    <div
      className={cn("lt-ring", className)}
      style={{ width: size, height: size, ...style }}
      role="img"
      aria-label={`${Math.round(pct * 100)}%`}
      {...props}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="lt-ring__svg">
        <circle cx={c} cy={c} r={r} fill="none" stroke={trackColor} strokeWidth={thickness} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap={rounded ? "round" : "butt"}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          transform={`rotate(-90 ${c} ${c})`}
          className="lt-ring__val"
        />
      </svg>
      {children != null && <div className="lt-ring__c">{children}</div>}
    </div>
  );
}

/* ----------------------------------- Logo ---------------------------------- */
export function Logo({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  // .logo-mark ajoute le point terracotta via ::after
  return (
    <span className={cn("logo-mark", className)} {...props}>
      Latitude
    </span>
  );
}

/* ------------------------------- SectionLabel ------------------------------ */
export function SectionLabel({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("section-label", className)} {...props} />;
}
