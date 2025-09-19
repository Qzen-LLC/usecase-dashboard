/**
 * Comprehensive Logging System for Guardrail Generation
 * Tracks every input/output throughout the multi-agent system
 */

import fs from 'fs';
import path from 'path';

export class GuardrailLogger {
  private static instance: GuardrailLogger;
  private logBuffer: any[] = [];
  private sessionId: string;
  private logFilePath: string;
  
  private constructor() {
    this.sessionId = `guardrail-${Date.now()}`;
    this.logFilePath = path.join(process.cwd(), 'logs', `${this.sessionId}.json`);
    this.ensureLogDirectory();
  }
  
  static getInstance(): GuardrailLogger {
    if (!GuardrailLogger.instance) {
      GuardrailLogger.instance = new GuardrailLogger();
    }
    return GuardrailLogger.instance;
  }
  
  private ensureLogDirectory() {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
  
  /**
   * Start a new logging session
   */
  startSession(useCaseId: string, useCaseTitle: string) {
    this.sessionId = `guardrail-${useCaseId}-${Date.now()}`;
    this.logFilePath = path.join(process.cwd(), 'logs', `${this.sessionId}.json`);
    this.logBuffer = [];
    
    this.log('SESSION_START', {
      sessionId: this.sessionId,
      useCaseId,
      useCaseTitle,
      timestamp: new Date().toISOString()
    });
    
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`🎯 GUARDRAIL GENERATION SESSION STARTED`);
    console.log(`📋 Use Case: ${useCaseTitle}`);
    console.log(`🆔 Session ID: ${this.sessionId}`);
    console.log(`📁 Log File: ${this.logFilePath}`);
    console.log('═══════════════════════════════════════════════════════════════════');
  }
  
  /**
   * Log LLM input
   */
  logLLMInput(approach: string, prompt: string, systemPrompt?: string) {
    const entry = {
      type: 'LLM_INPUT',
      approach,
      timestamp: new Date().toISOString(),
      systemPrompt: systemPrompt ? this.truncate(systemPrompt, 500) : undefined,
      prompt: {
        full: prompt,
        length: prompt.length,
        preview: this.truncate(prompt, 1000)
      }
    };
    
    this.log('LLM_INPUT', entry);
    
    console.log('\n┌─────────────────────────────────────────────────────────────────');
    console.log(`│ 🤖 LLM INPUT [${approach}]`);
    console.log(`│ 📏 Prompt Length: ${prompt.length} characters`);
    console.log(`│ 📝 System Prompt: ${systemPrompt ? this.truncate(systemPrompt, 200) : 'N/A'}`);
    console.log(`│ 📄 Prompt Preview:`);
    console.log(`│    ${this.truncate(prompt, 300).replace(/\n/g, '\n│    ')}`);
    console.log('└─────────────────────────────────────────────────────────────────\n');
  }
  
  /**
   * Log LLM output
   */
  logLLMOutput(approach: string, response: any, success: boolean, error?: any) {
    const entry = {
      type: 'LLM_OUTPUT',
      approach,
      timestamp: new Date().toISOString(),
      success,
      response: success ? {
        guardrailsCount: {
          critical: response.guardrails?.critical?.length || 0,
          operational: response.guardrails?.operational?.length || 0,
          ethical: response.guardrails?.ethical?.length || 0,
          economic: response.guardrails?.economic?.length || 0
        },
        confidence: response.confidence,
        reasoning: response.reasoning ? this.truncate(JSON.stringify(response.reasoning), 500) : null
      } : null,
      error: error ? error.message : null
    };
    
    this.log('LLM_OUTPUT', entry);
    
    console.log('\n┌─────────────────────────────────────────────────────────────────');
    console.log(`│ 🤖 LLM OUTPUT [${approach}] - ${success ? '✅ Success' : '❌ Failed'}`);
    if (success && response.guardrails) {
      console.log(`│ 📊 Guardrails Generated:`);
      console.log(`│    • Critical: ${response.guardrails.critical?.length || 0}`);
      console.log(`│    • Operational: ${response.guardrails.operational?.length || 0}`);
      console.log(`│    • Ethical: ${response.guardrails.ethical?.length || 0}`);
      console.log(`│    • Economic: ${response.guardrails.economic?.length || 0}`);
      console.log(`│ 🎯 Confidence: ${response.confidence || 'N/A'}`);
    } else if (error) {
      console.log(`│ ❌ Error: ${error.message}`);
    }
    console.log('└─────────────────────────────────────────────────────────────────\n');
  }
  
