import toast from "react-hot-toast";
import { ListingForm } from "../components/ListingForm";
import { useCreateListing } from "../hooks/useCreateListing";
import type { ListingFormInput } from "../schemas/listing";

export function CreateListingPage() {
  const createListing = useCreateListing();

  function handleSubmit(input: ListingFormInput) {
    if (!input.image?.[0]) {
      toast.error("Image is required.");
      return;
    }
    createListing.mutate(input);
  }

  return (
    <main className="appPage">
      <section className="appCard">
        <h1 className="appTitle">Create listing</h1>
        <ListingForm
          submitting={createListing.isPending}
          submitLabel="Create listing"
          onSubmit={handleSubmit}
        />
      </section>
    </main>
  );
}
