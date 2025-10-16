"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextMiniQuestionProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function TextMiniQuestion({
  label,
  value,
  placeholder = "Enter your answer...",
  onChange,
}: TextMiniQuestionProps) {
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="space-y-2">
      <Label className="block font-medium text-foreground">{label}</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={value}
            onChange={handleValueChange}
            placeholder={placeholder}
            className="h-9"
          />
        </div>
      </div>
    </div>
  );
}
