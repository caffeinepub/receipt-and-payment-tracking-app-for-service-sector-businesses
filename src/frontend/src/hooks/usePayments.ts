import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Payment } from '../backend';

export function useGetReceiptPayments(receiptId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Payment[]>({
    queryKey: ['payments', receiptId?.toString()],
    queryFn: async () => {
      if (!actor || !receiptId) return [];
      return actor.getReceiptPayments(receiptId);
    },
    enabled: !!actor && !actorFetching && receiptId !== null,
  });
}

export function useAddPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { receiptId: bigint; payment: Payment }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPayment(data.receiptId, data.payment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}
