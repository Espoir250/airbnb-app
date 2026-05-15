import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { BookingWizard } from "../../bookings";
import { useListing } from "../../listings/hooks/useListings";
import { FaStar, FaMapMarkerAlt, FaUserCircle, FaHome, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import numeral from "numeral";

export default function ListingDetail() {
  const { id } = useParams();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
          <button className="appButton" onClick={() => refetch()}>Retry</button>
        </section>
      </main>
    );
  }

  const images = listing.img ?? [];
  const ratingLabel =
    typeof listing.rating === "number"
      ? numeral(listing.rating).format("0.00")
      : "New";

  function prevImage() {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
  }

  function nextImage() {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
  }

  return (
    <>
      <div className="ld-page">

        {/* ── GALLERY ── */}
        {images.length === 0 ? null : images.length === 1 ? (
          <div className="ld-gallery">
            <div className={`ld-gallery-main ld-gallery-single`} onClick={() => setLightboxIndex(0)}>
              <img src={images[0]} alt={listing.title} />
            </div>
          </div>
        ) : (
          <div className="ld-gallery">
            <div className="ld-gallery-main" onClick={() => setLightboxIndex(0)}>
              <img src={images[0]} alt={`${listing.title} — main photo`} />
            </div>
            {images.slice(1, 4).map((img, i) => (
              <div key={img} className="ld-gallery-thumb" onClick={() => setLightboxIndex(i + 1)}>
                <img src={img} alt={`${listing.title} photo ${i + 2}`} />
                {i === 2 && images.length > 4 && (
                  <div className="ld-gallery-more">+{images.length - 4} more</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── CONTENT ── */}
        <div className="ld-content">

          {/* Header */}
          <motion.div
            className="ld-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
              <h1 className="ld-title">{listing.title}</h1>
              {listing.superhost && <span className="ld-badge">⭐ Superhost</span>}
            </div>
            <div className="ld-meta-row">
              <span className="ld-meta-item">
                <FaMapMarkerAlt /> {listing.location}
              </span>
              {listing.hostName && (
                <span className="ld-meta-item">
                  <FaUserCircle /> Hosted by <strong style={{ color: "#1a1a1a" }}>{listing.hostName}</strong>
                </span>
              )}
              <span className="ld-meta-item">
                <FaHome /> {listing.type}
              </span>
            </div>
          </motion.div>

          <div className="ld-layout">

            {/* ── LEFT ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Stats */}
              <div className="ld-stats">
                <div className="ld-stat">
                  <span className="ld-stat-value">
                    <FaStar style={{ color: "#c4a97a", fontSize: "1rem", verticalAlign: "middle" }} /> {ratingLabel}
                  </span>
                  <span className="ld-stat-label">Rating</span>
                </div>
                <div className="ld-stat">
                  <span className="ld-stat-value">{listing.guests}</span>
                  <span className="ld-stat-label">Guests</span>
                </div>
                <div className="ld-stat">
                  <span className="ld-stat-value">{listing.amenities?.length ?? 0}</span>
                  <span className="ld-stat-label">Amenities</span>
                </div>
              </div>

              {/* About */}
              <div className="ld-section">
                <h2 className="ld-section-title">About this place</h2>
                {listing.hostName && (
                  <div className="ld-hosted-by">
                    <FaUserCircle />
                    <span>
                      Entire {listing.type?.toLowerCase() ?? "place"} hosted by{" "}
                      <strong>{listing.hostName}</strong>
                    </span>
                  </div>
                )}
                <p className="ld-description">{listing.description}</p>
              </div>

              {/* Amenities */}
              {listing.amenities?.length ? (
                <>
                  <hr className="ld-divider" />
                  <div className="ld-section">
                    <h2 className="ld-section-title">What this place offers</h2>
                    <div className="ld-amenities">
                      {listing.amenities.map((a: string) => (
                        <span key={a} className="ld-amenity">✓ {a}</span>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </motion.div>

            {/* ── RIGHT: BOOKING ── */}
            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="ld-booking-sticky">
                <div className="ld-booking-header">
                  <div className="ld-booking-price">
                    {new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(listing.pricePerNight)}
                    <span> / night</span>
                  </div>
                </div>
                <div className="ld-booking-body">
                  <BookingWizard listing={listing} />
                </div>
              </div>
            </motion.aside>

          </div>
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="ld-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxIndex(null)}
          >
            <button className="ld-lightbox-close" onClick={() => setLightboxIndex(null)}>
              <FaTimes />
            </button>

            {images.length > 1 && (
              <button className="ld-lightbox-nav ld-lightbox-prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                <FaChevronLeft />
              </button>
            )}

            <motion.img
              key={lightboxIndex}
              src={images[lightboxIndex]}
              alt={`${listing.title} photo ${lightboxIndex + 1}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            />

            {images.length > 1 && (
              <button className="ld-lightbox-nav ld-lightbox-next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                <FaChevronRight />
              </button>
            )}

            <div className="ld-lightbox-counter">
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}