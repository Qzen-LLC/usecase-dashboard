"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TextQuestionProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function TextQuestion({
  label,
  value,
  placeholder = "Enter your answer...",
  onChange,
}: TextQuestionProps) {
  // console.log('TextQuestion rendered with value:', value); // Debug log
  
  const handleValueChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="space-y-4">
      <Label className="block font-medium text-foreground">{label}</Label>
      <Textarea
        value={value}
        onChange={handleValueChange}
        placeholder={placeholder}
        className="min-h-20"
      />
    </div>
  );
}
