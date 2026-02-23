import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Receipt, Customer, LineItem } from '../backend';

export function useGetReceipts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Receipt[]>({
    queryKey: ['receipts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReceiptsSorted('date');
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateReceipt() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { number: string; customer: Customer; items: LineItem[]; total: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createReceipt(data.number, data.customer, data.items, data.total);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
  });
}
