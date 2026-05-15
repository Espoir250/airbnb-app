import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Listing } from "../../listings/types";
import { listingSchema, type ListingFormInput } from "../schemas/listing";
import { LISTING_CATEGORIES, normalizeFormCategory } from "../utils/listingPayload";

type Props = {
  listing?: Listing;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (input: ListingFormInput) => void;
};

export function ListingForm({
  listing,
  submitting,
  submitLabel,
  onSubmit,
}: Props) {
  const [previews, setPreviews] = useState<string[]>(listing?.img ?? []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListingFormInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing?.title ?? "",
      description: listing?.description ?? "",
      location: listing?.location ?? "",
      price: listing?.price ?? 10,
      category: normalizeFormCategory(listing?.category ?? listing?.type),
      guests: listing?.guests ?? 1,
      superhost: listing?.superhost ?? false,
      available: listing?.available ?? true,
      availableFrom:
        listing?.availableFrom ?? new Date().toISOString().slice(0, 10),
    },
  });

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 3);
    if (files.length === 0) return;

    // Rebuild FileList with only the first 3 so schema validation passes
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    event.target.files = dt.files;

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  }

  return (
    <form className="formStack wideForm" onSubmit={handleSubmit(onSubmit)}>
      <label>
        Title
        <input {...register("title")} />
        {errors.title && <p className="formError">{errors.title.message}</p>}
      </label>
      <label>
        Description
        <textarea rows={5} {...register("description")} />
        {errors.description && (
          <p className="formError">{errors.description.message}</p>
        )}
      </label>
      <label>
        Location
        <input {...register("location")} />
        {errors.location && (
          <p className="formError">{errors.location.message}</p>
        )}
      </label>
      <div className="formTwo">
        <label>
          Price
          <input
            type="number"
            min={10}
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && <p className="formError">{errors.price.message}</p>}
        </label>
        <label>
          Guests
          <input
            type="number"
            min={1}
            max={16}
            {...register("guests", { valueAsNumber: true })}
          />
          {errors.guests && (
            <p className="formError">{errors.guests.message}</p>
          )}
        </label>
      </div>
      <label>
        Category
        <select {...register("category")}>
          {LISTING_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </label>
      <div className="buttonRow">
        <label className="checkLabel">
          <input type="checkbox" {...register("superhost")} />
          Superhost
        </label>
        <label className="checkLabel">
          <input type="checkbox" {...register("available")} />
          Available
        </label>
      </div>
      <label>
        Available from
        <input type="date" {...register("availableFrom")} />
        {errors.availableFrom && (
          <p className="formError">{errors.availableFrom.message}</p>
        )}
      </label>
      <label>
        Images{" "}
        <span style={{ fontWeight: "normal", fontSize: "0.85em", color: "#888" }}>
          (exactly 3 images required — 1 cover, 2 details)
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          {...register("image", { onChange: handleImageChange })}
        />
        {errors.image && (
          <p className="formError">{errors.image.message?.toString()}</p>
        )}
      </label>

      {previews.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "8px",
            marginTop: "8px",
          }}
        >
          {previews.map((src, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img
                src={src}
                alt={`Preview ${i + 1}`}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border:
                    i === 0
                      ? "2px solid var(--color-primary, #e91e8c)"
                      : "2px solid transparent",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: "4px",
                  left: "4px",
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {i === 0 ? "Cover (Home Page)" : `Detail Image ${i}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <button className="appButton" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}