import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { BusinessProfile } from '../backend';

export function useGetBusinessProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BusinessProfile | null>({
    queryKey: ['businessProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBusinessProfile();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveBusinessProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: BusinessProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveBusinessProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessProfile'] });
    },
  });
}
