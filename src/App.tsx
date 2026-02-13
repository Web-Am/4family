import { Routes, Route, BrowserRouter } from "react-router-dom";
import AuthPage from "./pages/authPage";
import DashboardPage from "./pages/dashboardPage";
import CategoryPage from "./pages/categoryPage";
import NotFoundPage from "./pages/notfoundPage";

const RoutesPages = () => {
  return <Routes>
    <Route path="/" element={<AuthPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/category/:categoryId" element={<CategoryPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
}
function App() {

  const SUBSITE = "/";

  return <BrowserRouter basename={SUBSITE}>
    <div className='min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-slate-100 relative'>
      <RoutesPages />
    </div>
  </BrowserRouter>
}

export default App;