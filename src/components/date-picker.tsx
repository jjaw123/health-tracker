"use client";

import { Calendar } from "lucide-react";
import { toDateInputValue } from "@/lib/dates";

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function DatePicker({ value, onChange, label = "Date" }: Props) {
  const max = toDateInputValue();

  return (
    <div>
      <label className="input-label flex items-center gap-1.5">
        <Calendar size={14} /> {label}
      </label>
      <input
        type="date"
        value={value}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  );
}
