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
  const [preview, setPreview] = useState(listing?.img?.[0] ?? "");

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
        Image
        <input
          type="file"
          accept="image/*"
          {...register("image", {
            onChange: (event) => {
              const file = event.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            },
          })}
        />
        {errors.image && (
          <p className="formError">{errors.image.message?.toString()}</p>
        )}
      </label>
      {preview && (
        <img className="formImagePreview" src={preview} alt="Listing preview" />
      )}
      <button className="appButton" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
