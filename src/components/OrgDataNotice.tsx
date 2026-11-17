import { Link } from 'react-router-dom';
import { t } from '../lib/content';

type Variant = 'banner' | 'inline' | 'full' | 'footer';

interface Props {
  variant: Variant;
  /** For inline notices: which message to show. */
  message?: 'inline' | 'search' | 'demos' | 'afterLicense' | 'experimentOnly';
  extra?: string;
}

const MESSAGE = {
  inline: 'notice.inline',
  search: 'notice.search',
  demos: 'notice.demos',
  afterLicense: 'notice.afterLicense',
  experimentOnly: 'notice.experimentOnly',
} as const;

/** The single component that tells users not to enter organizational data (brief section 2.1). */
export function OrgDataNotice({ variant, message = 'inline', extra }: Props) {
  if (variant === 'banner') {
    return (
      <div className="notice-banner" role="note" aria-label="הודעה חשובה" data-testid="notice-banner">
        <span aria-hidden="true" className="notice-icon">
          !
        </span>
        <p>
          {t('notice.banner')} <Link to="/notice">{t('notice.fullLink')}</Link>
        </p>
      </div>
    );
  }
  if (variant === 'footer') {
    return (
      <p className="notice-footer" data-testid="notice-footer">
        {t('notice.footer')} <Link to="/notice">{t('notice.fullLink')}</Link>
      </p>
    );
  }
  if (variant === 'full') {
    return (
      <div className="notice-inline notice-full" role="note" data-testid="notice-full">
        <p>
          <strong>{t('notice.banner')}</strong>
        </p>
        <p>{t('notice.afterLicense')}</p>
      </div>
    );
  }
  return (
    <div className="notice-inline" role="note" data-testid={`notice-${message}`}>
      <span aria-hidden="true" className="notice-icon">
        !
      </span>
      <div>
        <p>{t(MESSAGE[message])}</p>
        {extra && <p>{extra}</p>}
      </div>
    </div>
  );
}
