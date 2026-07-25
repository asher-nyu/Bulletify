import ExperiencePage from './pages/ExperiencePage';
import ProjectPage from './pages/ProjectPage';

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path === '/project') {
    return <ProjectPage />;
  }

  if (path !== '/experience') {
    window.history.replaceState(null, '', '/experience');
  }

  return <ExperiencePage />;
}
