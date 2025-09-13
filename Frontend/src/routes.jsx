import Login from "./pages/login";
import CitizenDashboard from "./pages/CitizenDashboard";
import AnalystDashboard from "./pages/AnalystDashboard";
import AdminDashboard from "./pages/AdminDashboard";

const routes = [
  { path: "/", element: <Login /> },
  { path: "/citizen", element: <CitizenDashboard /> },
  { path: "/analyst", element: <AnalystDashboard /> },
  { path: "/admin", element: <AdminDashboard /> },
];

export default routes;
