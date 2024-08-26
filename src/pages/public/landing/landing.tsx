import { Link } from "react-router-dom";

export default function Landing() {
    return <div className="bg-gradient-to-r absolute h-full w-full from-green-400 to-blue-500 flex flex-col items-center justify-center">
        <img src="/icons/family.png" alt="hero image" className="max-w-[200px] mb-8" />
        <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold ">Organizza la famiglia, <br /> semplifica la tua vita.</h1>
            <p className="mt-4 text-lg text-white">4Family è l'app che ti permette di tenere traccia di tutto ciò che conta, dai compleanni alle vacanze, con pochi clic. Un calendario familiare intelligente, sempre a portata di mano.</p>
            <Link to="/auth" className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-center hover:text-gray-900 border text-white border-gray-200 rounded-lg mt-8">
                Accedi
            </Link>
        </div>
    </div>
}