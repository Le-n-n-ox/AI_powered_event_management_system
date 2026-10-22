import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  CircleAlert,
  Loader2,
  PhoneCall,
  Smartphone,
  TriangleAlert,
} from "lucide-react";
import { apiFetch, ApiError } from "../../lib/api";
import { formatMoney } from "../../lib/events";
import { Button } from "./button";

interface Props {
  attendeeId: string;
  /** The phone number on the registration — the one the prompt goes to. */
  phone: string;
  amount: number;
  /** The paybill the money is credited to, when the organizer set one. */
  paybill?: string | null;
  /**
   * An existing payment to pick up — e.g. after a page refresh. When this is
   * set the prompt goes straight to "waiting" instead of pushing a second
   * prompt for a ticket that is already being paid.
   */
  resume?: { transactionId: string; paymentToken: string } | null;
  onPaid?: () => void;
}

type Stage = "idle" | "pushing" | "awaiting" | "paid" | "failed";

interface PushResponse {
  transactionId: string;
  checkoutRequestId: string;
  paymentToken: string;
  amount: number;
  currency: string;
  paybill: string | null;
  phone: string;
  message: string;
}

interface StatusResponse {
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  amount: number;
  currency: string;
  receiptNumber: string | null;
  paidAt: string | null;
  paybill: string | null;
}

/** How often we ask Daraja how the payment went. */
const POLL_INTERVAL_MS = 3000;
/** How long we keep asking before we let the attendee try again. */
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

export default function PaymentPrompt({
  attendeeId,
  phone,
  amount,
  paybill,
  resume,
  onPaid,
}: Props) {
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [promptPhone, setPromptPhone] = useState(phone);

  // The polling loop keeps its state here so a re-render does not restart it.
  const transactionRef = useRef<{
    id: string;
    token: string;
  } | null>(null);

  const stopPolling = useRef(false);

  const checkStatus = useCallback(async () => {
    const pending = transactionRef.current;
    if (!pending) return;

    try {
      const status = await apiFetch<StatusResponse>(
        `/api/payments/status/${pending.id}?token=${encodeURIComponent(pending.token)}`,
      );

      if (status.status === "paid") {
        stopPolling.current = true;
        setReceipt(status.receiptNumber);
        setStage("paid");
        onPaid?.();
        return;
      }

      if (status.status === "failed" || status.status === "cancelled") {
        stopPolling.current = true;
        setError("The payment was declined. You can try again.");
        setStage("failed");
      }
    } catch (err) {
      // A hiccup while polling is not a failure — keep trying until the
      // timeout runs out.
      if (err instanceof ApiError && err.status === 403) {
        stopPolling.current = true;
        setError("This payment session expired. Please start the payment again.");
        setStage("failed");
      }
    }
  }, [onPaid]);

  useEffect(() => {
    if (stage !== "awaiting") return;

    const started = Date.now();
    const timer = setInterval(() => {
      if (stopPolling.current) {
        clearInterval(timer);
        return;
      }
      if (Date.now() - started > POLL_TIMEOUT_MS) {
        clearInterval(timer);
        setError(
          "We have not heard back from M-Pesa yet. If you completed the payment, it will still go through.",
        );
        setStage("failed");
        return;
      }
      void checkStatus();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [stage, checkStatus]);

  // Pick an existing payment back up — after a refresh, the attendee should
  // keep waiting on the prompt they already have rather than get a second one.
  // The update is deferred a frame so it does not cascade a render out of the
  // effect.
  useEffect(() => {
    if (!resume?.transactionId || !resume.paymentToken) return;
    if (stage !== "idle") return;

    const frame = requestAnimationFrame(() => {
      transactionRef.current = {
        id: resume.transactionId,
        token: resume.paymentToken,
      };
      stopPolling.current = false;
      setStage("awaiting");
    });

    return () => cancelAnimationFrame(frame);
  }, [resume, stage]);

  const startPayment = async () => {
    setStage("pushing");
    setError(null);
    stopPolling.current = false;

    try {
      const response = await apiFetch<PushResponse>(
        "/api/payments/attendee-stk-push",
        {
          method: "POST",
          body: JSON.stringify({ attendeeId, phone }),
        },
      );

      transactionRef.current = {
        id: response.transactionId,
        token: response.paymentToken,
      };
      setPromptPhone(response.phone);
      setStage("awaiting");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not start the payment. Please try again.",
      );
      setStage("failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-md shadow-shadow-soft"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-tag-teal via-tag-sky to-brand" />

      <div className="p-5 pt-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex p-2.5 rounded-xl bg-tag-teal-bg text-tag-teal shrink-0">
            <Smartphone className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-heading text-lg font-bold text-text">
              Complete your payment
            </h3>
            <p className="text-sm text-text-soft mt-0.5">
              This is a paid event. Pay {formatMoney(amount)} with M-Pesa to
              secure your ticket.
            </p>
          </div>
        </div>

        {/* The amount, big and clear */}
        <div className="rounded-xl border border-border bg-surface-muted/60 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-soft">
              Amount due
            </p>
            <p className="font-heading text-3xl font-bold text-gradient mt-1">
              {formatMoney(amount)}
            </p>
          </div>
          {paybill && (
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-soft">
                Paybill
              </p>
              <p className="font-mono text-sm font-semibold text-text mt-1">
                {paybill}
              </p>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <Button
                type="button"
                onClick={startPayment}
                className="w-full h-12 btn-gradient font-semibold shadow-lg shadow-shadow-brand/40"
              >
                <PhoneCall className="w-4 h-4" />
                Pay {formatMoney(amount)} with M-Pesa
              </Button>
              <p className="text-xs text-text-soft text-center">
                You will get a prompt on {promptPhone} asking you to enter your
                M-Pesa PIN.
              </p>
            </motion.div>
          )}

          {stage === "pushing" && (
            <motion.div
              key="pushing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-3 text-sm text-text-muted"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending the payment request…
            </motion.div>
          )}

          {stage === "awaiting" && (
            <motion.div
              key="awaiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-3 rounded-xl border border-info-border bg-info-bg px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-info shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-text">
                    Waiting for you to approve the payment
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Check {promptPhone} for the M-Pesa prompt and enter your
                    PIN.
                  </p>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-strong">
                <motion.div
                  className="h-full rounded-full bg-linear-to-r from-tag-teal to-brand"
                  initial={{ width: "8%" }}
                  animate={{ width: "92%" }}
                  transition={{ duration: 45, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}

          {stage === "paid" && (
            <motion.div
              key="paid"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2 rounded-xl border border-success-border bg-success-bg px-4 py-4"
            >
              <div className="flex items-center gap-2.5">
                <BadgeCheck className="w-6 h-6 text-success shrink-0" />
                <p className="font-heading text-base font-bold text-text">
                  Payment received — you&rsquo;re in!
                </p>
              </div>
              {receipt && (
                <p className="text-xs text-text-muted">
                  M-Pesa receipt{" "}
                  <span className="font-mono font-semibold text-text">
                    {receipt}
                  </span>
                </p>
              )}
            </motion.div>
          )}

          {stage === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-danger-border bg-danger-bg px-4 py-3"
              >
                <TriangleAlert className="w-4 h-4 mt-0.5 text-danger shrink-0" />
                <p className="text-sm text-text">
                  {error || "The payment could not be completed."}
                </p>
              </div>
              <Button
                type="button"
                onClick={startPayment}
                variant="outline"
                className="w-full h-11 font-semibold"
              >
                <CircleAlert className="w-4 h-4" />
                Try the payment again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
