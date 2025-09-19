"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OptionProps {
  id: string;
  text: string; // prefixed with "pro:" or "imp:"
  questionId: string;
}

interface AnswerProps {
  id: string;
  value: string; // JSONB string like { "optionId": "uuid", "label": "Low" }
  questionId: string;
  optionId?: string;
}

interface RiskQuestionProps {
  label: string;
  probabilityOptions: OptionProps[];
  impactOptions: OptionProps[];
  checkedAnswers: {
    probability: AnswerProps | null;
    impact: AnswerProps | null;
  };
  onChange: (newChecked: {
    probability: AnswerProps | null;
    impact: AnswerProps | null;
  }) => void;
}

export function RiskQuestion({
  label,
  probabilityOptions,
  impactOptions,
  checkedAnswers,
  onChange,
}: RiskQuestionProps) {
  const handleProbabilityChange = (optionId: string) => {
    const selected = probabilityOptions.find((o) => o.id === optionId);
    if (selected) {
      const cleanLabel = selected.text.replace(/^pro:/, "");
      const probabilityData = { optionId: selected.id, label: cleanLabel };
      
      // Create or update the combined answer
      const currentProbability = checkedAnswers.probability;
      const currentImpact = checkedAnswers.impact;
      
      const combinedValue = {
        probability: probabilityData,
        impact: currentImpact ? JSON.parse(currentImpact.value) : null
      };
      
      const newAnswer: AnswerProps = {
        id: `${selected.questionId}-risk`,
        value: JSON.stringify(combinedValue),
        questionId: selected.questionId,
        optionId: selected.id,
      };
      
      onChange({
        probability: {
          id: `${selected.questionId}-probability`,
          value: JSON.stringify(probabilityData),
          questionId: selected.questionId,
          optionId: selected.id,
        },
        impact: currentImpact
      });
    }
  };

  const handleImpactChange = (optionId: string) => {
    const selected = impactOptions.find((o) => o.id === optionId);
    if (selected) {
      const cleanLabel = selected.text.replace(/^imp:/, "");
      const impactData = { optionId: selected.id, label: cleanLabel };
      
      // Create or update the combined answer
      const currentProbability = checkedAnswers.probability;
      const currentImpact = checkedAnswers.impact;
      
      const combinedValue = {
        probability: currentProbability ? JSON.parse(currentProbability.value) : null,
        impact: impactData
      };
      
      const newAnswer: AnswerProps = {
        id: `${selected.questionId}-risk`,
        value: JSON.stringify(combinedValue),
        questionId: selected.questionId,
        optionId: selected.id,
      };
      
      onChange({
        probability: currentProbability,
        impact: {
          id: `${selected.questionId}-impact`,
          value: JSON.stringify(impactData),
          questionId: selected.questionId,
          optionId: selected.id,
        }
      });
    }
  };

  // Extract stored values for select (use optionId inside JSONB)
  const probabilityValue = checkedAnswers.probability
    ? JSON.parse(checkedAnswers.probability.value).optionId
    : "";
  const impactValue = checkedAnswers.impact
    ? JSON.parse(checkedAnswers.impact.value).optionId
    : "";

  return (
    <div>
      <Label className="block font-medium mb-4 text-foreground">{label}</Label>
      <div className="flex gap-8">
        {/* Probability Select */}
        <div className="flex flex-col gap-2">
          <Label>Probability</Label>
          <Select
            value={probabilityValue}
            onValueChange={handleProbabilityChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select probability" />
            </SelectTrigger>
            <SelectContent>
              {probabilityOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.text.replace(/^pro:/, "")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Impact Select */}
        <div className="flex flex-col gap-2">
          <Label>Impact</Label>
          <Select value={impactValue} onValueChange={handleImpactChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select impact" />
            </SelectTrigger>
            <SelectContent>
              {impactOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.text.replace(/^imp:/, "")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
