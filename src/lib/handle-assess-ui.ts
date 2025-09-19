// hooks/useAnswerHandlers.ts
import { useCallback } from "react";

export interface AnswerProps {
  id: string;
  value: string;
  questionId: string;
  optionId?: string;
}

export const useAnswerHandlers = (
  onAnswerChange: (questionId: string, answers: AnswerProps[]) => void
) => {
  const handleCheckboxChange = useCallback(
    (questionId: string, newAnswers: AnswerProps[]) => {
      console.log("Checkbox changed for question:", questionId, newAnswers);
      onAnswerChange(questionId, newAnswers);
    },
    [onAnswerChange]
  );

  const handleRadioChange = useCallback(
    (questionId: string, newAnswer: AnswerProps | null) => {
      console.log("Radio changed for question:", questionId, newAnswer);
      onAnswerChange(questionId, newAnswer ? [newAnswer] : []);
    },
    [onAnswerChange]
  );

  const handleSliderChange = useCallback(
    (questionId: string, newValue: number) => {
      console.log("Slider changed for question:", questionId, newValue);
      onAnswerChange(questionId, [
        { id: `${questionId}-slider`, value: newValue.toString(), questionId },
      ]);
    },
    [onAnswerChange]
  );

  const handleTextChange = useCallback(
    (questionId: string, newValue: string) => {
      console.log("Text changed for question:", questionId, newValue);
      onAnswerChange(questionId, [
        { id: `${questionId}-text`, value: newValue, questionId },
      ]);
    },
    [onAnswerChange]
  );

  const handleRiskGroupChange = useCallback(
    (
      questionId: string,
      newChecked: { probability: AnswerProps | null; impact: AnswerProps | null }
    ) => {
      // Parse the individual values to extract the actual data
      const probabilityData = newChecked.probability 
        ? JSON.parse(newChecked.probability.value)
        : null;
      const impactData = newChecked.impact 
        ? JSON.parse(newChecked.impact.value)
        : null;

      const riskValue = {
        probability: probabilityData,
        impact: impactData,
      };

      const riskAnswer: AnswerProps = {
        id: `${questionId}-risk`,
        value: JSON.stringify(riskValue), // store as JSON string
        questionId,
      };

      console.log("Risk group changed for question:", questionId, riskAnswer);
      onAnswerChange(questionId, [riskAnswer]);
    },
    [onAnswerChange]
  );

  return { handleCheckboxChange, handleRadioChange, handleSliderChange, handleTextChange, handleRiskGroupChange };
};
