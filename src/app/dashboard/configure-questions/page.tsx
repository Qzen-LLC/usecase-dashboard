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
} from "lucide-react";
import { QuestionType, Stage } from "@/generated/prisma";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  stage: Stage;
  options: Option[];
  organizationId: string;
}

interface Option {
  id: string;
  text: string;
  questionId: string;
}

interface NewQuestion {
  text: string;
  type: QuestionType;
  stage: Stage;
  options: string[];
}

export default function ConfigureQuestionsPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { userData } = useUserData();
  const router = useRouter();
  const { isReady } = useStableRender();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>("all");
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  // Form states
  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
    text: "",
    type: QuestionType.TEXT,
    stage: Stage.TECHNICAL_FEASIBILITY,
    options: [""],
  });
  
  const [editQuestion, setEditQuestion] = useState<NewQuestion>({
    text: "",
    type: QuestionType.TEXT,
    stage: Stage.TECHNICAL_FEASIBILITY,
    options: [""],
  });
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQuestions = async () => {
    if (!userData?.organizationId) {
      setError("Organization ID not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/organizations/${userData.organizationId}/questions`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch questions");
      }
      setQuestions(data.questions || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Filter questions based on selected stage
  useEffect(() => {
    if (selectedStage === "all") {
      setFilteredQuestions(questions);
    } else {
      setFilteredQuestions(questions.filter(q => q.stage === selectedStage));
    }
  }, [questions, selectedStage]);

  const handleAddQuestion = async () => {
    if (!newQuestion.text.trim()) {
      setError("Question text is required");
      return;
    }

    if (!userData?.organizationId) {
      setError("Organization ID not found");
      return;
    }

    setActionLoading("add");
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/organizations/${userData.organizationId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create question");
      }

      setSuccess("Question created successfully!");
      setNewQuestion({
        text: "",
        type: QuestionType.TEXT,
        stage: Stage.TECHNICAL_FEASIBILITY,
        options: [""],
      });
      setIsAddDialogOpen(false);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || "Failed to create question");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion || !editQuestion.text.trim()) {
      setError("Question text is required");
      return;
    }

    if (!userData?.organizationId) {
      setError("Organization ID not found");
      return;
    }

    setActionLoading("edit");
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/organizations/${userData.organizationId}/questions/${editingQuestion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editQuestion),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update question");
      }

      setSuccess("Question updated successfully!");
      setEditingQuestion(null);
      setIsEditDialogOpen(false);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || "Failed to update question");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteQuestion = async (questionId: string, questionText: string) => {
    if (!confirm(`Are you sure you want to delete "${questionText}"? This action cannot be undone.`)) {
      return;
    }

    if (!userData?.organizationId) {
      setError("Organization ID not found");
      return;
    }

    setActionLoading(questionId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/organizations/${userData.organizationId}/questions/${questionId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete question");
      }

      setSuccess("Question deleted successfully!");
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || "Failed to delete question");
    } finally {
      setActionLoading(null);
    }
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setEditQuestion({
      text: question.text,
      type: question.type,
      stage: question.stage,
      options: question.options.length > 0 ? question.options.map(o => o.text) : [""],
    });
    setIsEditDialogOpen(true);
  };

  const addOption = (isEdit: boolean = false) => {
    if (isEdit) {
      setEditQuestion(prev => ({
        ...prev,
        options: [...prev.options, ""]
      }));
    } else {
      setNewQuestion(prev => ({
        ...prev,
        options: [...prev.options, ""]
      }));
    }
  };

  const removeOption = (index: number, isEdit: boolean = false) => {
    if (isEdit) {
      setEditQuestion(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    } else {
      setNewQuestion(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditQuestion(prev => ({
        ...prev,
        options: prev.options.map((opt, i) => i === index ? value : opt)
      }));
    } else {
      setNewQuestion(prev => ({
        ...prev,
        options: prev.options.map((opt, i) => i === index ? value : opt)
      }));
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.CHECKBOX: return "Checkbox";
      case QuestionType.RADIO: return "Radio";
      case QuestionType.TEXT: return "Text";
      case QuestionType.SLIDER: return "Slider";
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
    return type === QuestionType.CHECKBOX || type === QuestionType.RADIO;
  };

  const clearFilter = () => {
    setSelectedStage("all");
  };

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (isReady && userData?.organizationId) {
      fetchQuestions();
    }
  }, [isReady, userData?.organizationId]);

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

  if (userData?.role !== "ORG_ADMIN") {
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
              You don't have permission to access question configuration.
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

  if (!userData?.organizationId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md w-full border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Organization Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">
              Your user account is not associated with an organization.
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
          <p className="text-foreground font-medium">Loading questions...</p>
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
                Configure Questions
              </h1>
              <p className="text-muted-foreground mt-3 text-lg">
                Manage assessment questions for your organization
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-primary-foreground px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0">
                  <Plus className="w-6 h-6" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Add New Question
                  </DialogTitle>
                  <DialogDescription>
                    Create a new assessment question for your organization.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="questionText">Question Text *</Label>
                    <Textarea
                      id="questionText"
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter your question here..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="questionType">Question Type *</Label>
                      <Select
                        value={newQuestion.type}
                        onValueChange={(value) => setNewQuestion(prev => ({ ...prev, type: value as QuestionType }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={QuestionType.TEXT}>Text</SelectItem>
                          <SelectItem value={QuestionType.CHECKBOX}>Checkbox</SelectItem>
                          <SelectItem value={QuestionType.RADIO}>Radio</SelectItem>
                          <SelectItem value={QuestionType.SLIDER}>Slider</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="questionStage">Assessment Stage *</Label>
                      <Select
                        value={newQuestion.stage}
                        onValueChange={(value) => setNewQuestion(prev => ({ ...prev, stage: value as Stage }))}
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

                  {needsOptions(newQuestion.type) && (
                    <div>
                      <Label>Options *</Label>
                      <div className="space-y-2 mt-1">
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value, false)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1"
                            />
                            {newQuestion.options.length > 1 && (
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
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddQuestion}
                    disabled={actionLoading === "add" || !newQuestion.text.trim()}
                  >
                    {actionLoading === "add" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Add Question
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
                  Assessment Questions
                </CardTitle>
                <CardDescription>
                  Manage all questions used in your organization's assessments
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {selectedStage === "all" ? "No Questions Yet" : "No Questions Found"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {selectedStage === "all" 
                    ? "Create your first assessment question to get started."
                    : `No questions found for ${getStageLabel(selectedStage as Stage)}. Try selecting a different stage or create a new question.`
                  }
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>
                    Showing {filteredQuestions.length} of {questions.length} questions
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

                {filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="border border-border rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-foreground">
                            {question.text}
                          </h3>
                          <Badge variant="secondary" className="px-3 py-1 rounded-full">
                            {getQuestionTypeLabel(question.type)}
                          </Badge>
                          <Badge variant="outline" className="px-3 py-1 rounded-full">
                            {getStageLabel(question.stage)}
                          </Badge>
                        </div>
                        
                        {question.options.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Options:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {question.options.map((option, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="px-2 py-1 text-xs"
                                >
                                  {option.text}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(question)}
                          className="border-border text-foreground hover:bg-muted"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id, question.text)}
                          disabled={actionLoading === question.id}
                          className="border-destructive text-destructive hover:bg-destructive/10"
                        >
                          {actionLoading === question.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
                Edit Question
              </DialogTitle>
              <DialogDescription>
                Update the question details and options.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="editQuestionText">Question Text *</Label>
                <Textarea
                  id="editQuestionText"
                  value={editQuestion.text}
                  onChange={(e) => setEditQuestion(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter your question here..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editQuestionType">Question Type *</Label>
                  <Select
                    value={editQuestion.type}
                    onValueChange={(value) => setEditQuestion(prev => ({ ...prev, type: value as QuestionType }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={QuestionType.TEXT}>Text</SelectItem>
                      <SelectItem value={QuestionType.CHECKBOX}>Checkbox</SelectItem>
                      <SelectItem value={QuestionType.RADIO}>Radio</SelectItem>
                      <SelectItem value={QuestionType.SLIDER}>Slider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="editQuestionStage">Assessment Stage *</Label>
                  <Select
                    value={editQuestion.stage}
                    onValueChange={(value) => setEditQuestion(prev => ({ ...prev, stage: value as Stage }))}
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

              {needsOptions(editQuestion.type) && (
                <div>
                  <Label>Options *</Label>
                  <div className="space-y-2 mt-1">
                    {editQuestion.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value, true)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1"
                        />
                        {editQuestion.options.length > 1 && (
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
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditQuestion}
                disabled={actionLoading === "edit" || !editQuestion.text.trim()}
              >
                {actionLoading === "edit" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Update Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
