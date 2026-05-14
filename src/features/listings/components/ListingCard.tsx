import clsx from "clsx";
import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaMapMarkerAlt,
  FaUserCircle,
} from "react-icons/fa";
import numeral from "numeral";
import { formatCurrency } from "../../../shared/currency";
import type { Listing } from "../types";
import { useNavigate } from "react-router-dom";

import styles from "./ListingCard.module.css";

type Props = {
  listing: Listing;
  saved: boolean;
  onToggleSave: (id: string) => void;
  index?: number;
  showHost?: boolean;
};

export function ListingCard({
  listing,
  saved,
  onToggleSave,
  showHost = false,
}: Props) {
  const navigate = useNavigate();

  // On the card always show just the first image — no gallery arrows on home page
  const images = listing.img ?? [];
  const image = images[0] ?? "https://placehold.co/400x300?text=No+Image";

  const ratingLabel =
    typeof listing.rating === "number"
      ? numeral(listing.rating).format("0.00")
      : "New";

  return (
    <div
      className={clsx(styles.card, {
        [styles.cardSaved]: saved,
        [styles.cardSuperhost]: listing.superhost,
      })}
    >
      {/* ───────── IMAGE ───────── */}
      <div className={styles.imageWrapper}>
        <img
          src={image}
          alt={listing.title}
          className={styles.image}
          onClick={() => navigate(`/listing/${listing.id}`)}
        />

        {/* FAVORITE */}
        <button
          className={clsx(styles.favoriteBtn, {
            [styles.favoriteBtnSaved]: saved,
          })}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(listing.id);
          }}
        >
          {saved ? <FaHeart /> : <FaRegHeart />}
        </button>

        {listing.superhost && (
          <span className={styles.superhostRibbon}>Superhost</span>
        )}

        {/* Show image count badge if there are multiple images */}
        {images.length > 1 && (
          <span className={styles.imageCount}>
            +{images.length - 1} photos
          </span>
        )}
      </div>

      {/* ───────── CONTENT ───────── */}
      <div className={styles.content}>
        <h3 className={styles.title}>{listing.title}</h3>

        <p className={styles.location}>
          <FaMapMarkerAlt />
          <span>{listing.location}</span>
        </p>

        {showHost && listing.hostName && (
          <p className={styles.host}>
            <FaUserCircle />
            <span>Hosted by {listing.hostName}</span>
          </p>
        )}

        <div className={styles.meta}>
          <p className={styles.rating}>
            <FaStar />
            <span>{ratingLabel}</span>
          </p>

          <p className={styles.price}>
            {formatCurrency(listing.pricePerNight)}
            <span className={styles.perNight}> / night</span>
          </p>
        </div>
      </div>
    </div>
  );
}
