import { NavBar } from "../../../components/navbar";
import { onSignOutWithGoogle } from "../../../services/api/firebase/useFirebase";
import { useStateStore } from "../../../services/zustand/zustand";

export function Me() {

    const account = useStateStore((state) => state.account);

    const onLogout = () => {
        onSignOutWithGoogle();
    }

    return <div className="relative gradient-grigio-bluastro h-full">

        <NavBar />

        <div className="p-10 pt-0">

            <div className="container mx-auto text-center">

                <h3 className="text-4xl lg:text-7xl font-bold my-6 hidden">Profilo</h3>
                <div className="grid px-10 grid-cols-1 lg:grid-cols-1">

                    <div className="text-center">
                        <div className="my-4">
                            <img src="icons/couple.svg" className="mx-auto my-16 w-full" style={{ maxWidth: 380 }}></img>
                            <h1 className="text-xl font-bold">{account?.displayname}</h1>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="my-4">
                            <button className="btn btn-outline self-center hover:scale-90 cursor-pointer" onClick={onLogout}>
                                <span className="text-xl">esci</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}