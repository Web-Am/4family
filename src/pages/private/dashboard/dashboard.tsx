import { useEffect, useState } from "react"
import { NavBar } from "../../../components/navbar";
import { BasicModel } from "../home/home";
import { getCategories } from "../../../services/api/firebase/api";
import { useStateStore } from "../../../services/zustand/zustand";
import { Link } from "react-router-dom";

export function Dashboard() {

  const [categories, setCategories] = useState<BasicModel[]>([]);
  const currentFamily = useStateStore((state) => state.currentFamily);

  useEffect(() => {
    getCategories(currentFamily).then(l => { setCategories(l) });
  }, [])

  return <div className="relative gradient-grigio-bluastro h-full">

    <NavBar />

    <div className="container mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 p-6">
        {
          categories?.map((cat, idx) => {
            return <Link className="text-center hover:scale-110 shadow-md" key={idx} to="/">
              <div className="bg-white rounded-md p-6">
                <h3 className="font-medium text-base md:text-2xl lg:text-3xl text-gray-900 mx-auto">{cat.title}</h3>
                <img className="mt-3 w-72 rounded-lg mx-auto" src="https://images.pexels.com/photos/1008659/pexels-photo-1008659.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" />
              </div>
            </Link>
          })
        }
      </div>
    </div>
  </div>
}