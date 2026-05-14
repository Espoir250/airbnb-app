import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../../shared/currency";
import { useAuth } from "../../auth/hooks/useAuth";
import type { Listing } from "../../listings/types";
import { useCreateBooking } from "../hooks/useCreateBooking";
import {
  bookingDatesSchema,
  guestInfoSchema,
  paymentSchema,
  type BookingDatesInput,
  type BookingFormData,
  type GuestInfoInput,
  type PaymentInput,
} from "../schemas/booking";

function nightsBetween(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return 0;
  const nights = Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return Number.isFinite(nights) && nights > 0 ? nights : 0;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="formError">{message}</p> : null;
}

export function BookingWizard({ listing }: { listing: Listing }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<BookingFormData>>({});
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const createBooking = useCreateBooking(listing.id);

  const nights = useMemo(
    () => nightsBetween(data.checkIn, data.checkOut),
    [data.checkIn, data.checkOut],
  );
  const totalPrice = nights * (listing.price ?? listing.pricePerNight);

  const datesForm = useForm<BookingDatesInput>({
    resolver: zodResolver(bookingDatesSchema),
    defaultValues: {
      checkIn: data.checkIn ?? "",
      checkOut: data.checkOut ?? "",
      guests: data.guests ?? 1,
    },
  });

  const guestForm = useForm<GuestInfoInput>({
    resolver: zodResolver(guestInfoSchema),
    defaultValues: {
      name: data.name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
    },
  });

  const paymentForm = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      card: data.card ?? "",
      expiry: data.expiry ?? "",
      cvv: data.cvv ?? "",
    },
  });

  function submitBooking() {
    if (!isAuthenticated) {
      toast.error("Please log in to book.");
      navigate("/login");
      return;
    }

    createBooking.mutate({
      ...(data as BookingFormData),
      listingId: listing.id,
      totalPrice,
    });
  }

  return (
    <aside className="bookingPanel">
      <h2>{formatCurrency(listing.price ?? listing.pricePerNight)} / night</h2>

      {!isAuthenticated ? (
        <div className="formStack">
          <p className="bookingNotice">
            Log in first to choose dates, add guest details, and request this stay.
          </p>
          <button className="appButton" type="button" onClick={() => navigate("/login")}>
            Log in to book
          </button>
        </div>
      ) : (
        <>
          <p className="bookingNotice">Booking as {user?.name ?? "Guest"}</p>
          <p className="stepLabel">Step {step} of 4</p>

          {step === 1 && (
            <form
              className="formStack"
              onSubmit={datesForm.handleSubmit((values) => {
                setData((current) => ({ ...current, ...values }));
                setStep(2);
              })}
            >
              <label>
                Check-in
                <input type="date" {...datesForm.register("checkIn")} />
                <FieldError message={datesForm.formState.errors.checkIn?.message} />
              </label>
              <label>
                Check-out
                <input type="date" {...datesForm.register("checkOut")} />
                <FieldError message={datesForm.formState.errors.checkOut?.message} />
              </label>
              <label>
                Guests
                <input
                  type="number"
                  min={1}
                  max={16}
                  {...datesForm.register("guests", { valueAsNumber: true })}
                />
                <FieldError message={datesForm.formState.errors.guests?.message} />
              </label>
              <button className="appButton">Continue</button>
            </form>
          )}

          {step === 2 && (
            <form
              className="formStack"
              onSubmit={guestForm.handleSubmit((values) => {
                const file = values.photo?.[0];
                setData((current) => ({ ...current, ...values, photo: file }));
                setStep(3);
              })}
            >
              <label>
                Name
                <input {...guestForm.register("name")} />
                <FieldError message={guestForm.formState.errors.name?.message} />
              </label>
              <label>
                Email
                <input type="email" {...guestForm.register("email")} />
                <FieldError message={guestForm.formState.errors.email?.message} />
              </label>
              <label>
                Phone
                <input {...guestForm.register("phone")} />
                <FieldError message={guestForm.formState.errors.phone?.message} />
              </label>
              <label>
                Profile photo
                <input
                  type="file"
                  accept="image/*"
                  {...guestForm.register("photo", {
                    onChange: (event) => {
                      const file = event.target.files?.[0];
                      setPreview(file ? URL.createObjectURL(file) : "");
                    },
                  })}
                />
                <FieldError message={guestForm.formState.errors.photo?.message?.toString()} />
              </label>
              {preview && <img className="photoPreview" src={preview} alt="Guest preview" />}
              <div className="buttonRow">
                <button type="button" onClick={() => setStep(1)}>
                  Back
                </button>
                <button className="appButton">Continue</button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form
              className="formStack"
              onSubmit={paymentForm.handleSubmit((values) => {
                setData((current) => ({ ...current, ...values }));
                setStep(4);
              })}
            >
              <label>
                Card number
                <input inputMode="numeric" maxLength={16} {...paymentForm.register("card")} />
                <FieldError message={paymentForm.formState.errors.card?.message} />
              </label>
              <label>
                Expiry
                <input placeholder="MM/YY" {...paymentForm.register("expiry")} />
                <FieldError message={paymentForm.formState.errors.expiry?.message} />
              </label>
              <label>
                CVV
                <input inputMode="numeric" maxLength={3} {...paymentForm.register("cvv")} />
                <FieldError message={paymentForm.formState.errors.cvv?.message} />
              </label>
              <div className="buttonRow">
                <button type="button" onClick={() => setStep(2)}>
                  Back
                </button>
                <button className="appButton">Review</button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="formStack">
              <h3>Confirm booking</h3>
              <p>{listing.title}</p>
              <p>
                {data.checkIn} to {data.checkOut}
              </p>
              <p>
                {data.guests} guest{data.guests === 1 ? "" : "s"} - {nights} night
                {nights === 1 ? "" : "s"}
              </p>
              <p>
                Guest: {data.name} ({data.email})
              </p>
              <strong>Total: {formatCurrency(totalPrice)}</strong>
              <div className="buttonRow">
                <button type="button" onClick={() => setStep(3)}>
                  Back
                </button>
                <button
                  className="appButton"
                  type="button"
                  disabled={createBooking.isPending}
                  onClick={submitBooking}
                >
                  {createBooking.isPending ? "Booking..." : "Book Now"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  );
}
