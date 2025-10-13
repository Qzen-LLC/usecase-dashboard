"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useStableRender } from "@/hooks/useStableRender";
import { useUserData } from "@/contexts/UserContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Loader2,
  Filter,
  X,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuestionType, Stage } from "@/generated/prisma";

// Helper functions for labels
const getQuestionTypeLabel = (type: QuestionType) => {
  switch (type) {
    case QuestionType.CHECKBOX: return "Checkbox";
    case QuestionType.RADIO: return "Radio";
    case QuestionType.TEXT: return "Text";
    case QuestionType.SLIDER: return "Slider";
    case QuestionType.RISK: return "Risk";
    default: return type;
  }
};

const getStageLabel = (stage: Stage) => {
  switch (stage) {
    case Stage.TECHNICAL_FEASIBILITY: return "Technical Feasibility";
    case Stage.BUSINESS_FEASIBILITY: return "Business Feasibility";
    case Stage.ETHICAL_IMPACT: return "Ethical Impact";
    case Stage.RISK_ASSESSMENT: return "Risk Assessment";
    case Stage.DATA_READINESS: return "Data Readiness";
    case Stage.ROADMAP_POSITION: return "Roadmap Position";
    case Stage.BUDGET_PLANNING: return "Budget Planning";
    default: return stage;
  }
};

interface QuestionTemplate {
  id: string;
  text: string;
  type: QuestionType;
  stage: Stage;
  optionTemplates: OptionTemplate[];
  isInactive: boolean;
  technicalOrderIndex?: number;
  businessOrderIndex?: number;
  ethicalOrderIndex?: number;
  riskOrderIndex?: number;
  dataOrderIndex?: number;
  roadmapOrderIndex?: number;
  budgetOrderIndex?: number;
}

interface OptionTemplate {
  id: string;
  text: string;
  questionTemplateId: string;
}

