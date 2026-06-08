import * as React from "react";
import { cn } from "../cn";

/* ---------------------------------- Button --------------------------------- */
type ButtonVariant = "primary" | "ghost" | "soft";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}
export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn("lt-btn", `lt-btn--${variant}`, className)} {...props} />;
}

/* ----------------------------------- Card ---------------------------------- */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}
export function Card({ hover, className, ...props }: CardProps) {
  return <div className={cn("lt-card", hover && "lt-card--hover", className)} {...props} />;
}

/* ---------------------------------- Badge ---------------------------------- */
type Tone = "ok" | "warn" | "err" | "info";
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
