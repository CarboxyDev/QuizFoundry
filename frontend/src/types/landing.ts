import { LucideIcon } from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bg: string;
}

export interface Step {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Stat {
  number: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}