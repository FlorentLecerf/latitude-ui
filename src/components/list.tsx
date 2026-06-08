import * as React from "react";
import { cn } from "../cn";

/**
 * Liste de cartes (pas un tableau Excel) : chaque ligne flotte, séparée.
 * `cols` est une valeur grid-template-columns partagée par l'en-tête et les
 * lignes via la variable CSS --lt-cols (héritée).
 *
 * <List cols="1.6fr 1.4fr 1fr .8fr">
 *   <ListHead><span>Prospect</span>…<span className="lt-r">Valeur</span></ListHead>
 *   <ListRow clickable><span className="lt-nm">Camille</span>…</ListRow>
 * </List>
 */
export interface ListProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: string;
}
export function List({ cols, className, style, ...props }: ListProps) {
  const mergedStyle = cols ? ({ ...style, ["--lt-cols" as string]: cols } as React.CSSProperties) : style;
  return <div className={cn("lt-list", className)} style={mergedStyle} {...props} />;
}

export function ListHead({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("lt-list-head", className)} {...props} />;
}

export interface ListRowProps extends React.HTMLAttributes<HTMLDivElement> {
  clickable?: boolean;
}
export function ListRow({ clickable, className, ...props }: ListRowProps) {
  return <div className={cn("lt-list-row", clickable && "lt-list-row--clickable", className)} {...props} />;
}

/** Pilule d'étape / statut (pipeline). */
export function Pill({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("lt-pill", className)} {...props} />;
}
