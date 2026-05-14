import { useParams } from "react-router-dom";
import { useListing } from "../../listings/hooks/useListings";
import { ListingForm } from "../components/ListingForm";
import { useUpdateListing } from "../hooks/useUpdateListing";
import type { ListingFormInput } from "../schemas/listing";

export function EditListingPage() {
  const { id = "" } = useParams();
  const { data: listing, isLoading, isError } = useListing(id);
  const updateListing = useUpdateListing(id);

  function handleSubmit(input: ListingFormInput) {
    updateListing.mutate({ ...input, id });
  }

  if (isLoading) return <div className="pageSpinner" />;

  if (isError || !listing) {
    return (
      <main className="appPage">
        <section className="appCard emptyState">Listing not found.</section>
      </main>
    );
  }

  return (
    <main className="appPage">
      <section className="appCard">
        <h1 className="appTitle">Edit listing</h1>
        <ListingForm
          listing={listing}
          submitting={updateListing.isPending}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
        />
      </section>
    </main>
  );
}
