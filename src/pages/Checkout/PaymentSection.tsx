import { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { createPaymentIntent, checkoutConfigured, type CheckoutPayload } from '@/cart/checkout';
import styles from './Checkout.module.css';

/**
 * The Pay button. Lives inside the <Elements> provider so it can drive the
 * confirm flow: validate the card (elements.submit), ask the backend to mint a
 * PaymentIntent for the *server-priced* cart, then confirm it. `payload` is
 * called at click time so it captures the latest form values.
 *
 * Disabled until the backend is configured (it mints the intent) — the card
 * widget itself only needs the publishable key, so it can render before this
 * button is usable.
 */
export function PayButton({
  payload,
  total,
  onPaid,
}: {
  payload: () => CheckoutPayload;
  total: string;
  onPaid: () => void;
}) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backendReady = checkoutConfigured();

  const onPay = async () => {
    if (!stripe || !elements || busy) return;
    setError(null);
    setBusy(true);
    try {
      const submit = await elements.submit();
      if (submit.error) {
        setError(submit.error.message ?? t('checkout.payError'));
        return;
      }
      const intent = await createPaymentIntent(payload());
      const result = await stripe.confirmPayment({
        elements,
        clientSecret: intent.clientSecret,
        confirmParams: { return_url: `${window.location.origin}/checkout` },
        redirect: 'if_required',
      });
      if (result.error) {
        setError(result.error.message ?? t('checkout.payError'));
        return;
      }
      if (result.paymentIntent?.status === 'succeeded') onPaid();
    } catch {
      // Network failure or a backend rejection (e.g. an item went sold out).
      setError(t('checkout.payError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.pay}
        disabled={!backendReady || busy || !stripe}
        onClick={() => void onPay()}
      >
        {busy ? t('checkout.paying') : t('checkout.pay', { amount: total })}
      </button>
      {error ? (
        <p className={styles.payError} role="alert">
          {error}
        </p>
      ) : null}
      {!backendReady ? <p className={styles.note}>{t('checkout.notReady')}</p> : null}
    </>
  );
}
