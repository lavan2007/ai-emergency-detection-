import {
  CarFront,
  HeartPulse,
  Flame,
  Zap,
  Droplets,
  ShieldAlert,
  UserX,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  ringColor: string;
}

export const categoryConfig: Record<string, CategoryConfig> = {
  accident: {
    label: 'Accident',
    icon: CarFront,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    ringColor: 'ring-orange-400',
  },
  medical: {
    label: 'Medical',
    icon: HeartPulse,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    ringColor: 'ring-red-400',
  },
  fire: {
    label: 'Fire',
    icon: Flame,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    ringColor: 'ring-amber-400',
  },
  electrical: {
    label: 'Electrical',
    icon: Zap,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    ringColor: 'ring-yellow-400',
  },
  flood: {
    label: 'Flood',
    icon: Droplets,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    ringColor: 'ring-blue-400',
  },
  crime: {
    label: 'Crime',
    icon: ShieldAlert,
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    ringColor: 'ring-slate-400',
  },
  missing_person: {
    label: 'Missing Person',
    icon: UserX,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    ringColor: 'ring-purple-400',
  },
  normal: {
    label: 'Normal',
    icon: CheckCircle2,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    ringColor: 'ring-green-400',
  },
};

export interface SeverityConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
}

export const severityConfig: Record<string, SeverityConfig> = {
  high: {
    label: 'High',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-400',
    dotColor: 'bg-red-500',
  },
  medium: {
    label: 'Medium',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-400',
    dotColor: 'bg-orange-500',
  },
  low: {
    label: 'Low',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-400',
    dotColor: 'bg-green-500',
  },
};

export function getCategoryConfig(category: string): CategoryConfig {
  return categoryConfig[category] || categoryConfig.normal;
}

export function getSeverityConfig(severity: string): SeverityConfig {
  return severityConfig[severity] || severityConfig.low;
}

const dialectLabels: Record<string, string> = {
  tamil: 'Tamil',
  tanglish: 'Tanglish',
  english: 'English',
  colloquial_tamil: 'Colloquial Tamil',
};

export function getDialectLabel(dialect: string): string {
  return dialectLabels[dialect] || dialect.charAt(0).toUpperCase() + dialect.slice(1);
}
