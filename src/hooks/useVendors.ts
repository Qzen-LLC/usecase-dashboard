import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

// API functions
const fetchVendors = async (): Promise<VendorData[]> => {
  const response = await fetch('/api/vendors');
  if (!response.ok) {
    throw new Error('Failed to fetch vendors');
  }
  return response.json();
};

const createVendor = async (vendorData: Partial<VendorData>): Promise<VendorData> => {
  const response = await fetch('/api/vendors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vendorData),
  });
  if (!response.ok) {
    throw new Error('Failed to create vendor');
  }
  return response.json();
};

const updateVendor = async ({ id, ...vendorData }: Partial<VendorData> & { id: string }): Promise<VendorData> => {
  const response = await fetch(`/api/vendors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vendorData),
  });
  if (!response.ok) {
    throw new Error('Failed to update vendor');
  }
  return response.json();
};

const deleteVendor = async (vendorId: string): Promise<void> => {
  const response = await fetch(`/api/vendors/${vendorId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete vendor');
  }
};

// Custom hooks
export const useVendors = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: fetchVendors,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateVendor,
    onMutate: async (updatedVendor) => {
      await queryClient.cancelQueries({ queryKey: ['vendors'] });
      const previousVendors = queryClient.getQueryData<VendorData[]>(['vendors']);
      
      if (previousVendors) {
        queryClient.setQueryData<VendorData[]>(['vendors'], old => 
          old?.map(vendor => vendor.id === updatedVendor.id ? { ...vendor, ...updatedVendor } : vendor) || []
        );
      }
      
      return { previousVendors };
    },
    onError: (err, variables, context) => {
      if (context?.previousVendors) {
        queryClient.setQueryData(['vendors'], context.previousVendors);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteVendor,
    onMutate: async (vendorId) => {
      await queryClient.cancelQueries({ queryKey: ['vendors'] });
      const previousVendors = queryClient.getQueryData<VendorData[]>(['vendors']);
      
      if (previousVendors) {
        queryClient.setQueryData<VendorData[]>(['vendors'], old => 
          old?.filter(vendor => vendor.id !== vendorId) || []
        );
      }
      
      return { previousVendors };
    },
    onError: (err, variables, context) => {
      if (context?.previousVendors) {
        queryClient.setQueryData(['vendors'], context.previousVendors);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}; 