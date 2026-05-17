import { FaCheck, FaTimes } from "react-icons/fa";
import { formatCurrency } from "../../../shared/currency";
import {
  useApprove,
  usePendingListings,
  useReject,
} from "../hooks/useAdminStats";

export function ModerationQueue() {
  const { data: listings = [], isLoading, isError } = usePendingListings();
  const approve = useApprove();
  const reject = useReject();

  return (
    <main className="appPage">
      <section className="appCard">
        <h1 className="appTitle">Moderation queue</h1>
        {isLoading ? (
          <div className="pageSpinner" />
        ) : isError ? (
          <p className="emptyState">Could not load pending listings.</p>
        ) : listings.length === 0 ? (
          <p className="emptyState">No pending listings.</p>
        ) : (
          <div className="cardGrid">
            {listings.map((listing) => (
              <article className="managementCard" key={listing.id}>
                <img
                  src={
                    listing.img?.[0] ??
                    "https://placehold.co/400x300?text=No+Image"
                  }
                  alt={listing.title}
                />
                <div>
                  <h2>{listing.title}</h2>
                  <p>{listing.description}</p>
                  <p>Host: {listing.hostName ?? listing.hostId ?? "Unknown"}</p>
                  <strong>{formatCurrency(listing.price)} / night</strong>
                </div>
                <div className="buttonRow">
                  <button className="btn-approve" onClick={() => approve.mutate(listing.id)}>
                    <FaCheck /> Approve
                  </button>
                  <button className="btn-danger" onClick={() => reject.mutate(listing.id)}>
                    <FaTimes /> Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
