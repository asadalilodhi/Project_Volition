import { createBrowserRouter } from 'react-router';
import { Dashboard } from './pages/Dashboard';
import { CalendarInteraction } from './pages/CalendarInteraction';
import { DocumentIngest } from './pages/DocumentIngest';
import { VolitionScreen } from './pages/VolitionScreen';
import { Navigation } from './components/Navigation';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/calendar',
    element: (
      <Layout>
        <CalendarInteraction />
      </Layout>
    ),
  },
  {
    path: '/document',
    element: (
      <Layout>
        <DocumentIngest />
      </Layout>
    ),
  },
  {
    path: '/volition',
    element: (
      <Layout>
        <VolitionScreen />
      </Layout>
    ),
  },
]);