import * as React from "react";
import { cn } from "../cn";

/* ---------------------------------- Button --------------------------------- */
type ButtonVariant = "primary" | "ghost" | "soft" | "outline" | "danger";
type ButtonSize = "sm" | "md";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** md = bouton standard (défaut) ; sm = action inline sur carte/ligne. */
  size?: ButtonSize;
}
export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn("lt-btn", `lt-btn--${variant}`, size === "sm" && "lt-btn--sm", className)}
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
  dot?: boolean;
}
export function Badge({ tone = "ok", dot, children, className, ...props }: BadgeProps) {
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
