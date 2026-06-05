import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/orders', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-buyer'] });
    },
  });
};

export const useBuyerOrders = (status: string, page: number, limit: number) => {
  return useQuery({
    queryKey: ['orders-buyer', status, page, limit],
    queryFn: async () => {
      const response = await api.get('/orders/buyer', { params: { status, page, limit } });
      return response.data;
    },
  });
};

export const useSellerOrders = (status: string, page: number, limit: number) => {
  return useQuery({
    queryKey: ['orders-seller', status, page, limit],
    queryFn: async () => {
      const response = await api.get('/orders/seller', { params: { status, page, limit } });
      return response.data;
    },
  });
};

export const useOrderDetail = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/orders/${id}/status`, data);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['orders-seller'] });
    },
  });
};

export const useConfirmOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/orders/${id}/confirm`);
      return response.data.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders-buyer'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.put(`/orders/${id}/cancel`, { reason });
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['orders-buyer'] });
    },
  });
};