  /**
   * Log specialist agent input
   */
  logAgentInput(agentName: string, context: any) {
    const entry = {
      type: 'AGENT_INPUT',
      agent: agentName,
      timestamp: new Date().toISOString(),
      context: {
        hasAssessment: !!context.assessment,
        hasProblemStatement: !!context.assessment?.problemStatement,
        hasProposedSolution: !!context.assessment?.proposedSolution,
        hasRiskProfile: !!context.riskProfile,
        hasGraph: !!context.graph,
        assessmentFields: context.assessment ? Object.keys(context.assessment).length : 0,
        preview: {
          useCaseTitle: context.assessment?.useCaseTitle,
          problemStatement: this.truncate(context.assessment?.problemStatement || '', 200),
          proposedSolution: this.truncate(context.assessment?.proposedSolution || '', 200)
        }
      }
    };
    
    this.log('AGENT_INPUT', entry);
    
    console.log(`\n┌─── 🤖 AGENT INPUT: ${agentName} ───`);
    console.log(`│ 📋 Use Case: ${context.assessment?.useCaseTitle || 'Unknown'}`);
    console.log(`│ 📝 Problem: ${this.truncate(context.assessment?.problemStatement || 'Not provided', 150)}`);
    console.log(`│ 💡 Solution: ${this.truncate(context.assessment?.proposedSolution || 'Not provided', 150)}`);
    console.log(`│ 📊 Context Fields: ${entry.context.assessmentFields}`);
    console.log(`└───────────────────────────────────────────────────\n`);
  }
  
  /**
   * Log specialist agent output
   */
  logAgentOutput(agentName: string, response: any) {
    const entry = {
      type: 'AGENT_OUTPUT',
      agent: agentName,
      timestamp: new Date().toISOString(),
      output: {
        guardrailsCount: response.guardrails?.length || 0,
        insightsCount: response.insights?.length || 0,
        confidence: response.confidence,
        concernsCount: response.concerns?.length || 0,
        recommendationsCount: response.recommendations?.length || 0,
        insights: response.insights ? response.insights.slice(0, 3) : [],
        concerns: response.concerns ? response.concerns.slice(0, 3) : []
      }
    };

    this.log('AGENT_OUTPUT', entry);

    console.log(`\n┌─── 🤖 AGENT OUTPUT: ${agentName} ───`);
    console.log(`│ 🛡️ Guardrails: ${response.guardrails?.length || 0}`);
    console.log(`│ 💡 Insights: ${response.insights?.length || 0}`);
    console.log(`│ ⚠️ Concerns: ${response.concerns?.length || 0}`);
    console.log(`│ 📋 Recommendations: ${response.recommendations?.length || 0}`);
    console.log(`│ 🎯 Confidence: ${response.confidence || 'N/A'}`);
    if (response.insights && response.insights.length > 0) {
      console.log(`│ 📍 Top Insights:`);
      response.insights.slice(0, 2).forEach((insight: string) => {
        console.log(`│    • ${this.truncate(insight, 100)}`);
      });
    }
    console.log(`└───────────────────────────────────────────────────\n`);
  }

  /**
   * Log agent LLM call with full prompts
   */
  logAgentLLMCall(agentName: string, systemPrompt: string, userPrompt: string, model: string) {
    const entry = {
      type: 'AGENT_LLM_CALL',
      agent: agentName,
      timestamp: new Date().toISOString(),
      model: model,
      prompts: {
        system: systemPrompt,
        user: userPrompt,
        systemLength: systemPrompt.length,
        userLength: userPrompt.length,
        totalLength: systemPrompt.length + userPrompt.length
      }
    };

    this.log('AGENT_LLM_CALL', entry);

    console.log(`\n╔═══════════════════════════════════════════════════════════════════`);
    console.log(`║ 🤖 AGENT LLM CALL: ${agentName}`);
    console.log(`║ 🧠 Model: ${model}`);
    console.log(`║ 📏 System Prompt: ${systemPrompt.length} chars`);
    console.log(`║ 📏 User Prompt: ${userPrompt.length} chars`);
    console.log(`║ 📏 Total: ${systemPrompt.length + userPrompt.length} chars`);
    console.log(`║ ───────────────────────────────────────────────────────────────`);
    console.log(`║ System Prompt Preview:`);
    console.log(`║ ${this.truncate(systemPrompt, 300).replace(/\n/g, '\n║ ')}`);
    console.log(`║ ───────────────────────────────────────────────────────────────`);
    console.log(`║ User Prompt Preview:`);
    console.log(`║ ${this.truncate(userPrompt, 500).replace(/\n/g, '\n║ ')}`);
    console.log(`╚═══════════════════════════════════════════════════════════════════\n`);
  }

