import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function Root() {
  return <RouterProvider router={router} />;
}
