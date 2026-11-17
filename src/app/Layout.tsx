import { Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { OrgDataNotice } from '../components/OrgDataNotice';
import { siteConfig } from '../lib/content';
import { useAppState } from './state';
import { clearState } from '../lib/storage';

export function Layout() {
  const { state, dispatch } = useAppState();
  const location = useLocation();
  return (
    <>
      <a className="skip-link" href="#main">
        דלגו לתוכן
      </a>
      <OrgDataNotice variant="banner" />
      <header className="site-header">
        <div className="container header-inner">
          <NavLink to="/" className="brand" aria-label="דף הבית: גלו את Gemini">
            {siteConfig.logoPath && <img src={siteConfig.logoPath} alt="" className="brand-logo" />}
            <span className="brand-text">
              <span className="brand-name">
                גלו את <bdi>Gemini</bdi>
              </span>
              {siteConfig.orgDisplayName && <span className="brand-sub">{siteConfig.orgDisplayName}</span>}
            </span>
          </NavLink>
          <nav aria-label="ניווט ראשי">
            <ul className="nav">
              <li>
                <NavLink to="/start">התחלה</NavLink>
              </li>
              <li>
                <NavLink to="/catalog">כל השימושים</NavLink>
              </li>
              <li>
                <NavLink to="/card">השימושים שלי</NavLink>
              </li>
              <li>
                <NavLink to="/notice">מה אסור להזין</NavLink>
              </li>
              <li>
                <NavLink to="/about">אודות</NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main id="main" className="container" tabIndex={-1}>
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<p aria-live="polite">טוען…</p>}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <footer className="site-footer">
        <div className="container">
          <OrgDataNotice variant="footer" />
          {siteConfig.consult.name && (
            <p className="small">
              להתייעצות: {siteConfig.consult.name}, {siteConfig.consult.role}.
            </p>
          )}
          {state.saved && (
            <p>
              שמרתם את המסלול בדפדפן הזה.{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  clearState();
                  dispatch({ type: 'reset' });
                }}
              >
                מחקו את הנתונים שלי
              </button>
            </p>
          )}
        </div>
      </footer>
    </>
  );
}