  /**
   * Log agent LLM response with full content
   */
  logAgentLLMResponse(agentName: string, rawResponse: string | null, parsedGuardrails: any[], parseSuccess: boolean, error?: any) {
    const entry = {
      type: 'AGENT_LLM_RESPONSE',
      agent: agentName,
      timestamp: new Date().toISOString(),
      response: {
        raw: rawResponse,
        rawLength: rawResponse ? rawResponse.length : 0,
        parsed: parsedGuardrails,
        guardrailsCount: parsedGuardrails.length,
        parseSuccess: parseSuccess,
        error: error ? error.message : null
      }
    };

    this.log('AGENT_LLM_RESPONSE', entry);

    console.log(`\n╔═══════════════════════════════════════════════════════════════════`);
    console.log(`║ 🤖 AGENT LLM RESPONSE: ${agentName}`);
    console.log(`║ ✅ Parse Success: ${parseSuccess}`);
    console.log(`║ 🛡️ Guardrails Generated: ${parsedGuardrails.length}`);
    console.log(`║ 📏 Response Length: ${rawResponse ? rawResponse.length : 0} chars`);
    if (!parseSuccess && error) {
      console.log(`║ ❌ Parse Error: ${error.message}`);
    }
    if (rawResponse) {
      console.log(`║ ───────────────────────────────────────────────────────────────`);
      console.log(`║ Raw Response Preview:`);
      console.log(`║ ${this.truncate(rawResponse, 500).replace(/\n/g, '\n║ ')}`);
    }
    if (parsedGuardrails.length > 0) {
      console.log(`║ ───────────────────────────────────────────────────────────────`);
      console.log(`║ First Guardrail:`);
      const firstGuardrail = parsedGuardrails[0];
      console.log(`║   ID: ${firstGuardrail.id}`);
      console.log(`║   Type: ${firstGuardrail.type}`);
      console.log(`║   Severity: ${firstGuardrail.severity}`);
      console.log(`║   Rule: ${firstGuardrail.rule}`);
      console.log(`║   Description: ${this.truncate(firstGuardrail.description || '', 100)}`);
    }
    console.log(`╚═══════════════════════════════════════════════════════════════════\n`);
  }
  
  /**
   * Log orchestrator actions
   */
  logOrchestratorAction(action: string, details: any) {
    const entry = {
      type: 'ORCHESTRATOR',
      action,
      timestamp: new Date().toISOString(),
      details
    };
    
    this.log('ORCHESTRATOR', entry);
    
    console.log(`\n🎭 ORCHESTRATOR: ${action}`);
    if (details) {
      console.log(`   Details: ${JSON.stringify(details, null, 2).substring(0, 200)}`);
    }
  }
  
  /**
   * Log synthesis process
   */
  logSynthesis(input: any, output: any) {
    const entry = {
      type: 'SYNTHESIS',
      timestamp: new Date().toISOString(),
      input: {
        perspectivesCount: input.perspectives?.length || 0,
        agentGuardrailsCount: input.agentGuardrails?.length || 0
      },
      output: {
        totalGuardrails: output.length || 0,
        byType: this.countByType(output)
      }
    };
    
    this.log('SYNTHESIS', entry);
    
    console.log('\n╔═══════════════════════════════════════════════════════════════════');
    console.log('║ 🔄 SYNTHESIS PROCESS');
    console.log(`║ 📥 Input: ${entry.input.perspectivesCount} LLM perspectives, ${entry.input.agentGuardrailsCount} agent guardrails`);
    console.log(`║ 📤 Output: ${entry.output.totalGuardrails} total guardrails`);
    console.log(`║ 📊 Breakdown: ${JSON.stringify(entry.output.byType)}`);
    console.log('╚═══════════════════════════════════════════════════════════════════\n');
  }
  
  /**
   * Log final output
   */
  logFinalOutput(guardrails: any) {
    const entry = {
      type: 'FINAL_OUTPUT',
      timestamp: new Date().toISOString(),
      summary: {
        totalRules: Object.values(guardrails.guardrails?.rules || {}).flat().length,
        confidence: guardrails.confidence?.overall || 0,
        critical: guardrails.guardrails?.rules?.critical?.length || 0,
        operational: guardrails.guardrails?.rules?.operational?.length || 0,
        ethical: guardrails.guardrails?.rules?.ethical?.length || 0,
        economic: guardrails.guardrails?.rules?.economic?.length || 0
      }
    };
    
    this.log('FINAL_OUTPUT', entry);
    
    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('🎉 FINAL GUARDRAILS GENERATED');
    console.log(`📊 Total Rules: ${entry.summary.totalRules}`);
    console.log(`🎯 Confidence: ${Math.round(entry.summary.confidence * 100)}%`);
    console.log('📋 Breakdown:');
    console.log(`   • Critical: ${entry.summary.critical}`);
    console.log(`   • Operational: ${entry.summary.operational}`);
    console.log(`   • Ethical: ${entry.summary.ethical}`);
    console.log(`   • Economic: ${entry.summary.economic}`);
    console.log('═══════════════════════════════════════════════════════════════════\n');
  }
  
  /**
   * Save logs to file
   */
  saveToFile() {
    try {
      fs.writeFileSync(this.logFilePath, JSON.stringify(this.logBuffer, null, 2));
      console.log(`\n📁 Detailed logs saved to: ${this.logFilePath}`);
    } catch (error) {
      console.error('Failed to save logs:', error);
    }
  }
  
  /**
   * Internal logging
   */
  private log(type: string, data: any) {
    this.logBuffer.push({
      type,
      timestamp: new Date().toISOString(),
      data
    });
  }
  
  /**
   * Utility: Truncate string
   */
  private truncate(str: string, maxLength: number): string {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  }
  
  /**
   * Utility: Count guardrails by type
   */
  private countByType(guardrails: any[]): any {
    const counts: any = {};
    if (Array.isArray(guardrails)) {
      guardrails.forEach(g => {
        counts[g.type] = (counts[g.type] || 0) + 1;
      });
    }
    return counts;
  }
}

export const guardrailLogger = GuardrailLogger.getInstance();