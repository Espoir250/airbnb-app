import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { BookingWizard } from "../../bookings";
import { useListing } from "../../listings/hooks/useListings";
import { FaStar, FaMapMarkerAlt, FaUserCircle, FaHome } from "react-icons/fa";
import numeral from "numeral";

export default function ListingDetail() {
  const { id } = useParams();

  const {
    data: listing,
    error,
    isError,
    isLoading,
    refetch,
  } = useListing(id);

  if (isLoading) {
    return <div className="pageSpinner" aria-label="Loading listing" />;
  }

  if (isError || !listing) {
    return (
      <main className="appPage">
        <section className="appCard emptyState">
          <p>{error instanceof Error ? error.message : "Listing not found"}</p>
          <button className="appButton" onClick={() => refetch()}>
            Retry
          </button>
        </section>
      </main>
    );
  }

  const images = listing.img ?? [];
  const ratingLabel =
    typeof listing.rating === "number"
      ? numeral(listing.rating).format("0.00")
      : "New";

  return (
    <main className="detailPage">

      {/* HEADER */}
      <div className="detailHeader">
        <h1>{listing.title}</h1>
        <div className="detailHeaderMeta">
          <p className="detailLocation">
            <FaMapMarkerAlt style={{ display: "inline", marginRight: 4 }} />
            {listing.location}
          </p>
          {listing.hostName && (
            <p className="detailHost">
              <FaUserCircle style={{ display: "inline", marginRight: 4 }} />
              Hosted by <strong>{listing.hostName}</strong>
            </p>
          )}
        </div>
      </div>

      {/* IMAGES — keep the full gallery on detail page */}
      <div className="detailImages">
        {images.slice(0, 5).map((img, index) => (
          <motion.img
            key={img}
            src={img}
            alt={`${listing.title} photo ${index + 1}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          />
        ))}
      </div>

      {/* MAIN LAYOUT */}
      <div className="detailLayout">

        {/* LEFT SIDE */}
        <section className="detailCopy">
          <h2>About this place</h2>

          {/* Host name in description area */}
          {listing.hostName && (
            <p className="detailHostedBy">
              <FaUserCircle />
              <span>
                Entire {listing.type?.toLowerCase() ?? "place"} hosted by{" "}
                <strong>{listing.hostName}</strong>
              </span>
            </p>
          )}

          <p className="detailDescription">{listing.description}</p>

          <div className="listingMeta">
            <p>
              <FaStar style={{ display: "inline", marginRight: 4, color: "#f5a623" }} />
              {ratingLabel}
            </p>
            <p>
              <FaHome style={{ display: "inline", marginRight: 4 }} />
              {listing.type}
            </p>
            <p>👥 Up to {listing.guests} guests</p>
          </div>

          {listing.amenities?.length ? (
            <div className="amenities">
              <h3>Amenities</h3>
              <ul>
                {listing.amenities.map((a: string) => (
                  <li key={a}>• {a}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        {/* RIGHT SIDE (BOOKING CARD) */}
        <aside className="bookingWrapper">
          <BookingWizard listing={listing} />
        </aside>

      </div>
    </main>
  );
}