// Sortable Question Template Component
const SortableQuestionTemplate = ({ questionTemplate, isPending, currentOperationStatus, reorderMode, handleToggleInactive, openEditDialog, handleDeleteQuestion }: {
  questionTemplate: QuestionTemplate;
  isPending: boolean;
  currentOperationStatus: string;
  reorderMode: boolean;
  handleToggleInactive: (id: string, currentStatus: boolean) => void;
  openEditDialog: (questionTemplate: QuestionTemplate) => void;
  handleDeleteQuestion: (id: string, text: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: questionTemplate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-xl p-6 hover:shadow-md transition-all duration-200 ${
        isPending 
          ? 'border-yellow-300 bg-yellow-50/50' 
          : currentOperationStatus === 'error'
          ? 'border-red-300 bg-red-50/50'
          : 'border-border'
      } ${reorderMode ? 'cursor-move' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            {reorderMode && (
              <div 
                className="flex items-center justify-center w-6 h-6 text-muted-foreground cursor-move"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="w-4 h-4" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-foreground">
              {questionTemplate.text}
            </h3>
            {isPending && (
              <Badge variant="outline" className="px-3 py-1 rounded-full border-yellow-300 text-yellow-700 bg-yellow-100">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Processing...
              </Badge>
            )}
            {currentOperationStatus === 'error' && (
              <Badge variant="outline" className="px-3 py-1 rounded-full border-red-300 text-red-700 bg-red-100">
                <AlertCircle className="w-3 h-3 mr-1" />
                Failed
              </Badge>
            )}
            {questionTemplate.isInactive && (
              <Badge variant="outline" className="px-3 py-1 rounded-full border-orange-300 text-orange-700 bg-orange-100">
                <X className="w-3 h-3 mr-1" />
                Inactive
              </Badge>
            )}
            <Badge variant="secondary" className="px-3 py-1 rounded-full">
              {getQuestionTypeLabel(questionTemplate.type)}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 rounded-full">
              {getStageLabel(questionTemplate.stage)}
            </Badge>
          </div>
        
          {questionTemplate.optionTemplates.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Options:
              </p>
              <div className="flex flex-wrap gap-2">
                {questionTemplate.type === QuestionType.RISK ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Probability:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {questionTemplate.optionTemplates
                          .filter(opt => opt.text.startsWith('pro:'))
                          .map((option, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="px-2 py-1 text-xs"
                            >
                              {option.text.replace('pro:', '')}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Impact:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {questionTemplate.optionTemplates
                          .filter(opt => opt.text.startsWith('imp:'))
                          .map((option, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="px-2 py-1 text-xs"
                            >
                              {option.text.replace('imp:', '')}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  questionTemplate.optionTemplates.map((option, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-2 py-1 text-xs"
                    >
                      {option.text}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleInactive(questionTemplate.id, questionTemplate.isInactive)}
            disabled={isPending || reorderMode}
            className={`border-border hover:bg-muted disabled:opacity-50 ${
              questionTemplate.isInactive 
                ? 'text-orange-600 border-orange-300 hover:bg-orange-50' 
                : 'text-green-600 border-green-300 hover:bg-green-50'
            }`}
          >
            {questionTemplate.isInactive ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Deactivate
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDialog(questionTemplate)}
            disabled={isPending || reorderMode}
            className="border-border text-foreground hover:bg-muted disabled:opacity-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteQuestion(questionTemplate.id, questionTemplate.text)}
            disabled={isPending || reorderMode}
            className="border-destructive text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

interface NewQuestionTemplate {
  text: string;
  type: QuestionType;
  stage: Stage;
  optionTemplates: string[];
}

export default function ConfigureQuestionTemplatesPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { userData } = useUserData();
  console.log(userData);
  const router = useRouter();
  const { isReady } = useStableRender();

  const [questionTemplates, setQuestionTemplates] = useState<QuestionTemplate[]>([]);
  const [filteredQuestionTemplates, setFilteredQuestionTemplates] = useState<QuestionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>("all");
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestionTemplate, setEditingQuestionTemplate] = useState<QuestionTemplate | null>(null);
  
  // Form states
  const [newQuestionTemplate, setNewQuestionTemplate] = useState<NewQuestionTemplate>({
    text: "",
    type: QuestionType.TEXT,
    stage: Stage.TECHNICAL_FEASIBILITY,
    optionTemplates: [""],
  });
  
  const [editQuestionTemplate, setEditQuestionTemplate] = useState<NewQuestionTemplate>({
    text: "",
    type: QuestionType.TEXT,
    stage: Stage.TECHNICAL_FEASIBILITY,
    optionTemplates: [""],
  });

  // RISK question specific states
  const [newRiskOptions, setNewRiskOptions] = useState({
    probability: ["LOW", "MEDIUM", "HIGH"],
    impact: ["LOW", "MEDIUM", "HIGH"]
  });
  
  const [editRiskOptions, setEditRiskOptions] = useState({
    probability: ["LOW", "MEDIUM", "HIGH"],
    impact: ["LOW", "MEDIUM", "HIGH"]
  });
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingOperations, setPendingOperations] = useState<Map<string, 'add' | 'edit' | 'delete'>>(new Map());
  const [operationStatus, setOperationStatus] = useState<Map<string, 'pending' | 'success' | 'error'>>(new Map());
  const [reorderMode, setReorderMode] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper function to generate temporary ID for optimistic updates
  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Helper function to perform background operation with retry
  const performBackgroundOperation = async (
    operationId: string,
    operation: () => Promise<any>,
    onSuccess: () => void,
    onError: (error: string) => void,
    maxRetries: number = 3
  ) => {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        await operation();
        setOperationStatus(prev => new Map(prev).set(operationId, 'success'));
        onSuccess();
        
        // Remove from pending operations after a delay
        setTimeout(() => {
          setPendingOperations(prev => {
            const newMap = new Map(prev);
            newMap.delete(operationId);
            return newMap;
          });
          setOperationStatus(prev => {
            const newMap = new Map(prev);
            newMap.delete(operationId);
            return newMap;
          });
        }, 2000);
        
        return;
      } catch (error: any) {
        retries++;
        if (retries >= maxRetries) {
          setOperationStatus(prev => new Map(prev).set(operationId, 'error'));
          onError(error.message || 'Operation failed');
          
          // Remove from pending operations after showing error
          setTimeout(() => {
            setPendingOperations(prev => {
              const newMap = new Map(prev);
              newMap.delete(operationId);
              return newMap;
            });
            setOperationStatus(prev => {
              const newMap = new Map(prev);
              newMap.delete(operationId);
              return newMap;
            });
          }, 5000);
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }
  };

  const fetchQuestionTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/question-templates`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch question templates");
      }
      setQuestionTemplates(data.questionTemplates || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Filter questions based on selected stage
  useEffect(() => {
    if (selectedStage === "all") {
      setFilteredQuestionTemplates(questionTemplates);
    } else {
      const filtered = questionTemplates.filter(q => q.stage === selectedStage);
      // Sort by order index for the selected stage
      filtered.sort((a, b) => {
        const orderA = getOrderIndex(a, selectedStage as Stage);
        const orderB = getOrderIndex(b, selectedStage as Stage);
        return orderA - orderB;
      });
      setFilteredQuestionTemplates(filtered);
    }
  }, [questionTemplates, selectedStage]);

  const handleAddQuestion = async () => {
    if (!newQuestionTemplate.text.trim()) {
      setError("Question text is required");
      return;
    }

    // Prepare the data to send
    let dataToSend = { ...newQuestionTemplate };
    
    // For RISK questions, combine probability and impact options with prefixes
    if (newQuestionTemplate.type === QuestionType.RISK) {
      const probabilityOptions = newRiskOptions.probability.filter(opt => opt.trim());
      const impactOptions = newRiskOptions.impact.filter(opt => opt.trim());
      
      if (probabilityOptions.length === 0 || impactOptions.length === 0) {
        setError("Both probability and impact options are required for risk questions");
        return;
      }
      
      // Create combined options with prefixes
      dataToSend.optionTemplates = [
        ...probabilityOptions.map(opt => `pro:${opt.trim()}`),
        ...impactOptions.map(opt => `imp:${opt.trim()}`)
      ];
    }

    // Generate temporary ID for optimistic update
    const tempId = generateTempId();
    const operationId = `add_${tempId}`;

    // Create optimistic question template object
    const optimisticQuestionTemplate: QuestionTemplate = {
      id: tempId,
      text: dataToSend.text,
      type: dataToSend.type,
      stage: dataToSend.stage,
      isInactive: false,
      optionTemplates: dataToSend.optionTemplates.map(opt => ({
        id: `temp_opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: opt,
        questionTemplateId: tempId
      }))
    };

    // Optimistically add the question template to the UI
    setQuestionTemplates(prev => [optimisticQuestionTemplate, ...prev]);
    setPendingOperations(prev => new Map(prev).set(operationId, 'add'));
    setOperationStatus(prev => new Map(prev).set(operationId, 'pending'));

    // Clear form and close dialog immediately
    setNewQuestionTemplate({
      text: "",
      type: QuestionType.TEXT,
      stage: Stage.TECHNICAL_FEASIBILITY,
      optionTemplates: [""],
    });
    setNewRiskOptions({
      probability: ["LOW", "MEDIUM", "HIGH"],
      impact: ["LOW", "MEDIUM", "HIGH"]
    });
    setIsAddDialogOpen(false);
    setError(null);
    setSuccess("Question template added! Processing in background...");

    // Perform background operation
    performBackgroundOperation(
      operationId,
      async () => {
        const response = await fetch(`/api/question-templates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to create question template");
        }

        // Replace optimistic question template with real one
        setQuestionTemplates(prev => prev.map(q => q.id === tempId ? data.questionTemplate : q));
      },
      () => {
        setSuccess("Question template created successfully!");
      },
      (error) => {
        // Rollback optimistic update
        setQuestionTemplates(prev => prev.filter(q => q.id !== tempId));
        setError(`Failed to create question template: ${error}`);
      }
    );
  };

  const handleEditQuestion = async () => {
    if (!editingQuestionTemplate || !editQuestionTemplate.text.trim()) {
      setError("Question text is required");
      return;
    }

    // Prepare the data to send
    let dataToSend = { ...editQuestionTemplate };
    
    // For RISK questions, combine probability and impact options with prefixes
    if (editQuestionTemplate.type === QuestionType.RISK) {
      const probabilityOptions = editRiskOptions.probability.filter(opt => opt.trim());
      const impactOptions = editRiskOptions.impact.filter(opt => opt.trim());
      
      if (probabilityOptions.length === 0 || impactOptions.length === 0) {
        setError("Both probability and impact options are required for risk questions");
        return;
      }
      
      // Create combined options with prefixes
      dataToSend.optionTemplates = [
        ...probabilityOptions.map(opt => `pro:${opt.trim()}`),
        ...impactOptions.map(opt => `imp:${opt.trim()}`)
      ];
    }

    const operationId = `edit_${editingQuestionTemplate.id}`;
    const originalQuestionTemplate = questionTemplates.find(q => q.id === editingQuestionTemplate.id);

    // Store original question template for rollback
    if (!originalQuestionTemplate) {
      setError("Question template not found");
      return;
    }

    // Create optimistic question template object
    const optimisticQuestionTemplate: QuestionTemplate = {
      ...originalQuestionTemplate,
      text: dataToSend.text,
      type: dataToSend.type,
      stage: dataToSend.stage,
      optionTemplates: dataToSend.optionTemplates.map(opt => ({
        id: `temp_opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: opt,
        questionTemplateId: editingQuestionTemplate.id
      }))
    };

    // Optimistically update the question template in the UI
    setQuestionTemplates(prev => prev.map(q => q.id === editingQuestionTemplate.id ? optimisticQuestionTemplate : q));
    setPendingOperations(prev => new Map(prev).set(operationId, 'edit'));
    setOperationStatus(prev => new Map(prev).set(operationId, 'pending'));

    // Close dialog immediately
    setEditingQuestionTemplate(null);
    setIsEditDialogOpen(false);
    setError(null);
    setSuccess("Question template updated! Processing in background...");

    // Perform background operation
    performBackgroundOperation(
      operationId,
      async () => {
        const response = await fetch(`/api/question-templates/${editingQuestionTemplate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to update question template");
        }

        // Replace optimistic question template with real one
        setQuestionTemplates(prev => prev.map(q => q.id === editingQuestionTemplate.id ? data.questionTemplate : q));
      },
      () => {
        setSuccess("Question template updated successfully!");
      },
      (error) => {
        // Rollback optimistic update
        setQuestionTemplates(prev => prev.map(q => q.id === editingQuestionTemplate.id ? originalQuestionTemplate : q));
        setError(`Failed to update question template: ${error}`);
      }
    );
  };

  const handleDeleteQuestion = async (questionTemplateId: string, questionText: string) => {
    if (!confirm(`Are you sure you want to delete "${questionText}"? This action cannot be undone.`)) {
      return;
    }

    const operationId = `delete_${questionTemplateId}`;
    const originalQuestionTemplate = questionTemplates.find(q => q.id === questionTemplateId);

    // Store original question template for rollback
    if (!originalQuestionTemplate) {
      setError("Question template not found");
      return;
    }

    // Optimistically remove the question template from the UI
    setQuestionTemplates(prev => prev.filter(q => q.id !== questionTemplateId));
    setPendingOperations(prev => new Map(prev).set(operationId, 'delete'));
    setOperationStatus(prev => new Map(prev).set(operationId, 'pending'));

    setError(null);
    setSuccess("Question template deleted! Processing in background...");

    // Perform background operation
    performBackgroundOperation(
      operationId,
      async () => {
        const response = await fetch(`/api/question-templates/${questionTemplateId}`, {
          method: "DELETE",
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to delete question template");
        }
      },
      () => {
        setSuccess("Question template deleted successfully!");
      },
      (error) => {
        // Rollback optimistic update
        setQuestionTemplates(prev => [...prev, originalQuestionTemplate].sort((a, b) => a.text.localeCompare(b.text)));
        setError(`Failed to delete question template: ${error}`);
      }
    );
  };

  const handleToggleInactive = async (questionTemplateId: string, currentStatus: boolean) => {
    const operationId = `toggle_${questionTemplateId}`;
    const originalQuestionTemplate = questionTemplates.find(q => q.id === questionTemplateId);

    if (!originalQuestionTemplate) {
      setError("Question template not found");
      return;
    }

    // Optimistically update the question template status
    setQuestionTemplates(prev => prev.map(q => 
      q.id === questionTemplateId ? { ...q, isInactive: !currentStatus } : q
    ));
    setPendingOperations(prev => new Map(prev).set(operationId, 'edit'));
    setOperationStatus(prev => new Map(prev).set(operationId, 'pending'));

    setError(null);
    setSuccess(`Question template ${!currentStatus ? 'deactivated' : 'activated'}! Processing in background...`);

    // Perform background operation
    performBackgroundOperation(
      operationId,
      async () => {
        const response = await fetch(`/api/question-templates/${questionTemplateId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isInactive: !currentStatus }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to update question template status");
        }

        // Update with real data
        setQuestionTemplates(prev => prev.map(q => q.id === questionTemplateId ? data.questionTemplate : q));
      },
      () => {
        setSuccess(`Question template ${!currentStatus ? 'deactivated' : 'activated'} successfully!`);
      },
      (error) => {
        // Rollback optimistic update
        setQuestionTemplates(prev => prev.map(q => q.id === questionTemplateId ? originalQuestionTemplate : q));
        setError(`Failed to update question template status: ${error}`);
      }
    );
  };

  const openEditDialog = (questionTemplate: QuestionTemplate) => {
    setEditingQuestionTemplate(questionTemplate);
    setEditQuestionTemplate({
      text: questionTemplate.text,
      type: questionTemplate.type,
      stage: questionTemplate.stage,
      optionTemplates: questionTemplate.optionTemplates.length > 0 ? questionTemplate.optionTemplates.map(o => o.text) : [""],
    });
    
    // Handle RISK question options
    if (questionTemplate.type === QuestionType.RISK) {
      const probabilityOptions: string[] = [];
      const impactOptions: string[] = [];
      
      questionTemplate.optionTemplates.forEach(option => {
        if (option.text.startsWith('pro:')) {
          probabilityOptions.push(option.text.replace('pro:', ''));
        } else if (option.text.startsWith('imp:')) {
          impactOptions.push(option.text.replace('imp:', ''));
        }
      });
      
      setEditRiskOptions({
        probability: probabilityOptions.length > 0 ? probabilityOptions : ["LOW", "MEDIUM", "HIGH"],
        impact: impactOptions.length > 0 ? impactOptions : ["LOW", "MEDIUM", "HIGH"]
      });
    } else {
      setEditRiskOptions({
        probability: ["LOW", "MEDIUM", "HIGH"],
        impact: ["LOW", "MEDIUM", "HIGH"]
      });
    }
    
    setIsEditDialogOpen(true);
  };

  const addOption = (isEdit: boolean = false) => {
    if (isEdit) {
      setEditQuestionTemplate(prev => ({
        ...prev,
        optionTemplates: [...prev.optionTemplates, ""]
      }));
    } else {
      setNewQuestionTemplate(prev => ({
        ...prev,
        optionTemplates: [...prev.optionTemplates, ""]
      }));
    }
  };

  const removeOption = (index: number, isEdit: boolean = false) => {
    if (isEdit) {
      setEditQuestionTemplate(prev => ({
        ...prev,
        optionTemplates: prev.optionTemplates.filter((_, i) => i !== index)
      }));
    } else {
      setNewQuestionTemplate(prev => ({
        ...prev,
        optionTemplates: prev.optionTemplates.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditQuestionTemplate(prev => ({
        ...prev,
        optionTemplates: prev.optionTemplates.map((opt, i) => i === index ? value : opt)
      }));
    } else {
      setNewQuestionTemplate(prev => ({
        ...prev,
        optionTemplates: prev.optionTemplates.map((opt, i) => i === index ? value : opt)
      }));
    }
  };

  const updateRiskOption = (type: 'probability' | 'impact', index: number, value: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditRiskOptions(prev => ({
        ...prev,
        [type]: prev[type].map((opt, i) => i === index ? value : opt)
      }));
    } else {
      setNewRiskOptions(prev => ({
        ...prev,
        [type]: prev[type].map((opt, i) => i === index ? value : opt)
      }));
    }
  };

  const addRiskOption = (type: 'probability' | 'impact', isEdit: boolean = false) => {
    if (isEdit) {
      setEditRiskOptions(prev => ({
        ...prev,
        [type]: [...prev[type], ""]
      }));
    } else {
      setNewRiskOptions(prev => ({
        ...prev,
        [type]: [...prev[type], ""]
      }));
    }
  };

  const removeRiskOption = (type: 'probability' | 'impact', index: number, isEdit: boolean = false) => {
    if (isEdit) {
      setEditRiskOptions(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }));
    } else {
      setNewRiskOptions(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }));
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.CHECKBOX: return "Checkbox";
      case QuestionType.RADIO: return "Radio";
      case QuestionType.TEXT: return "Text";
      case QuestionType.SLIDER: return "Slider";
      case QuestionType.RISK: return "Risk";
      default: return type;
    }
  };

  const getStageLabel = (stage: Stage) => {
    switch (stage) {
      case Stage.TECHNICAL_FEASIBILITY: return "Technical Feasibility";
      case Stage.BUSINESS_FEASIBILITY: return "Business Feasibility";
      case Stage.ETHICAL_IMPACT: return "Ethical Impact";
      case Stage.RISK_ASSESSMENT: return "Risk Assessment";
      case Stage.DATA_READINESS: return "Data Readiness";
      case Stage.ROADMAP_POSITION: return "Roadmap Position";
      case Stage.BUDGET_PLANNING: return "Budget Planning";
      default: return stage;
    }
  };

  const needsOptions = (type: QuestionType) => {
    return type === QuestionType.CHECKBOX || type === QuestionType.RADIO || type === QuestionType.RISK;
  };

  const clearFilter = () => {
    setSelectedStage("all");
  };

  // Helper function to get order index for a specific stage
  const getOrderIndex = (questionTemplate: QuestionTemplate, stage: Stage) => {
    switch (stage) {
      case Stage.TECHNICAL_FEASIBILITY:
        return questionTemplate.technicalOrderIndex || 0;
      case Stage.BUSINESS_FEASIBILITY:
        return questionTemplate.businessOrderIndex || 0;
      case Stage.ETHICAL_IMPACT:
        return questionTemplate.ethicalOrderIndex || 0;
      case Stage.RISK_ASSESSMENT:
        return questionTemplate.riskOrderIndex || 0;
      case Stage.DATA_READINESS:
        return questionTemplate.dataOrderIndex || 0;
      case Stage.ROADMAP_POSITION:
        return questionTemplate.roadmapOrderIndex || 0;
      case Stage.BUDGET_PLANNING:
        return questionTemplate.budgetOrderIndex || 0;
      default:
        return 0;
    }
  };

  // Handle drag end for reordering
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && selectedStage !== "all") {
      const oldIndex = filteredQuestionTemplates.findIndex((item) => item.id === active.id);
      const newIndex = filteredQuestionTemplates.findIndex((item) => item.id === over.id);

      // Update local state optimistically
      const newQuestionTemplates = arrayMove(filteredQuestionTemplates, oldIndex, newIndex);
      setFilteredQuestionTemplates(newQuestionTemplates);

      // Update the order indices for the selected stage
      const stage = selectedStage as Stage;
      const operationId = `reorder_${Date.now()}`;
      
      setPendingOperations(prev => new Map(prev).set(operationId, 'edit'));
      setOperationStatus(prev => new Map(prev).set(operationId, 'pending'));

      try {
        // Update order indices for all question templates in the new order
        const updatePromises = newQuestionTemplates.map((questionTemplate, index) => {
          const orderField = getOrderFieldName(stage);
          return fetch(`/api/question-templates/${questionTemplate.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [orderField]: index }),
          });
        });

        await Promise.all(updatePromises);
        
        setOperationStatus(prev => new Map(prev).set(operationId, 'success'));
        setSuccess("Question templates reordered successfully!");
        
        // Update the main question templates list with the new order indices
        setQuestionTemplates(prev => prev.map(q => {
          const updatedQ = newQuestionTemplates.find(nq => nq.id === q.id);
          if (updatedQ) {
            const orderField = getOrderFieldName(stage);
            const newOrderIndex = newQuestionTemplates.indexOf(updatedQ);
            return { ...q, [orderField]: newOrderIndex };
          }
          return q;
        }));
      } catch (error) {
        setOperationStatus(prev => new Map(prev).set(operationId, 'error'));
        setError(`Failed to reorder question templates: ${error}`);
        
        // Revert optimistic update by restoring original order
        setFilteredQuestionTemplates(filteredQuestionTemplates);
      } finally {
        setPendingOperations(prev => {
          const newMap = new Map(prev);
          newMap.delete(operationId);
          return newMap;
        });
      }
    }
  };

  // Helper function to get order field name for a stage
  const getOrderFieldName = (stage: Stage) => {
    switch (stage) {
      case Stage.TECHNICAL_FEASIBILITY:
        return 'technicalOrderIndex';
      case Stage.BUSINESS_FEASIBILITY:
        return 'businessOrderIndex';
      case Stage.ETHICAL_IMPACT:
        return 'ethicalOrderIndex';
      case Stage.RISK_ASSESSMENT:
        return 'riskOrderIndex';
      case Stage.DATA_READINESS:
        return 'dataOrderIndex';
      case Stage.ROADMAP_POSITION:
        return 'roadmapOrderIndex';
      case Stage.BUDGET_PLANNING:
        return 'budgetOrderIndex';
      default:
        return 'technicalOrderIndex';
    }
  };

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (isReady) {
      fetchQuestionTemplates();
    }
  }, [isReady]);

  // Now we can do conditional returns after all hooks
  if (!isReady || !isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication and role
  if (!isSignedIn || !user) {
    router.push("/sign-in");
    return null;
  }

  if (userData?.role !== "QZEN_ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md w-full border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">
              You don't have permission to access question templates.
            </p>
            <p className="text-muted-foreground mb-4">
              Your role: {userData?.role || "Unknown"}
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground font-medium">Loading question templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent leading-tight">
                Configure Question Templates
              </h1>
              <p className="text-muted-foreground mt-3 text-lg">
                Manage assessment question templates for your organization
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-primary-foreground px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0">
                  <Plus className="w-6 h-6" />
                  Add Question Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Add New Question Template
                  </DialogTitle>
                  <DialogDescription>
                    Create a new assessment question template for your organization.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="questionText">Question Text *</Label>
                    <Textarea
                      id="questionText"
                      value={newQuestionTemplate.text}
                      onChange={(e) => setNewQuestionTemplate(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter your question here..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="questionType">Question Type *</Label>
                      <Select
                        value={newQuestionTemplate.type}
                        onValueChange={(value) => setNewQuestionTemplate(prev => ({ ...prev, type: value as QuestionType }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={QuestionType.TEXT}>Text</SelectItem>
                          <SelectItem value={QuestionType.CHECKBOX}>Checkbox</SelectItem>
                          <SelectItem value={QuestionType.RADIO}>Radio</SelectItem>
                          <SelectItem value={QuestionType.SLIDER}>Slider</SelectItem>
                          <SelectItem value={QuestionType.RISK}>Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="questionStage">Assessment Stage *</Label>
                      <Select
                        value={newQuestionTemplate.stage}
                        onValueChange={(value) => setNewQuestionTemplate(prev => ({ ...prev, stage: value as Stage }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Stage.TECHNICAL_FEASIBILITY}>Technical Feasibility</SelectItem>
                          <SelectItem value={Stage.BUSINESS_FEASIBILITY}>Business Feasibility</SelectItem>
                          <SelectItem value={Stage.ETHICAL_IMPACT}>Ethical Impact</SelectItem>
                          <SelectItem value={Stage.RISK_ASSESSMENT}>Risk Assessment</SelectItem>
                          <SelectItem value={Stage.DATA_READINESS}>Data Readiness</SelectItem>
                          <SelectItem value={Stage.ROADMAP_POSITION}>Roadmap Position</SelectItem>
                          <SelectItem value={Stage.BUDGET_PLANNING}>Budget Planning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {needsOptions(newQuestionTemplate.type) && (
                    <div>
                      {newQuestionTemplate.type === QuestionType.RISK ? (
                        <div className="space-y-6">
                          {/* Probability Options */}
                          <div>
                            <Label>Probability Options *</Label>
                            <div className="space-y-2 mt-1">
                              {newRiskOptions.probability.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => updateRiskOption('probability', index, e.target.value, false)}
                                    placeholder={`Probability option ${index + 1}`}
                                    className="flex-1"
                                  />
                                  {newRiskOptions.probability.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeRiskOption('probability', index, false)}
                                      className="shrink-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => addRiskOption('probability', false)}
                                className="w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Probability Option
                              </Button>
                            </div>
                          </div>

                          {/* Impact Options */}
                          <div>
                            <Label>Impact Options *</Label>
                            <div className="space-y-2 mt-1">
                              {newRiskOptions.impact.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => updateRiskOption('impact', index, e.target.value, false)}
                                    placeholder={`Impact option ${index + 1}`}
                                    className="flex-1"
                                  />
                                  {newRiskOptions.impact.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeRiskOption('impact', index, false)}
                                      className="shrink-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => addRiskOption('impact', false)}
                                className="w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Impact Option
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Label>Options *</Label>
                          <div className="space-y-2 mt-1">
                            {newQuestionTemplate.optionTemplates.map((option, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(index, e.target.value, false)}
                                  placeholder={`Option ${index + 1}`}
                                  className="flex-1"
                                />
                                {newQuestionTemplate.optionTemplates.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeOption(index, false)}
                                    className="shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => addOption(false)}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddQuestion}
                    disabled={actionLoading === "add" || !newQuestionTemplate.text.trim()}
                  >
                    {actionLoading === "add" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Add Question Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-success font-medium">{success}</span>
          </div>
        )}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <span className="text-destructive font-medium">{error}</span>
          </div>
        )}

        {/* Questions Table */}
        <Card className="bg-card border border-border shadow-sm rounded-2xl">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Assessment Question Templates
                </CardTitle>
                <CardDescription>
                  Manage all question templates used in your organization's assessments
                </CardDescription>
              </div>
              
              {/* Filter Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="stageFilter" className="text-sm font-medium">
                    Filter by Stage:
                  </Label>
                </div>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value={Stage.TECHNICAL_FEASIBILITY}>Technical Feasibility</SelectItem>
                    <SelectItem value={Stage.BUSINESS_FEASIBILITY}>Business Feasibility</SelectItem>
                    <SelectItem value={Stage.ETHICAL_IMPACT}>Ethical Impact</SelectItem>
                    <SelectItem value={Stage.RISK_ASSESSMENT}>Risk Assessment</SelectItem>
                    <SelectItem value={Stage.DATA_READINESS}>Data Readiness</SelectItem>
                    <SelectItem value={Stage.ROADMAP_POSITION}>Roadmap Position</SelectItem>
                    <SelectItem value={Stage.BUDGET_PLANNING}>Budget Planning</SelectItem>
                  </SelectContent>
                </Select>
                {selectedStage !== "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilter}
                    className="flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </Button>
                )}
                
                {/* Reorder Mode Toggle */}
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
                  <Button
                    variant={reorderMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReorderMode(!reorderMode)}
                    disabled={selectedStage === "all"}
                    className={`flex items-center gap-1 ${
                      selectedStage === "all" ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    {reorderMode ? "Exit Reorder" : "Reorder Mode"}
                  </Button>
                  {selectedStage === "all" && (
                    <div className="text-xs text-muted-foreground">
                      Select a stage to reorder questions
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredQuestionTemplates.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {selectedStage === "all" ? "No Question Templates Yet" : "No Question Templates Found"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {selectedStage === "all" 
                    ? "Create your first assessment question template to get started."
                    : `No question templates found for ${getStageLabel(selectedStage as Stage)}. Try selecting a different stage or create a new question template.`
                  }
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question Template
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>
                    Showing {filteredQuestionTemplates.length} of {questionTemplates.length} question templates
                    {selectedStage !== "all" && ` for ${getStageLabel(selectedStage as Stage)}`}
                  </span>
                  {selectedStage !== "all" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilter}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear filter
                    </Button>
                  )}
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredQuestionTemplates.map(q => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {filteredQuestionTemplates.map((questionTemplate) => {
                        const isPending = Array.from(pendingOperations.entries()).some(([opId, op]) => 
                          (op === 'add' && opId.includes(questionTemplate.id)) ||
                          (op === 'edit' && opId.includes(questionTemplate.id)) ||
                          (op === 'delete' && opId.includes(questionTemplate.id))
                        );
                        const currentOperationStatus = Array.from(operationStatus.entries()).find(([opId, status]) => 
                          opId.includes(questionTemplate.id)
                        )?.[1] || 'success';

                        return (
                          <SortableQuestionTemplate
                            key={questionTemplate.id}
                            questionTemplate={questionTemplate}
                            isPending={isPending}
                            currentOperationStatus={currentOperationStatus}
                            reorderMode={reorderMode}
                            handleToggleInactive={handleToggleInactive}
                            openEditDialog={openEditDialog}
                            handleDeleteQuestion={handleDeleteQuestion}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Question Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Edit Question Template
              </DialogTitle>
              <DialogDescription>
                Update the question template details and options.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="editQuestionText">Question Template Text *</Label>
                <Textarea
                  id="editQuestionText"
                  value={editQuestionTemplate.text}
                  onChange={(e) => setEditQuestionTemplate(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter your question template here..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editQuestionType">Question Template Type *</Label>
                  <Select
                    value={editQuestionTemplate.type}
                    onValueChange={(value) => setEditQuestionTemplate(prev => ({ ...prev, type: value as QuestionType }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={QuestionType.TEXT}>Text</SelectItem>
                      <SelectItem value={QuestionType.CHECKBOX}>Checkbox</SelectItem>
                      <SelectItem value={QuestionType.RADIO}>Radio</SelectItem>
                      <SelectItem value={QuestionType.SLIDER}>Slider</SelectItem>
                      <SelectItem value={QuestionType.RISK}>Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="editQuestionStage">Assessment Question Template Stage *</Label>
                  <Select
                    value={editQuestionTemplate.stage}
                    onValueChange={(value) => setEditQuestionTemplate(prev => ({ ...prev, stage: value as Stage }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Stage.TECHNICAL_FEASIBILITY}>Technical Feasibility</SelectItem>
                      <SelectItem value={Stage.BUSINESS_FEASIBILITY}>Business Feasibility</SelectItem>
                      <SelectItem value={Stage.ETHICAL_IMPACT}>Ethical Impact</SelectItem>
                      <SelectItem value={Stage.RISK_ASSESSMENT}>Risk Assessment</SelectItem>
                      <SelectItem value={Stage.DATA_READINESS}>Data Readiness</SelectItem>
                      <SelectItem value={Stage.ROADMAP_POSITION}>Roadmap Position</SelectItem>
                      <SelectItem value={Stage.BUDGET_PLANNING}>Budget Planning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {needsOptions(editQuestionTemplate.type) && (
                <div>
                  {editQuestionTemplate.type === QuestionType.RISK ? (
                    <div className="space-y-6">
                      {/* Probability Options */}
                      <div>
                        <Label>Probability Options *</Label>
                        <div className="space-y-2 mt-1">
                          {editRiskOptions.probability.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateRiskOption('probability', index, e.target.value, true)}
                                placeholder={`Probability option ${index + 1}`}
                                className="flex-1"
                              />
                              {editRiskOptions.probability.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeRiskOption('probability', index, true)}
                                  className="shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addRiskOption('probability', true)}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Probability Option
                          </Button>
                        </div>
                      </div>

                      {/* Impact Options */}
                      <div>
                        <Label>Impact Options *</Label>
                        <div className="space-y-2 mt-1">
                          {editRiskOptions.impact.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateRiskOption('impact', index, e.target.value, true)}
                                placeholder={`Impact option ${index + 1}`}
                                className="flex-1"
                              />
                              {editRiskOptions.impact.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeRiskOption('impact', index, true)}
                                  className="shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addRiskOption('impact', true)}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Impact Option
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label>Options *</Label>
                      <div className="space-y-2 mt-1">
                        {editQuestionTemplate.optionTemplates.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value, true)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1"
                            />
                            {editQuestionTemplate.optionTemplates.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeOption(index, true)}
                                className="shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addOption(true)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditQuestion}
                disabled={actionLoading === "edit" || !editQuestionTemplate.text.trim()}
              >
                {actionLoading === "edit" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Update Question Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
