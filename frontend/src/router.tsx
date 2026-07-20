import { createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import { Budget } from "@/pages/Budget";
import { Dashboard } from "@/pages/Dashboard";
import { Expenses } from "@/pages/Expenses";
import { Goals } from "@/pages/Goals";
import { Income } from "@/pages/Income";
import { Loans } from "@/pages/Loans";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { Portfolio } from "@/pages/Portfolio";
import { Register } from "@/pages/Register";
import { Settings } from "@/pages/Settings";
import { SipCalculator } from "@/pages/SipCalculator";
import { TradeJournal } from "@/pages/TradeJournal";

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
          { path: "/", element: <Dashboard /> },
          { path: "/expenses", element: <Expenses /> },
          { path: "/income", element: <Income /> },
          { path: "/portfolio", element: <Portfolio /> },
          { path: "/budget", element: <Budget /> },
          { path: "/goals", element: <Goals /> },
          { path: "/loans", element: <Loans /> },
          { path: "/trades", element: <TradeJournal /> },
          { path: "/sip-calculator", element: <SipCalculator /> },
          { path: "/settings", element: <Settings /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
