import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';
import { DatasetStatistics, QualityMetrics } from '@/lib/golden/types';

// GET /api/golden/datasets - List datasets or get specific dataset
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const datasetId = searchParams.get('id');
    const useCaseId = searchParams.get('useCaseId');

    if (datasetId) {
      // Get specific dataset with entries
      const dataset = await prismaClient.goldenDataset.findUnique({
        where: { id: datasetId },
        include: {
          entries: {
            include: {
              reviews: true
            }
          }
        }
      });

      if (!dataset) {
        return NextResponse.json(
          { error: 'Dataset not found' },
          { status: 404 }
        );
      }

      // Calculate statistics
      const statistics = calculateStatistics(dataset.entries || []);
      const qualityMetrics = calculateQualityMetrics(dataset.entries || []);

      return NextResponse.json({
        ...dataset,
        metadata: dataset.metadata || {},
        statistics: statistics,
        qualityMetrics: qualityMetrics,
        validationStatus: dataset.validationStatus || {},
        entries: dataset.entries
      });
    }

    // List datasets, optionally filtered by use case
    if (!useCaseId) {
      return NextResponse.json(
        { error: 'useCaseId is required' },
        { status: 400 }
      );
    }

    const datasets = await prismaClient.goldenDataset.findMany({
      where: { useCaseId },
      orderBy: { createdAt: 'desc' },
      include: {
        entries: {
          select: {
            id: true
          }
        }
      }
    });

    // Add entry count to each dataset
    const datasetsWithCounts = datasets.map(dataset => ({
      ...dataset,
      entryCount: dataset.entries.length,
      entries: undefined // Remove entries array from response
    }));

    return NextResponse.json(datasetsWithCounts);
  } catch (error) {
    console.error('Error in GET /api/golden/datasets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/golden/datasets - Create new dataset
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      useCaseId, 
      name, 
      description, 
      metadata,
      validationStatus = {
        status: 'draft',
        validationProgress: {
          totalEntries: 0,
          validated: 0,
          pending: 0,
          rejected: 0
        },
        approvals: [],
        readyForProduction: false,
        productionChecklist: [],
        lastValidated: new Date().toISOString()
      }
    } = body;

    if (!useCaseId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: useCaseId and name' },
        { status: 400 }
      );
    }

    // Verify use case exists
    const useCase = await prismaClient.useCase.findUnique({
      where: { id: useCaseId }
    });

    if (!useCase) {
      return NextResponse.json(
        { error: 'Use case not found' },
        { status: 404 }
      );
    }

    // Create the dataset
    const dataset = await prismaClient.goldenDataset.create({
      data: {
        useCaseId,
        name,
        description: description || '',
        version: '1.0.0',
        metadata: metadata || {},
        validationStatus: validationStatus,
        statistics: {
          totalEntries: 0,
          byCategory: {},
          byDifficulty: {},
          bySource: {},
          avgQualityScore: 0
        },
        qualityMetrics: {
          overallScore: 0,
          dimensions: {
            completeness: 0,
            correctness: 0,
            consistency: 0,
            clarity: 0,
            diversity: 0,
            relevance: 0
          },
          issues: [],
          recommendations: []
        }
      }
    });

    return NextResponse.json({
      success: true,
      dataset,
      message: 'Golden dataset created successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/golden/datasets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/golden/datasets - Update dataset
export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Dataset ID is required' },
        { status: 400 }
      );
    }

    // Verify dataset exists
    const existingDataset = await prismaClient.goldenDataset.findUnique({
      where: { id }
    });

    if (!existingDataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Update the dataset
    const dataset = await prismaClient.goldenDataset.update({
      where: { id },
      data: updates
    });

    return NextResponse.json({
      success: true,
      dataset,
      message: 'Dataset updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /api/golden/datasets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/golden/datasets - Delete dataset
export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Dataset ID is required' },
        { status: 400 }
      );
    }

    // Delete the dataset (entries will cascade delete)
    await prismaClient.goldenDataset.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Dataset deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/golden/datasets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateStatistics(entries: any[]): Partial<DatasetStatistics> {
  const stats: Partial<DatasetStatistics> = {
    totalEntries: entries.length,
    byCategory: {},
    byDifficulty: {},
    bySource: {},
    avgQualityScore: 0
  };

  if (entries.length === 0) return stats;

  let totalQuality = 0;
  entries.forEach(entry => {
    // Count by category
    const category = entry.category || 'uncategorized';
    stats.byCategory![category] = (stats.byCategory![category] || 0) + 1;

    // Count by difficulty
    const metadata = typeof entry.metadata === 'object' ? entry.metadata : {};
    const difficulty = metadata.difficulty || 'medium';
    stats.byDifficulty![difficulty] = (stats.byDifficulty![difficulty] || 0) + 1;

    // Count by source
    const source = metadata.source || 'manual';
    stats.bySource![source] = (stats.bySource![source] || 0) + 1;

    // Sum quality scores
    const quality = typeof entry.quality === 'object' ? entry.quality : {};
    totalQuality += quality.validationScore || 0;
  });

  stats.avgQualityScore = totalQuality / entries.length;
  stats.lastUpdated = new Date().toISOString();

  return stats;
}

function calculateQualityMetrics(entries: any[]): Partial<QualityMetrics> {
  if (entries.length === 0) {
    return {
      overallScore: 0,
      dimensions: {
        completeness: 0,
        correctness: 0,
        consistency: 0,
        clarity: 0,
        diversity: 0,
        relevance: 0
      },
      issues: [],
      recommendations: []
    };
  }

  // Calculate dimension scores
  const dimensions = {
    completeness: calculateCompleteness(entries),
    correctness: calculateCorrectness(entries),
    consistency: calculateConsistency(entries),
    clarity: calculateClarity(entries),
    diversity: calculateDiversity(entries),
    relevance: calculateRelevance(entries)
  };

  const overallScore = Object.values(dimensions).reduce((sum, score) => sum + score, 0) / 6;

  // Identify issues
  const issues = identifyQualityIssues(entries);

  // Generate recommendations
  const recommendations = generateRecommendations(dimensions, issues);

  return {
    overallScore,
    dimensions,
    issues,
    recommendations
  };
}

function calculateCompleteness(entries: any[]): number {
  // Check if entries cover various categories and difficulties
  const categories = new Set(entries.map(e => e.category));
  const metadata = entries.map(e => typeof e.metadata === 'object' ? e.metadata : {});
  const difficulties = new Set(metadata.map(m => m.difficulty));
  
  const categoryScore = Math.min(categories.size / 5, 1); // Expect at least 5 categories
  const difficultyScore = Math.min(difficulties.size / 4, 1); // Expect all 4 difficulties
  
  return (categoryScore + difficultyScore) / 2;
}

function calculateCorrectness(entries: any[]): number {
  // Average validation scores
  const validScores = entries
    .map(e => typeof e.quality === 'object' ? e.quality : {})
    .filter(q => q.validationScore !== undefined)
    .map(q => q.validationScore);
  
  if (validScores.length === 0) return 0.5; // Default if no validation
  
  return validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length;
}

function calculateConsistency(entries: any[]): number {
  // Check for consistency in format and structure
  let consistentCount = 0;
  
  entries.forEach(entry => {
    const input = typeof entry.inputSpec === 'object' ? entry.inputSpec : {};
    const hasInput = input.prompt;
    const hasOutput = entry.expectedOutputs;
    const hasMetadata = entry.metadata;
    
    if (hasInput && hasOutput && hasMetadata) {
      consistentCount++;
    }
  });
  
  return entries.length > 0 ? consistentCount / entries.length : 0;
}

function calculateClarity(entries: any[]): number {
  // Average clarity scores
  const clarityScores = entries
    .map(e => typeof e.quality === 'object' ? e.quality : {})
    .filter(q => q.clarityScore !== undefined)
    .map(q => q.clarityScore);
  
  if (clarityScores.length === 0) return 0.7; // Default
  
  return clarityScores.reduce((sum: number, score: number) => sum + score, 0) / clarityScores.length;
}

function calculateDiversity(entries: any[]): number {
  // Measure diversity of inputs
  const uniquePrompts = new Set(
    entries
      .map(e => {
        const input = typeof e.inputSpec === 'object' ? e.inputSpec : {};
        return input.prompt?.toLowerCase();
      })
      .filter(p => p)
  );
  const diversityRatio = uniquePrompts.size / Math.max(entries.length, 1);
  
  return diversityRatio;
}

function calculateRelevance(entries: any[]): number {
  // Average relevance scores
  const relevanceScores = entries
    .map(e => typeof e.quality === 'object' ? e.quality : {})
    .filter(q => q.relevanceScore !== undefined)
    .map(q => q.relevanceScore);
  
  if (relevanceScores.length === 0) return 0.8; // Default
  
  return relevanceScores.reduce((sum: number, score: number) => sum + score, 0) / relevanceScores.length;
}

function identifyQualityIssues(entries: any[]): any[] {
  const issues = [];
  
  // Check for duplicates
  const prompts = entries
    .map(e => {
      const input = typeof e.inputSpec === 'object' ? e.inputSpec : {};
      return input.prompt?.toLowerCase();
    })
    .filter(p => p);
  
  const duplicates = prompts.filter((p, i) => prompts.indexOf(p) !== i);
  
  if (duplicates.length > 0) {
    issues.push({
      type: 'duplicate',
      severity: 'medium',
      description: `Found ${duplicates.length} duplicate entries`,
      affectedEntries: duplicates
    });
  }
  
  // Check for low quality entries
  const lowQuality = entries.filter(e => {
    const quality = typeof e.quality === 'object' ? e.quality : {};
    return (quality.validationScore || 0) < 0.5;
  });
  
  if (lowQuality.length > 0) {
    issues.push({
      type: 'quality',
      severity: 'high',
      description: `${lowQuality.length} entries have low quality scores`,
      affectedEntries: lowQuality.map(e => e.id)
    });
  }
  
  return issues;
}

function generateRecommendations(dimensions: any, issues: any[]): string[] {
  const recommendations = [];
  
  if (dimensions.completeness < 0.7) {
    recommendations.push('Add more diverse categories and difficulty levels');
  }
  
  if (dimensions.diversity < 0.8) {
    recommendations.push('Increase input diversity to improve coverage');
  }
  
  if (dimensions.clarity < 0.7) {
    recommendations.push('Review and clarify ambiguous entries');
  }
  
  if (issues.some((i: any) => i.type === 'duplicate')) {
    recommendations.push('Remove or merge duplicate entries');
  }
  
  return recommendations;
}