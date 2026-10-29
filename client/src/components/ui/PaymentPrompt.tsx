import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  CircleAlert,
  Loader2,
  CreditCard,
  Smartphone,
  TriangleAlert,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { formatMoney } from "../../lib/events";
import { Button } from "./button";

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: any) => { openIframe: () => void };
    };
  }
}

interface Props {
  attendeeId: string;
  phone: string;
  amount: number;
  email?: string;
  paybill?: string | null;
  resume?: { transactionId: string; paymentToken: string } | null;
  onPaid?: () => void;
}

type Stage = "idle" | "initializing" | "processing" | "paid" | "failed";

interface PaystackInitResponse {
  accessCode: string;
  reference: string;
  publicKey: string;
}

export default function PaymentPrompt({
  attendeeId,
  phone,
  amount,
  email,
  paybill,
  onPaid,
}: Props) {
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const startPayment = async () => {
    setStage("initializing");
    setError(null);

    if (!window.PaystackPop) {
      setError("Payment gateway is still loading. Please try again in a moment.");
      setStage("failed");
      return;
    }

    try {
      const initData = await apiFetch<PaystackInitResponse>(
        "/api/payments/paystack/init",
        {
          method: "POST",
          body: JSON.stringify({ attendeeId, phone, amount }),
        }
      );

      const handler = window.PaystackPop.setup({
        key: initData.publicKey,
        email: email || `${phone.replace(/\D/g, "")}@guest.eventos.app`,
        amount: amount * 100,
        currency: "KES",
        ref: initData.reference,
        access_code: initData.accessCode,
        
        // standard function instead of async to pass Paystack's strict validation
        callback: (response: { reference: string; trans: string }) => {
          setStage("processing");
          
          apiFetch(`/api/payments/paystack/verify/${response.reference}`, {
            method: "POST",
          })
            .then(() => {
              setReceipt(response.trans || response.reference);
              setStage("paid");
              onPaid?.();
            })
            .catch(() => {
              setError(
                "Payment received, but verification failed. Please contact support."
              );
              setStage("failed");
            });
        },
        
        onClose: () => {
          setError("Payment was cancelled.");
          setStage("failed");
        },
      });

      handler.openIframe();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not start the payment. Please try again."
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
              This is a paid event. Pay {formatMoney(amount)} via Mobile Money or Card to secure your ticket.
            </p>
          </div>
        </div>

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
                <CreditCard className="w-4 h-4 mr-2" />
                Pay {formatMoney(amount)} Now
              </Button>
            </motion.div>
          )}

          {(stage === "initializing" || stage === "processing") && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-3 text-sm text-text-muted"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              {stage === "initializing"
                ? "Connecting to secure gateway..."
                : "Verifying payment..."}
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
                  Transaction ref{" "}
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
                <CircleAlert className="w-4 h-4 mr-2" />
                Try the payment again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}