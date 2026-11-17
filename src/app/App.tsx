import { lazy } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { AppStateProvider } from './state';
import { HomePage } from '../features/discover/HomePage';

const StartPage = lazy(() => import('../features/discover/StartPage'));
const ResultsPage = lazy(() => import('../features/discover/ResultsPage'));
const ScenarioPage = lazy(() => import('../features/catalog/ScenarioPage'));
const CatalogPage = lazy(() => import('../features/catalog/CatalogPage'));
const DemoPage = lazy(() => import('../features/demos/DemoPage'));
const CardPage = lazy(() => import('../features/card/CardPage'));
const NoticePage = lazy(() => import('../features/static/NoticePage'));
const AboutPage = lazy(() => import('../features/static/AboutPage'));
const NotFoundPage = lazy(() => import('../features/static/NotFoundPage'));

/** Every route must render inside Layout so the org-data banner is always present (tested in e2e). */
export const ROUTES = [
  '/',
  '/start',
  '/results',
  '/scenario/:id',
  '/catalog',
  '/demo/:id',
  '/card',
  '/notice',
  '/about',
] as const;

export function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="start" element={<StartPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="scenario/:id" element={<ScenarioPage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="demo/:id" element={<DemoPage />} />
            <Route path="card" element={<CardPage />} />
            <Route path="notice" element={<NoticePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppStateProvider>
  );
}
