import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../../lib/api";
import type { Listing } from "../../listings/types";
import type { ListingFormInput } from "../schemas/listing";
import {
  categoryToBackendType,
  legacyCategoryToBackendType,
  listingPayload,
  uploadListingImage,
} from "../utils/listingPayload";

type UpdateInput = ListingFormInput & { id: string };

function optimisticListing(input: UpdateInput, previous?: Listing): Listing {
  const file = input.image?.[0] as File | undefined;
  const image = file
    ? URL.createObjectURL(file)
    : (previous?.img?.[0] ?? undefined);

  return {
    ...(previous as Listing),
    id: input.id,
    title: input.title,
    description: input.description,
    location: input.location,
    price: input.price,
    category: input.category,
    guests: input.guests,
    superhost: input.superhost ?? false,
    available: input.available ?? true,
    availableFrom: input.availableFrom,
    rating: previous?.rating ?? null,
    img: image ? [image] : (previous?.img ?? []),
  };
}

export function useUpdateListing(id: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (input: UpdateInput) => {
      const file = input.image?.[0] as File | undefined;
      const imageUrl = await uploadListingImage(file);
      const payload = listingPayload(input, imageUrl, categoryToBackendType(input.category));
      const legacyPayload = listingPayload(
        input,
        imageUrl,
        legacyCategoryToBackendType(input.category),
      );

      try {
        return await api.put(`/api/v1/listings/${input.id}`, payload);
      } catch {
        return api.put(`/api/v1/listings/${input.id}`, legacyPayload);
      }
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["listing", id] });
      const previous = queryClient.getQueryData<Listing>(["listing", id]);
      queryClient.setQueryData(
        ["listing", id],
        optimisticListing(input, previous),
      );
      return { previous };
    },
    onError: (error: Error, _input, context) => {
      queryClient.setQueryData(["listing", id], context?.previous);
      toast.error(error.message || "Could not update listing.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["host-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing updated.");
      navigate("/host");
    },
  });
}
