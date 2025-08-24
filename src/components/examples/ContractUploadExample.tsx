'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { analyzeContract } from '@/services/prompt-executor';

/**
 * Example component showing how to use the prompt executor in production
 * This demonstrates a real-world contract upload and analysis workflow
 */

export default function ContractUploadExample() {
  const [contractText, setContractText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');

  // Example: Handle file upload (in production, you'd extract text from PDF)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In production, you would:
    // 1. Upload file to storage (Vercel Blob, S3, etc.)
    // 2. Extract text using a service like pdf-parse or Azure Form Recognizer
    // 3. Set the extracted text
    
    // For demo, we'll just read as text
    const reader = new FileReader();
    reader.onload = (e) => {
      setContractText(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  // Main analysis function using the prompt executor
  const handleAnalyzeContract = async () => {
    if (!contractText.trim()) {
      setError('Please provide contract text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      // Use the prompt executor service
      const result = await analyzeContract(contractText, {
        metadata: {
          source: 'manual_upload',
          userId: 'current_user_id', // In production, get from auth context
          timestamp: new Date().toISOString()
        },
        options: {
          temperature: 0.3, // Lower temperature for more consistent legal analysis
          maxTokens: 3000  // Increase for detailed analysis
        }
      });

      if (result.success && result.data) {
        setAnalysis({
          response: result.data.response,
          metadata: result.metadata,
          requestId: result.requestId
        });

        // In production, you might also:
        // - Save the analysis to database
        // - Send notifications if high risks found
        // - Generate a PDF report
        // - Track analytics
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Parse and format the analysis response
  const formatAnalysis = (response: string) => {
    try {
      // If response is JSON, parse and format nicely
      const parsed = JSON.parse(response);
      return (
        <div className="space-y-4">
          {parsed.executive_summary && (
            <div>
              <h4 className="font-semibold mb-2">Executive Summary</h4>
              <p className="text-sm text-gray-700">{parsed.executive_summary}</p>
            </div>
          )}
          {parsed.risk_analysis && (
            <div>
              <h4 className="font-semibold mb-2">Risk Analysis</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {parsed.risk_analysis.map((risk: any, i: number) => (
                  <li key={i}>
                    <span className="font-medium">{risk.clause}:</span> {risk.issue}
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      risk.risk_level === 'High' ? 'bg-red-100 text-red-700' :
                      risk.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {risk.risk_level} Risk
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    } catch {
      // If not JSON, display as formatted text
      return (
        <pre className="whitespace-pre-wrap text-sm font-mono">
          {response}
        </pre>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contract Analysis Example</CardTitle>
          <CardDescription>
            Upload or paste a contract to analyze it using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
              Upload Contract (PDF, Word, or Text)
            </label>
            <div className="flex items-center gap-4">
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              <span className="text-sm text-gray-500">
                or paste text below
              </span>
            </div>
          </div>

          {/* Text Input */}
          <div>
            <label htmlFor="contract-text" className="block text-sm font-medium mb-2">
              Contract Text
            </label>
            <Textarea
              id="contract-text"
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              placeholder="Paste your contract text here..."
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {/* Example Contract Button */}
          <Button
            variant="link"
            onClick={() => setContractText(EXAMPLE_CONTRACT)}
            className="text-sm"
          >
            Use Example Contract
          </Button>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyzeContract}
            disabled={isAnalyzing || !contractText}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Contract...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Analyze Contract
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Analysis Complete
            </CardTitle>
            <CardDescription>
              Request ID: {analysis.requestId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Analysis Content */}
            <div className="bg-gray-50 rounded-lg p-4">
              {formatAnalysis(analysis.response)}
            </div>

            {/* Metadata */}
            {analysis.metadata && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tokens:</span>{' '}
                  {analysis.metadata.tokensUsed}
                </div>
                <div>
                  <span className="font-medium">Cost:</span>{' '}
                  ${analysis.metadata.cost?.toFixed(4)}
                </div>
                <div>
                  <span className="font-medium">Time:</span>{' '}
                  {analysis.metadata.latencyMs}ms
                </div>
                <div>
                  <span className="font-medium">Model:</span>{' '}
                  {analysis.metadata.model}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                Download Report
              </Button>
              <Button variant="outline" size="sm">
                Save to Database
              </Button>
              <Button variant="outline" size="sm">
                Share Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Example contract for testing
const EXAMPLE_CONTRACT = `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of January 1, 2024, between ABC Corporation ("Client") and XYZ Services Inc. ("Service Provider").

1. SERVICES
The Service Provider agrees to provide software development and consulting services as requested by the Client from time to time.

2. PAYMENT TERMS
Client shall pay Service Provider $150 per hour for services rendered. Invoices will be submitted monthly and payment is due within 30 days of receipt.

3. TERM AND TERMINATION
This Agreement shall commence on the date first written above and continue for one year. Either party may terminate this Agreement with 30 days written notice.

4. CONFIDENTIALITY
Each party agrees to maintain the confidentiality of the other party's proprietary information and not disclose it to third parties.

5. LIMITATION OF LIABILITY
In no event shall either party's liability exceed the total amount paid under this Agreement in the six months preceding the claim.

6. INDEMNIFICATION
Each party shall indemnify and hold harmless the other party from any third-party claims arising from their negligence or willful misconduct.

7. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

Client: _____________________
Date: _____________________

Service Provider: _____________________
Date: _____________________`;