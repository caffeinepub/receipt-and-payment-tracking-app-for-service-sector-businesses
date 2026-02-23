import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Customer } from '../backend';

export function useGetCustomers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCustomers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer: Customer) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCustomer(customer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
