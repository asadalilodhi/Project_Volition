import { createBrowserRouter } from 'react-router';
import { MainWorkspace } from './pages/MainWorkspace';
import { CalendarInteraction } from './pages/CalendarInteraction';
import { DocumentIngest } from './pages/DocumentIngest';
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
    element: (
      <Layout>
        <MainWorkspace />
      </Layout>
    ),
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
]);
