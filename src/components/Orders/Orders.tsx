import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/data';
import { fetchOrders, merchApiConfigured, type MerchOrder } from '@/cart/orders';
import styles from './Orders.module.css';

type State = { phase: 'loading' } | { phase: 'error' } | { phase: 'ready'; orders: MerchOrder[] };

/** Statuses that read as "done" / "bad" get their own colour; the rest are in-progress. */
function statusClass(status: string): string {
  if (status === 'delivered') return styles.stDone;
  if (status === 'canceled') return styles.stBad;
  return styles.stActive;
}

/**
 * The signed-in buyer's orders, with each order's live tracking event log.
 * Rendered inside the (already auth-gated) account page, so `token` is the
 * Nakama session token used to authenticate against the merch backend.
 */
export function Orders({ token, locale }: { token: string | undefined; locale: string }) {
  const { t } = useTranslation();
  const [state, setState] = useState<State>({ phase: 'loading' });

  useEffect(() => {
    if (!token || !merchApiConfigured()) {
      setState({ phase: 'ready', orders: [] });
      return;
    }
    let alive = true;
    setState({ phase: 'loading' });
    fetchOrders(token)
      .then((orders) => alive && setState({ phase: 'ready', orders }))
      .catch(() => alive && setState({ phase: 'error' }));
    return () => {
      alive = false;
    };
  }, [token]);

  const money = (cents: number, currency: string) =>
    formatPrice(cents / 100, currency.toUpperCase(), locale);
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  const timeFmt = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' });

  return (
    <section className={styles.wrap} aria-labelledby="orders-heading">
      <h2 id="orders-heading" className={styles.heading}>
        {t('orders.title')}
      </h2>

      {state.phase === 'loading' ? (
        <p className={styles.muted}>{t('orders.loading')}</p>
      ) : state.phase === 'error' ? (
        <p className={styles.error} role="alert">
          {t('orders.errorMsg')}
        </p>
      ) : state.orders.length === 0 ? (
        <p className={styles.empty}>
          <span>{t('orders.empty')}</span>
          <Link to="/merch" className="u-gold-text">
            {t('orders.browse')}
          </Link>
        </p>
      ) : (
        <ul className={styles.orders}>
          {state.orders.map((order) => {
            const headline = order.tracking?.status ?? order.status;
            return (
              <li key={order.id} className={styles.order}>
                <header className={styles.orderHead}>
                  <div>
                    <span className={styles.orderId}>
                      {t('orders.orderNumber', { id: order.id })}
                    </span>
                    <span className={styles.placed}>
                      {t('orders.placed', { date: dateFmt.format(order.created_at) })}
                    </span>
                  </div>
                  <div className={styles.orderHeadRight}>
                    <span className={`${styles.badge} ${statusClass(headline)}`}>
                      {t(`orders.status.${headline}`, { defaultValue: headline })}
                    </span>
                    <span className={styles.total}>{money(order.amount, order.currency)}</span>
                  </div>
                </header>

                <ul className={styles.items}>
                  {order.items.map((it) => (
                    <li key={it.slug} className={styles.item}>
                      <span className={styles.itemName}>
                        {it.name}
                        <span className={styles.itemQty}>×{it.qty}</span>
                      </span>
                      <span className={styles.itemPrice}>
                        {money(it.lineTotal, order.currency)}
                      </span>
                    </li>
                  ))}
                </ul>

                {order.tracking && order.tracking.events.length > 0 ? (
                  <div className={styles.tracking}>
                    <div className={styles.trackingHead}>
                      <span className={styles.trackingTitle}>{t('orders.trackingTitle')}</span>
                      {order.tracking.carrier || order.tracking.number ? (
                        <span className={styles.carrier}>
                          {[order.tracking.carrier, order.tracking.number]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      ) : null}
                    </div>
                    <ol className={styles.timeline}>
                      {order.tracking.events
                        .slice()
                        .reverse()
                        .map((ev, i) => (
                          <li
                            key={`${ev.status}-${ev.at}`}
                            className={`${styles.event} ${i === 0 ? styles.eventCurrent : ''}`}
                          >
                            <span className={styles.dot} aria-hidden="true" />
                            <div className={styles.eventBody}>
                              <span className={styles.eventDesc}>{ev.description}</span>
                              <span className={styles.eventMeta}>
                                {[ev.location?.label, timeFmt.format(ev.at)]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </span>
                            </div>
                          </li>
                        ))}
                    </ol>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
