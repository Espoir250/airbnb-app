import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const SAVED_KEY = "savedListings";

function readSaved() {
  const stored = localStorage.getItem(SAVED_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeSaved(ids: string[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
}

export function useSavedListings() {
  return useQuery({
    queryKey: ["saved"],
    queryFn: readSaved,
    initialData: readSaved,
  });
}

export function useToggleSaved() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const current = readSaved();
      const next = current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id];

      writeSaved(next);
      return next;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["saved"] });
      const previousSaved = queryClient.getQueryData<string[]>(["saved"]) ?? readSaved();
      const next = previousSaved.includes(id)
        ? previousSaved.filter((savedId) => savedId !== id)
        : [...previousSaved, id];

      queryClient.setQueryData<string[]>(["saved"], next);
      return { previousSaved };
    },
    onError: (_error, _id, context) => {
      writeSaved(context?.previousSaved ?? []);
      queryClient.setQueryData(["saved"], context?.previousSaved ?? []);
    },
    onSuccess: (next) => {
      queryClient.setQueryData(["saved"], next);
    },
  });
}
