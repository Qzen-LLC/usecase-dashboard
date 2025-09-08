import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';

// GET /api/golden/entries - Get entries for a dataset
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const datasetId = searchParams.get('datasetId');
    const entryId = searchParams.get('id');
    const category = searchParams.get('category');

    if (entryId) {
      // Get specific entry
      const entry = await prismaClient.goldenEntry.findUnique({
        where: { id: entryId },
        include: {
          reviews: true
        }
      });

      if (!entry) {
        return NextResponse.json(
          { error: 'Entry not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(entry);
    }

    if (!datasetId) {
      return NextResponse.json(
        { error: 'Dataset ID is required' },
        { status: 400 }
      );
    }

    // Build query with filters
    const where: any = { datasetId };
    if (category) {
      where.category = category;
    }

    const entries = await prismaClient.goldenEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reviews: {
          select: {
            id: true,
            decision: true,
            reviewer: true
          }
        }
      }
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error in GET /api/golden/entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/golden/entries - Create new entry
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      datasetId,
      category,
      input,
      expectedOutputs,
      metadata,
      quality
    } = body;

    if (!datasetId || !category || !input) {
      return NextResponse.json(
        { error: 'Missing required fields: datasetId, category, and input' },
        { status: 400 }
      );
    }

    // Verify dataset exists
    const dataset = await prismaClient.goldenDataset.findUnique({
      where: { id: datasetId }
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Create the entry
    const entry = await prismaClient.goldenEntry.create({
      data: {
        datasetId,
        category,
        inputSpec: input,
        expectedOutputs: expectedOutputs || [],
        metadata: metadata || {},
        quality: quality || {
          validationScore: 0,
          clarityScore: 0,
          completenessScore: 0,
          relevanceScore: 0,
          expertReviewed: false,
          productionTested: false
        },
        version: 1
      }
    });

    // Update dataset statistics
    await updateDatasetStatistics(datasetId);

    return NextResponse.json({
      success: true,
      entry,
      message: 'Entry created successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/golden/entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/golden/entries - Update entry
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
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // Get existing entry
    const existingEntry = await prismaClient.goldenEntry.findUnique({
      where: { id }
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Store previous version if content is changing
    const previousVersions = existingEntry.previousVersions || [];
    previousVersions.push({
      version: existingEntry.version,
      content: {
        inputSpec: existingEntry.inputSpec,
        expectedOutputs: existingEntry.expectedOutputs,
        metadata: existingEntry.metadata
      },
      updatedAt: existingEntry.updatedAt
    });

    // Update the entry
    const entry = await prismaClient.goldenEntry.update({
      where: { id },
      data: {
        ...updates,
        version: existingEntry.version + 1,
        previousVersions: previousVersions
      }
    });

    // Update dataset statistics
    await updateDatasetStatistics(existingEntry.datasetId);

    return NextResponse.json({
      success: true,
      entry,
      message: 'Entry updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /api/golden/entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/golden/entries - Delete entry
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
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // Get entry to know the dataset
    const entry = await prismaClient.goldenEntry.findUnique({
      where: { id }
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Delete the entry
    await prismaClient.goldenEntry.delete({
      where: { id }
    });

    // Update dataset statistics
    await updateDatasetStatistics(entry.datasetId);

    return NextResponse.json({
      success: true,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/golden/entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update dataset statistics
async function updateDatasetStatistics(datasetId: string) {
  try {
    const entries = await prismaClient.goldenEntry.findMany({
      where: { datasetId }
    });

    const stats = {
      totalEntries: entries.length,
      byCategory: {} as Record<string, number>,
      byDifficulty: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      avgQualityScore: 0,
      lastUpdated: new Date().toISOString()
    };

    let totalQuality = 0;
    
    entries.forEach(entry => {
      // Count by category
      stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;
      
      // Count by difficulty and source from metadata
      const metadata = typeof entry.metadata === 'object' ? entry.metadata as any : {};
      const difficulty = metadata.difficulty || 'medium';
      const source = metadata.source || 'manual';
      
      stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
      
      // Sum quality scores
      const quality = typeof entry.quality === 'object' ? entry.quality as any : {};
      totalQuality += quality.validationScore || 0;
    });

    if (entries.length > 0) {
      stats.avgQualityScore = totalQuality / entries.length;
    }

    // Update dataset with new statistics
    await prismaClient.goldenDataset.update({
      where: { id: datasetId },
      data: {
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Error updating dataset statistics:', error);
  }
}