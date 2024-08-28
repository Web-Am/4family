import { useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Categories } from "./pages/private/categories/categories";
import { Create } from "./pages/private/create/create";
import { Dashboard } from "./pages/private/dashboard/dashboard";
import { Family } from "./pages/private/family/family";
import { Home } from "./pages/private/home/home";
import { Auth } from "./pages/public/auth/auth";
import Landing from "./pages/public/landing/landing";
import { useStateChangeWithGoogle } from "./services/api/firebase/useFirebase";
import { useStateStore } from "./services/zustand/zustand";
import { Me } from "./pages/private/me/me";
import { Tags } from "./pages/private/tags/tags";
import { Members } from "./pages/private/members/members";
import { MemberInfo } from "./pages/private/member/member";

const RoutesManagerPrivate = () => {
  return <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/create" element={<Create />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/members" element={<Members />} />
    <Route path="/member" element={<MemberInfo />} />
    <Route path="/categories" element={<Categories />} />
    <Route path="/family" element={<Family />} />
    <Route path="/tags" element={<Tags />} />
    <Route path="/me" element={<Me />} />
    <Route path="/me" element={<Me />} />
    <Route path="*" element={<Landing />} />
  </Routes>
}

const RoutesManagerPublic = () => {
  return <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="*" element={<Landing />} />
  </Routes>
}

//https://daisyui.com/docs/customize/
//https://tailwindcss.com/docs/installation

function App() {

  const SUBSITE = "/";

  const setAccount = useStateStore((state) => state.setAccount);
  const account = useStateStore((state) => state.account);

  const { user, isLoading } = useStateChangeWithGoogle();

  useEffect(() => {
    setAccount(user);
  }, [user]);

  return <BrowserRouter basename={SUBSITE}>
    <div className='min-h-screen gradient-grigio-bluastro relative'>
      {
        isLoading ?
          <div className="w-5 h-5 border-b-2 border-gray-900 rounded-full animate-spin"></div>
          : <> {account?.system?.length > 0 ?
            <RoutesManagerPrivate /> : <RoutesManagerPublic />
          }</>
      }
    </div>
  </BrowserRouter>
}

export default App;
