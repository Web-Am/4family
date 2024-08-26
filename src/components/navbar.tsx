import { Link } from "react-router-dom"
import { onSignOutWithGoogle } from "../services/api/firebase/useFirebase"

export const NavBar = () => {

  const onLogout = () => {

    onSignOutWithGoogle();
  }

  return <nav className="text-end p-2 bg-white flex justify-between align-middle ">

    <Link to="/" className="my-auto text-3xl flex">4F<p className="text-red-800">a</p>mi<p className="text-red-800">l</p>y</Link>

    <div className="dropdown dropdown-end my-auto">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          <img alt="Tailwind CSS Navbar component" src="/icons/man.svg" />
        </div>
      </div>
      <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 divide-y divide-gray-100">

        <li className="py-4">
          <Link to="/me">
            <span className="text-xl">profilo</span>
          </Link>
        </li>
        <li className="py-4">
          <Link to="/categories">
            <span className="text-xl">categorie</span>
          </Link>
        </li>
        <li className="py-4">
          <Link to="/tags">
            <span className="text-xl">tags</span>
          </Link>
        </li>
        <li className="py-4">
          <Link to="/dashboard">
            <span className="text-xl">dashboard</span>
          </Link>
        </li>
        <li className="py-4">
          <Link to="/members">
            <span className="text-xl">famiglia</span>
          </Link>
        </li>
        <li className="py-4">
          <button onClick={onLogout}>
            <span className="text-xl">esci</span>
          </button>
        </li>
      </ul>
    </div>
  </nav>
}
