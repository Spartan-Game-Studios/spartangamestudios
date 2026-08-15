import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { studio } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import styles from './Legal.module.css';

/**
 * Privacy policy.
 *
 * Written from what the system actually does rather than from a template. Every
 * claim here was checked against the running code: the account fields are the
 * ones Nakama stores, the third parties are the ones the site really contacts,
 * and "no analytics" is a statement of fact about this bundle, not an aspiration.
 *
 * That accuracy is the point. A policy that overstates what is collected is
 * merely vague; one that understates it is a false statement to users and to the
 * app stores that read it.
 *
 * IMPORTANT: the operator identity below is a placeholder. GDPR requires a named
 * controller with a contact address, and that is a fact about the business which
 * cannot be derived from the code.
 */

/** Bump when the substance changes, not for typos — people re-read on a change. */
const LAST_UPDATED = '2026-08-15';

export function Privacy() {
  const { t } = useTranslation();

  useDocumentMeta({
    title: t('privacy.title'),
    description: t('privacy.metaDescription'),
    path: '/privacy',
  });

  return (
    <Container>
      <div className={page.page}>
        <h1 className={page.title}>{t('privacy.title')}</h1>
        <p className={styles.updated}>{t('privacy.updated', { date: LAST_UPDATED })}</p>
        <p className={page.lede}>{t('privacy.lede')}</p>

        <section className={styles.section}>
          <h2 className={styles.heading}>{t('privacy.noTrackingTitle')}</h2>
          <p>{t('privacy.noTracking')}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>{t('privacy.accountTitle')}</h2>
          <p>{t('privacy.accountIntro')}</p>
          <ul className={styles.list}>
            <li>{t('privacy.accountEmail')}</li>
            <li>{t('privacy.accountProfile')}</li>
            <li>{t('privacy.accountLinked')}</li>
            <li>{t('privacy.accountFollowing')}</li>
          </ul>
          <p>{t('privacy.accountNoAccount')}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>{t('privacy.serversTitle')}</h2>
          <p>{t('privacy.servers')}</p>
          <p>{t('privacy.logs')}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>{t('privacy.thirdPartiesTitle')}</h2>
          <p>{t('privacy.thirdPartiesIntro')}</p>
          <ul className={styles.list}>
            <li>{t('privacy.thirdGoogle')}</li>
            <li>{t('privacy.thirdSteam')}</li>
            <li>{t('privacy.thirdItch')}</li>
            <li>{t('privacy.thirdEmail')}</li>
            <li>{t('privacy.thirdHosting')}</li>
          </ul>
          <p>{t('privacy.thirdNoSelling')}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>{t('privacy.emailTitle')}</h2>
          <p>{t('privacy.email')}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>{t('privacy.supportTitle')}</h2>
          <p>{t('privacy.support')}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>{t('privacy.rightsTitle')}</h2>
          <p>{t('privacy.rightsIntro')}</p>
          <ul className={styles.list}>
            <li>
              {t('privacy.rightsDelete')} <Link to="/delete-account">{t('delete.title')}</Link>.
            </li>
            <li>{t('privacy.rightsAccess')}</li>
            <li>{t('privacy.rightsCorrect')}</li>
          </ul>
          <p>
            {t('privacy.rightsContact')}{' '}
            <a href={`mailto:${studio.businessEmail}`}>{studio.businessEmail}</a>
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>{t('privacy.childrenTitle')}</h2>
          <p>{t('privacy.children')}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>{t('privacy.changesTitle')}</h2>
          <p>{t('privacy.changes')}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>{t('privacy.contactTitle')}</h2>
          <p>
            {t('privacy.contact')}{' '}
            <a href={`mailto:${studio.businessEmail}`}>{studio.businessEmail}</a>
          </p>
        </section>
      </div>
    </Container>
  );
}
