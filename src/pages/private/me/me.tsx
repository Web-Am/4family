import { NavBar } from "../../../components/navbar";
import { useStateStore } from "../../../services/zustand/zustand";

export function Me() {

    const account = useStateStore((state) => state.account);

    console.log(account)
    return <div className="relative gradient-grigio-bluastro h-full">

        <NavBar />

        <div className="p-10 pt-0">

            <div className="container mx-auto text-center">

                <h3 className="text-4xl lg:text-7xl font-bold my-6 hidden">Profilo</h3>
                <div className="grid px-10 grid-cols-1 lg:grid-cols-1">

                    <div className="text-center">
                        <div className="my-4">
                            <h3 className="font-medium text-2xl text-gray-900 hidden">displayname</h3>
                            <span>{account?.displayname}</span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
}