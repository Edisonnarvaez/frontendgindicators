import React from "react";

interface Props {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function FilterSelect({ label, options, value, onChange }: Props) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring focus:border-blue-300"
      >
        <option value="">Todos</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
