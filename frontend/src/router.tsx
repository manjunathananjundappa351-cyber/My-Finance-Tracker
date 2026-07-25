import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import { Loader } from "@/components/Loader";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { Register } from "@/pages/Register";

const Dashboard = lazy(() => import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const Expenses = lazy(() => import("@/pages/Expenses").then((m) => ({ default: m.Expenses })));
const Income = lazy(() => import("@/pages/Income").then((m) => ({ default: m.Income })));
const Portfolio = lazy(() => import("@/pages/Portfolio").then((m) => ({ default: m.Portfolio })));
const Budget = lazy(() => import("@/pages/Budget").then((m) => ({ default: m.Budget })));
const Goals = lazy(() => import("@/pages/Goals").then((m) => ({ default: m.Goals })));
const Loans = lazy(() => import("@/pages/Loans").then((m) => ({ default: m.Loans })));
const TradeJournal = lazy(() =>
  import("@/pages/TradeJournal").then((m) => ({ default: m.TradeJournal }))
);
const SipCalculator = lazy(() =>
  import("@/pages/SipCalculator").then((m) => ({ default: m.SipCalculator }))
);
const Settings = lazy(() => import("@/pages/Settings").then((m) => ({ default: m.Settings })));
const SystemHealth = lazy(() =>
  import("@/pages/SystemHealth").then((m) => ({ default: m.SystemHealth }))
);
const Calendar = lazy(() => import("@/pages/Calendar").then((m) => ({ default: m.Calendar })));
const Activity = lazy(() => import("@/pages/Activity").then((m) => ({ default: m.Activity })));

function withSuspense(element: JSX.Element) {
  return <Suspense fallback={<Loader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: withSuspense(<Dashboard />) },
          { path: "/expenses", element: withSuspense(<Expenses />) },
          { path: "/income", element: withSuspense(<Income />) },
          { path: "/portfolio", element: withSuspense(<Portfolio />) },
          { path: "/budget", element: withSuspense(<Budget />) },
          { path: "/goals", element: withSuspense(<Goals />) },
          { path: "/loans", element: withSuspense(<Loans />) },
          { path: "/trades", element: withSuspense(<TradeJournal />) },
          { path: "/sip-calculator", element: withSuspense(<SipCalculator />) },
          { path: "/settings", element: withSuspense(<Settings />) },
          { path: "/system-health", element: withSuspense(<SystemHealth />) },
          { path: "/calendar", element: withSuspense(<Calendar />) },
          { path: "/activity", element: withSuspense(<Activity />) },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
