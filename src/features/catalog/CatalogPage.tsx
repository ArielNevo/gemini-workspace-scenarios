import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { OrgDataNotice } from '../../components/OrgDataNotice';
import { Page } from '../../components/Page';
import { DraftBadge, ToolBadge } from '../../components/Badges';
import {
  FAMILY_LABELS,
  scenarios,
  synonymGroups,
  taxonomy,
  TOOL_LABELS,
  TOOL_SHORT,
  type Family,
  type Tool,
} from '../../lib/content';
import { createScenarioSearch } from '../../lib/search';

const searcher = createScenarioSearch(scenarios, taxonomy, synonymGroups, TOOL_LABELS);

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const family = (params.get('family') ?? '') as Family | '';
  const tool = (params.get('tool') ?? '') as Tool | '';
  // Search text lives only in component state: never in the URL, storage or any request.
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const base = query.trim()
      ? searcher.search(query).map((id) => scenarios.find((s) => s.id === id)!)
      : scenarios;
    return base.filter((s) => (!family || s.family === family) && (!tool || s.tool === tool));
  }, [query, family, tool]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <Page title="כל השימושים">
      <OrgDataNotice variant="inline" message="search" />
      <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="field">
          <label htmlFor="q">חיפוש בנושא כללי</label>
          <input
            id="q"
            type="search"
            value={query}
            maxLength={60}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="למשל: השוואת נהלים"
          />
        </div>
        <div className="field">
          <label htmlFor="family">תחום</label>
          <select id="family" value={family} onChange={(e) => setFilter('family', e.target.value)}>
            <option value="">הכול</option>
            {(Object.keys(FAMILY_LABELS) as Family[]).map((f) => (
              <option key={f} value={f}>
                {FAMILY_LABELS[f]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="tool">כלי</label>
          <select id="tool" value={tool} onChange={(e) => setFilter('tool', e.target.value)}>
            <option value="">הכול</option>
            {(Object.keys(TOOL_SHORT) as Tool[]).map((k) => (
              <option key={k} value={k}>
                {TOOL_SHORT[k]}
              </option>
            ))}
          </select>
        </div>
      </form>
      <p aria-live="polite" className="muted">
        {list.length === 0
          ? 'לא נמצאו שימושים. נסו מילה כללית יותר, הסירו סינון, או '
          : `מוצגים ${list.length} שימושים.`}
        {list.length === 0 && <Link to="/start">ענו על השאלות הקצרות</Link>}
      </p>
      <ul className="catalog-grid">
        {list.map((s) => (
          <li key={s.id} className="card">
            <div className="card-badges">
              <ToolBadge tool={s.tool} />
              <DraftBadge status={s.status} />
            </div>
            <h2 className="h3">
              <Link to={`/scenario/${s.id}`}>{s.title}</Link>
            </h2>
            <p>{s.whatYouGet}</p>
          </li>
        ))}
      </ul>
    </Page>
  );
}
