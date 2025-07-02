// Server-side vendor service that uses Prisma
import { prismaClient as prisma } from '@/utils/db';

export interface VendorData {
  id: string;
  name: string;
  category: string;
  website: string;
  contactPerson: string;
  contactEmail: string;
  assessmentDate: string;
  overallScore: number;
  status: 'In Assessment' | 'Approved' | 'Rejected' | 'On Hold';
  notes: string;
  scores: { [key: string]: number };
  comments: { [key: string]: string };
  approvals: {
    [key in 'Procurement' | 'Legal' | 'Governance' | 'Compliance']: {
      status: 'Pending' | 'Approved' | 'Rejected';
      approvedBy: string | null;
      approvedDate: string | null;
      comments: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

// Map database enums to frontend strings
const statusMap = {
  'IN_ASSESSMENT': 'In Assessment',
  'APPROVED': 'Approved', 
  'REJECTED': 'Rejected',
  'ON_HOLD': 'On Hold'
} as const;

const reverseStatusMap = {
  'In Assessment': 'IN_ASSESSMENT',
  'Approved': 'APPROVED',
  'Rejected': 'REJECTED', 
  'On Hold': 'ON_HOLD'
} as const;

const approvalAreaMap = {
  'PROCUREMENT': 'Procurement',
  'LEGAL': 'Legal',
  'GOVERNANCE': 'Governance',
  'COMPLIANCE': 'Compliance'
} as const;

const reverseApprovalAreaMap = {
  'Procurement': 'PROCUREMENT',
  'Legal': 'LEGAL',
  'Governance': 'GOVERNANCE',
  'Compliance': 'COMPLIANCE'
} as const;

export const vendorServiceServer = {
  // Get all vendors
  async getVendors() {
    try {
      const vendors = await prisma.vendor.findMany({
        include: {
          assessmentScores: true,
          approvalAreas: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Transform the data to match the frontend format
      const transformedData: VendorData[] = vendors.map(vendor => {
        const scores = vendor.assessmentScores.reduce((acc: any, score: any) => {
          const key = `${score.category}-${score.subcategory}`;
          acc[key] = score.score;
          return acc;
        }, {});

        const comments = vendor.assessmentScores.reduce((acc: any, score: any) => {
          const key = `${score.category}-${score.subcategory}`;
          acc[key] = score.comment || '';
          return acc;
        }, {});

        const approvals = vendor.approvalAreas.reduce((acc: any, approval: any) => {
          const areaKey = approvalAreaMap[approval.area as keyof typeof approvalAreaMap];
          acc[areaKey] = {
            status: approval.status === 'PENDING' ? 'Pending' : 
                   approval.status === 'APPROVED' ? 'Approved' : 'Rejected',
            approvedBy: approval.approvedBy,
            approvedDate: approval.approvedDate?.toISOString() || null,
            comments: approval.comments || ''
          };
          return acc;
        }, {});

        // Ensure all approval areas exist
        const defaultApprovals = {
          'Procurement': { status: 'Pending' as const, approvedBy: null, approvedDate: null, comments: '' },
          'Legal': { status: 'Pending' as const, approvedBy: null, approvedDate: null, comments: '' },
          'Governance': { status: 'Pending' as const, approvedBy: null, approvedDate: null, comments: '' },
          'Compliance': { status: 'Pending' as const, approvedBy: null, approvedDate: null, comments: '' }
        };

        return {
          id: vendor.id,
          name: vendor.name,
          category: vendor.category,
          website: vendor.website || '',
          contactPerson: vendor.contactPerson || '',
          contactEmail: vendor.contactEmail || '',
          assessmentDate: vendor.assessmentDate?.toISOString().split('T')[0] || '',
          overallScore: vendor.overallScore,
          status: statusMap[vendor.status] as any,
          notes: vendor.notes || '',
          scores,
          comments,
          approvals: { ...defaultApprovals, ...approvals } as any,
          createdAt: vendor.createdAt.toISOString(),
          updatedAt: vendor.updatedAt.toISOString()
        };
      });

      return { data: transformedData, error: null };
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      return { data: null, error: error.message };
    }
  },

  // Create a new vendor
  async createVendor(vendorData: Partial<VendorData>) {
    try {
      const vendor = await prisma.vendor.create({
        data: {
          name: vendorData.name!,
          category: vendorData.category!,
          website: vendorData.website || null,
          contactPerson: vendorData.contactPerson || null,
          contactEmail: vendorData.contactEmail || null,
          assessmentDate: vendorData.assessmentDate ? new Date(vendorData.assessmentDate) : null,
          overallScore: vendorData.overallScore || 0,
          status: vendorData.status ? reverseStatusMap[vendorData.status as keyof typeof reverseStatusMap] : 'IN_ASSESSMENT',
          notes: vendorData.notes || null
        }
      });

      // Initialize approval areas for the new vendor
      await this.initializeApprovalAreas(vendor.id);

      return { data: vendor, error: null };
    } catch (error: any) {
      console.error('Error creating vendor:', error);
      return { data: null, error: error.message };
    }
  },

  // Update an existing vendor
  async updateVendor(vendorId: string, vendorData: Partial<VendorData>) {
    try {
      const vendor = await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          name: vendorData.name,
          category: vendorData.category,
          website: vendorData.website || null,
          contactPerson: vendorData.contactPerson || null,
          contactEmail: vendorData.contactEmail || null,
          assessmentDate: vendorData.assessmentDate ? new Date(vendorData.assessmentDate) : null,
          overallScore: vendorData.overallScore,
          status: vendorData.status ? reverseStatusMap[vendorData.status as keyof typeof reverseStatusMap] : undefined,
          notes: vendorData.notes || null
        }
      });

      return { data: vendor, error: null };
    } catch (error: any) {
      console.error('Error updating vendor:', error);
      return { data: null, error: error.message };
    }
  },

  // Delete a vendor
  async deleteVendor(vendorId: string) {
    try {
      await prisma.vendor.delete({
        where: { id: vendorId }
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error deleting vendor:', error);
      return { error: error.message };
    }
  },

  // Update assessment scores
  async updateAssessmentScore(vendorId: string, category: string, subcategory: string, score: number, comment: string) {
    try {
      await prisma.assessmentScore.upsert({
        where: {
          vendorId_category_subcategory: {
            vendorId,
            category,
            subcategory
          }
        },
        update: {
          score,
          comment: comment || null
        },
        create: {
          vendorId,
          category,
          subcategory,
          score,
          comment: comment || null
        }
      });

      return { data: true, error: null };
    } catch (error: any) {
      console.error('Error updating assessment score:', error);
      return { data: null, error: error.message };
    }
  },

  // Calculate and update overall score for a vendor
  async calculateOverallScore(vendorId: string) {
    try {
      const scores = await prisma.assessmentScore.findMany({
        where: { 
          vendorId,
          score: { gt: 0 }
        }
      });

      if (scores.length === 0) {
        return { data: 0, error: null };
      }

      // Calculate average
      const total = scores.reduce((sum, item) => sum + item.score, 0);
      const average = Math.round((total / scores.length) * 10) / 10;

      // Update vendor with new overall score
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { overallScore: average }
      });

      return { data: average, error: null };
    } catch (error: any) {
      console.error('Error calculating overall score:', error);
      return { data: null, error: error.message };
    }
  },

  // Initialize approval areas for a vendor
  async initializeApprovalAreas(vendorId: string) {
    try {
      const approvalAreas = ['PROCUREMENT', 'LEGAL', 'GOVERNANCE', 'COMPLIANCE'] as const;
      
      const createPromises = approvalAreas.map(area => 
        prisma.approvalArea.upsert({
          where: {
            vendorId_area: {
              vendorId,
              area
            }
          },
          update: {},
          create: {
            vendorId,
            area,
            status: 'PENDING'
          }
        })
      );

      await Promise.all(createPromises);

      return { error: null };
    } catch (error: any) {
      console.error('Error initializing approval areas:', error);
      return { error: error.message };
    }
  },

  // Update approval area status
  async updateApprovalArea(vendorId: string, area: string, status: string, approvedBy?: string, comments?: string) {
    try {
      const dbArea = reverseApprovalAreaMap[area as keyof typeof reverseApprovalAreaMap];
      const dbStatus = status === 'Pending' ? 'PENDING' : status === 'Approved' ? 'APPROVED' : 'REJECTED';

      const updateData: any = {
        status: dbStatus,
        comments: comments || null
      };

      if (status === 'Approved' && approvedBy) {
        updateData.approvedBy = approvedBy;
        updateData.approvedDate = new Date();
      }

      await prisma.approvalArea.upsert({
        where: {
          vendorId_area: {
            vendorId,
            area: dbArea
          }
        },
        update: updateData,
        create: {
          vendorId,
          area: dbArea,
          ...updateData
        }
      });

      // Check if all areas are approved and update vendor status
      await this.checkAndUpdateVendorStatus(vendorId);

      return { error: null };
    } catch (error: any) {
      console.error('Error updating approval area:', error);
      return { error: error.message };
    }
  },

  // Check if all approval areas are approved and update vendor status
  async checkAndUpdateVendorStatus(vendorId: string) {
    try {
      const approvals = await prisma.approvalArea.findMany({
        where: { vendorId }
      });

      const allApproved = approvals.length === 4 && approvals.every(approval => approval.status === 'APPROVED');
      const anyRejected = approvals.some(approval => approval.status === 'REJECTED');

      let newStatus: 'IN_ASSESSMENT' | 'APPROVED' | 'REJECTED' = 'IN_ASSESSMENT';
      if (allApproved) {
        newStatus = 'APPROVED';
      } else if (anyRejected) {
        newStatus = 'REJECTED';
      }

      await prisma.vendor.update({
        where: { id: vendorId },
        data: { status: newStatus }
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error checking vendor status:', error);
      return { error: error.message };
    }
  },

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const vendors = await prisma.vendor.findMany({
        select: {
          category: true,
          status: true,
          overallScore: true
        }
      });

      const categories = [
        'LLM/Foundation Models',
        'LLM Orchestration',
        'Agentic Frameworks',
        'Conversational AI',
        'Document Intelligence',
        'Code Generation',
        'Content Generation',
        'Analytics & Insights',
        'MLOps Platform',
        'Speech & Audio AI',
        'Robotic Process Automation',
        'Edge AI & IoT',
        'AI Hardware & Infrastructure',
        'Data Labeling & Annotation',
        'AI Testing & Validation',
        'AI Governance & Risk',
        'Other'
      ];

      const categoryData = categories.map(category => {
        const categoryVendors = vendors.filter(v => v.category === category);
        return {
          category,
          total: categoryVendors.length,
          approved: categoryVendors.filter(v => v.status === 'APPROVED').length,
          inAssessment: categoryVendors.filter(v => v.status === 'IN_ASSESSMENT').length,
          rejected: categoryVendors.filter(v => v.status === 'REJECTED').length,
          onHold: categoryVendors.filter(v => v.status === 'ON_HOLD').length,
          avgScore: categoryVendors.length > 0 ? 
            Math.round((categoryVendors.reduce((sum, v) => sum + (v.overallScore || 0), 0) / categoryVendors.length) * 10) / 10 : 0
        };
      });

      const overallStats = {
        totalVendors: vendors.length,
        approved: vendors.filter(v => v.status === 'APPROVED').length,
        inAssessment: vendors.filter(v => v.status === 'IN_ASSESSMENT').length,
        rejected: vendors.filter(v => v.status === 'REJECTED').length,
        onHold: vendors.filter(v => v.status === 'ON_HOLD').length,
        avgScore: vendors.length > 0 ? 
          Math.round((vendors.reduce((sum, v) => sum + (v.overallScore || 0), 0) / vendors.length) * 10) / 10 : 0,
        highPerformers: vendors.filter(v => v.overallScore >= 4).length,
        needsAttention: vendors.filter(v => v.overallScore > 0 && v.overallScore < 3).length
      };

      return { data: { categoryData, overallStats }, error: null };
    } catch (error: any) {
      console.error('Error getting dashboard stats:', error);
      return { data: null, error: error.message };
    }
  }
};