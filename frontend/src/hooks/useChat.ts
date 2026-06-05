import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      const response = await api.post('/chat/message', { message });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });
};

export const useChatHistory = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['chat-history', page, limit],
    queryFn: async () => {
      const response = await api.get('/chat/history', { params: { page, limit } });
      return response.data;
    },
  });
};

export const useComplaintDetail = (id: string) => {
  return useQuery({
    queryKey: ['complaint', id],
    queryFn: async () => {
      const response = await api.get(`/chat/complaint/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};
