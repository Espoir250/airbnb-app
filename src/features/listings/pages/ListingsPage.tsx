import { AiStayAssistant } from "../components/AiStayAssistant";
import { CategoryBar } from "../components/CategoryBar";
import { ListingCard } from "../components/ListingCard";
import { ListingRow } from "../components/ListingRow";
import { Section } from "../components/Section";
import { useListings } from "../hooks/useListings";
import { useSavedListings, useToggleSaved } from "../hooks/useToggleSaved";
import type { Listing } from "../types";
import styles from "./ListingsPage.module.css";

export function ListingsPage() {
  const {
    data: listings = [],
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useListings();

  const { data: saved = [] } = useSavedListings();
  const toggleSaved = useToggleSaved();

  const handleToggleSave = (id: string) => {
    toggleSaved.mutate(id);
  };

  // --- Category buckets based on normalized type ---
  const hotelListings = listings.filter(
    (l: Listing) => (l.type ?? l.propertyType ?? l.category) === "HOTEL",
  );

  const apartmentListings = listings.filter(
    (l: Listing) => (l.type ?? l.propertyType ?? l.category) === "APARTMENT",
  );

  const houseListings = listings.filter(
    (l: Listing) => (l.type ?? l.propertyType ?? l.category) === "HOUSE",
  );

  // Top rated across all types (up to 6) for the hero section
  const topRatedListings = listings
    .slice()
    .sort((a: Listing, b: Listing) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 6);

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <CategoryBar />
        <AiStayAssistant listings={listings} />

        {isLoading ? (
          <Section title="Popular stays in Rwanda">
            <div className="pageSpinner" aria-label="Loading listings" />
            <p>Loading listings...</p>
          </Section>
        ) : isError ? (
          <Section title="Popular stays in Rwanda">
            <p>{error instanceof Error ? error.message : "Could not load listings."}</p>
            <button className="appButton" type="button" onClick={() => refetch()}>
              Retry
            </button>
          </Section>
        ) : listings.length === 0 ? (
          <Section title="Popular stays in Rwanda">
            <p>No listings are available yet.</p>
          </Section>
        ) : (
          <>
            {isFetching && <p className={styles.refreshing}>Refreshing...</p>}

            {/* TOP RATED — all types */}
            <Section title="Top rated stays">
              <ListingRow>
                {topRatedListings.map((listing: Listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    saved={saved.includes(listing.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </ListingRow>
            </Section>

            {/* HOTELS */}
            {hotelListings.length > 0 && (
              <Section title="Hotels">
                <ListingRow>
                  {hotelListings.map((listing: Listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      saved={saved.includes(listing.id)}
                      onToggleSave={handleToggleSave}
                      showHost
                    />
                  ))}
                </ListingRow>
              </Section>
            )}

            {/* APARTMENTS */}
            {apartmentListings.length > 0 && (
              <Section title="Apartments">
                <ListingRow>
                  {apartmentListings.map((listing: Listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      saved={saved.includes(listing.id)}
                      onToggleSave={handleToggleSave}
                      showHost
                    />
                  ))}
                </ListingRow>
              </Section>
            )}

            {/* HOUSES */}
            {houseListings.length > 0 && (
              <Section title="Houses">
                <ListingRow>
                  {houseListings.map((listing: Listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      saved={saved.includes(listing.id)}
                      onToggleSave={handleToggleSave}
                      showHost
                    />
                  ))}
                </ListingRow>
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
