import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { FaHeart, FaTimes, FaMapMarkerAlt } from "react-icons/fa";

import { formatCurrency } from "../../../shared/currency";
import { useStore } from "../../../store/StoreContext";
import type { Listing } from "../types";

import "./SavedListings.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function SavedListings({ isOpen, onClose }: Props) {
  const { state, dispatch } = useStore();

  const savedListings = state.listings.filter((l: Listing) =>
    state.saved.includes(l.id),
  );

  const unsave = (id: string) => {
    dispatch({ type: "TOGGLE_FAVORITE", payload: id });
  };

  return (
    <>
      {/* Backdrop */}
      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="saved-panel__backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      </Transition>

      {/* Slide-in Panel */}
      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition-transform duration-300 ease-out"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transition-transform duration-200 ease-in"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
        <aside className="saved-panel" role="dialog" aria-label="Saved listings">
          {/* Header */}
          <div className="saved-panel__header">
            <div className="saved-panel__title">
              <FaHeart className="saved-panel__heart-icon" />
              <h2>Saved</h2>
              <span className="saved-panel__count">{savedListings.length}</span>
            </div>
            <button
              className="saved-panel__close-btn"
              onClick={onClose}
              aria-label="Close saved panel"
            >
              <FaTimes />
            </button>
          </div>

          {/* Body */}
          <div className="saved-panel__body">
            {savedListings.length === 0 ? (
              <div className="saved-panel__empty">
                <p>No saved listings yet.</p>
                <p className="saved-panel__empty-hint">
                  Tap the heart on any listing to save it here.
                </p>
              </div>
            ) : (
              <ul className="saved-panel__list">
                {savedListings.map((listing: Listing) => (
                  <li key={listing.id} className="saved-panel__item">
                    <img
                      src={listing.img?.[0] ?? "https://placehold.co/400x300?text=No+Image"}

                      alt={listing.title}
                      className="saved-panel__thumb"
                    />
                    <div className="saved-panel__info">
                      <p className="saved-panel__item-title">{listing.title}</p>
                      <p className="saved-panel__item-location">
                        <FaMapMarkerAlt />
                        <span>{listing.location}</span>
                      </p>
                      <p className="saved-panel__item-price">
                        {formatCurrency(listing.price)}
                        <span> / night</span>
                      </p>
                    </div>
                    <button
                      className="saved-panel__remove-btn"
                      onClick={() => unsave(listing.id)}
                      aria-label={`Remove ${listing.title} from saved`}
                    >
                      <FaTimes />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </Transition>
    </>
  );
}
