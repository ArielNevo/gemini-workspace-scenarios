import { Link } from 'react-router-dom';
import { Page } from '../../components/Page';

export default function NotFoundPage() {
  return (
    <Page title="העמוד לא נמצא">
      <p>
        <Link to="/">לדף הבית</Link> · <Link to="/catalog">לכל השימושים</Link>
      </p>
    </Page>
  );
}
