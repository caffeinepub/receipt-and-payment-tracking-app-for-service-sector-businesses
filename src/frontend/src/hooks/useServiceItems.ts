import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ServiceItem } from '../backend';

export function useGetServiceItems() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ServiceItem[]>({
    queryKey: ['serviceItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServiceItems();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddServiceItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: ServiceItem) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addServiceItem(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceItems'] });
    },
  });
}
