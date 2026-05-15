import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  api,
  extractRecord,
  mapListing,
  type BackendListing,
} from "../../../lib/api";
import { useAuth } from "../../auth/hooks/useAuth";
import type { ListingFormInput } from "../schemas/listing";
import {
  categoryToBackendType,
  legacyCategoryToBackendType,
  listingPayload,
  uploadListingImages,
} from "../utils/listingPayload";

export function useCreateListing() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: ListingFormInput) => {
      if (!user?.id) {
        throw new Error("Please log in as a host before creating a listing.");
      }

      // Upload all selected images to Cloudinary
      const files = input.image ? Array.from(input.image as FileList) as File[] : [];
      const allImageUrls = await uploadListingImages(files);
      const primaryImageUrl = allImageUrls[0];

      const payload = listingPayload(
        input,
        primaryImageUrl,
        categoryToBackendType(input.category),
        user,
        allImageUrls,
      );
      const legacyPayload = listingPayload(
        input,
        primaryImageUrl,
        legacyCategoryToBackendType(input.category),
        user,
        allImageUrls,
      );

      let body: BackendListing | { data: BackendListing } | undefined;
      let lastError: Error | null = null;

      for (const path of ["/api/v1/listings", "/api/listings"]) {
        try {
          body = await api.post<BackendListing | { data: BackendListing }>(
            path,
            payload,
          );
          break;
        } catch (error) {
          try {
            body = await api.post<BackendListing | { data: BackendListing }>(
              path,
              legacyPayload,
            );
            break;
          } catch (legacyError) {
            lastError =
              legacyError instanceof Error
                ? legacyError
                : error instanceof Error
                  ? error
                  : new Error("Request failed");
          }
        }
      }

      if (!body) throw lastError ?? new Error("Could not create listing.");
      return mapListing(extractRecord(body));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["host-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing created successfully!");
      navigate("/host");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not create listing."),
  });
}