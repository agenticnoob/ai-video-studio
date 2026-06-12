import type { ButtonHTMLAttributes, FC, ReactNode } from "react";

import { cn } from "../../lib/utils";

type CardTone = "workspace" | "panel" | "nested" | "item" | "itemSelected";

const cardToneClassNameMap: Record<CardTone, string> = {
  workspace:
    "rounded-geist border border-foreground bg-background p-4 shadow-[0_20px_48px_rgba(0,0,0,0.22)]",
  panel:
    "rounded-geist border border-panel-border-color bg-panel-surface-color p-4 shadow-[0_16px_36px_rgba(0,0,0,0.18)]",
  nested:
    "rounded-geist border border-panel-border-color bg-background/40 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.14)]",
  item: "rounded-geist border border-panel-border-color bg-background p-3 text-foreground shadow-[0_8px_18px_rgba(0,0,0,0.12)]",
  itemSelected:
    "rounded-geist border border-foreground bg-foreground p-3 text-background shadow-[0_10px_22px_rgba(0,0,0,0.16)]",
};

export const getCardClassName = (tone: CardTone, className?: string) =>
  cn(cardToneClassNameMap[tone], className);

export const Card: FC<{
  as?: "div" | "section";
  children: ReactNode;
  className?: string;
  tone?: Exclude<CardTone, "itemSelected">;
}> = ({ as = "div", children, className, tone = "panel" }) => {
  const Component = as;

  return <Component className={getCardClassName(tone, className)}>{children}</Component>;
};

export const CardButton: FC<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    className?: string;
    selected?: boolean;
  }
> = ({ children, className, selected = false, type = "button", ...props }) => {
  return (
    <button
      className={getCardClassName(selected ? "itemSelected" : "item", className)}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};
