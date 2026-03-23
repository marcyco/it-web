import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Experiment from '../pages/Experiment';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/experiment',
        element: <Experiment />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '*',
        element: <NotFound />,
    },
]);

export default router;
