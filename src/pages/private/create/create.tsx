import { useState } from "react"
import { NavBar } from "../../../components/navbar";
import { addEvent, getCategories, getTags } from "../../../services/api/firebase/api";
import moment from "moment";
import useEffectOnce from "../../../services/hooks/useEffectOnce";
import { BasicModel } from "../home/home";
import { useStateStore } from "../../../services/zustand/zustand";

export function Create() {

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState(-1);
  const [tag, setTag] = useState(-1);
  const [at, setAt] = useState(moment().format("YYYY-MM-DD"));
  const [icons] = useState([
    "shopping-svgrepo-com.svg",
    "subscription-svgrepo-com.svg",
    "the-internet-svgrepo-com.svg",
    "time-svgrepo-com.svg",
    "bookmark-svgrepo-com.svg",
    "cloud-svgrepo-com.svg",
    "delete-svgrepo-com.svg",
    "dial-svgrepo-com.svg",
    "document-svgrepo-com.svg",
    "earphone-svgrepo-com.svg ",
    "front-page-svgrepo-com.svg",
    "gift-svgrepo-com.svg",
    "information-svgrepo-com.svg",
    "key-svgrepo-com.svg",
    "location-svgrepo-com.svg",
    "personal-svgrepo-com.svg"]);
  const [icon, setIcon] = useState("");
  const [categories, setCategories] = useState<BasicModel[]>([]);
  const [tags, setTags] = useState<BasicModel[]>([]);
  const currentFamily = useStateStore((state) => state.currentFamily);

  const onAdd = () => {
    addEvent({ at: moment(at, "YYYY-MM-DD").format("DDMMYYYY"), title: title, desc: desc, img: icon, category: category, createdby: 1, createdfor: 1 })
  }

  useEffectOnce(() => {
    getCategories(currentFamily).then(l => { setCategories(l) });
    getTags(currentFamily).then(l => { setTags(l) });
  })

  console.log(categories);

  return <div className="relative gradient-grigio-bluastro h-full">

    <NavBar />

    <div className="p-10 pt-0">

      <div className="container mx-auto text-center">

        <h3 className="text-4xl lg:text-7xl font-bold my-6">Nuovo evento</h3>
        <div className="grid px-10 grid-cols-1 lg:grid-cols-1">

          <div className="text-center">
            <div className="my-4">
              <h3 className="font-medium text-2xl text-gray-900">Titolo</h3>
              <input type="text" placeholder="Inserisci il titolo" value={title} onChange={e => setTitle(e.target.value)} className="input input-bordered w-full max-w-lg my-3" />
            </div>
            <div className="my-4">
              <h3 className="font-medium text-2xl text-gray-900">Descrizione</h3>
              <textarea placeholder="Inserisci una descrizione" value={desc} onChange={e => setDesc(e.target.value)} className="input input-bordered w-full max-w-lg my-3 p-3 min-h-[160px]" />
            </div>
            <div className="my-4">
              <h3 className="font-medium text-2xl text-gray-900">Data</h3>
              <input type="date" value={at} onChange={e => setAt(e.target.value)} className="input input-bordered w-full max-w-lg my-3" />
            </div>
            <div className="my-4">
              <h3 className="font-medium text-2xl text-gray-900">Categoria</h3>
              <select onChange={e => { setCategory(Number(e.target.value)) }} value={category} className="select select-bordered w-full max-w-lg my-3">
                {
                  categories?.map((el, idx) => {
                    return <option key={idx} value={el.id}>{el.title}</option>
                  })
                }
              </select>
              <button onClick={() => (document.getElementById('my_modal_2') as any).showModal()} className="btn hidden btn-secondary btn-sm ms-3"><i className="fa-solid fa-plus"></i></button>
            </div>
            <div className="my-4">
              <h3 className="font-medium text-2xl text-gray-900">Tag</h3>
              <select onChange={e => { setTag(Number(e.target.value)) }} value={category} className="select select-bordered w-full max-w-lg my-3">
                {
                  tags?.map((el, idx) => {
                    return <option key={idx} value={el.id}>{el.title}</option>
                  })
                }
              </select>
              <button onClick={() => (document.getElementById('my_modal_2') as any).showModal()} className="btn hidden btn-secondary btn-sm ms-3"><i className="fa-solid fa-plus"></i></button>
            </div>

            <div className="my-4">
              <h3 className="font-medium text-2xl text-gray-900">Associato a </h3>
              <select className="select select-bordered w-full max-w-lg my-3">
                <option value="1">ANDREA</option>
                <option value="2">MICHELA</option>
                <option value="3">VANESSA</option>
                <option value="3">MARIO</option>
              </select>
              <button onClick={() => (document.getElementById('my_modal_2') as any).showModal()} className="btn hidden btn-secondary btn-sm ms-3"><i className="fa-solid fa-plus"></i></button>
            </div>
            <div className="my-4 hidden">
              <h3 className="font-medium text-2xl text-gray-900">Icona</h3>
              <div className="my-4 bg-gray-200 rounded flex flex-wrap flex-row gap-5 p-5 justify-center w-auto align-center mx-auto container ">
                {icons.map((el, idx) => {
                  return <div key={idx} className={"cursor-pointer rounded-lg  hover:bg-gray-200 active:bg-red-800  w-28" + (icon == el ? " bg-red-600" : "")} onClick={e => setIcon(el)}>
                    <img className="p-4 mx-auto hover:scale-90" src={"icons/" + el} />
                  </div>
                })}
              </div>
            </div>
            <div className="my-4">
              <button onClick={onAdd} className="btn btn-primary " disabled={title.length == 0 || desc.length == 0}>aggiungi</button>
            </div>
          </div>
          <div>
          </div>
        </div>
      </div>
    </div>
    <dialog id="my_modal_2" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Nuova tipologia</h3>
        <p className="py-4">Aggiungi una nuova tipologia per i tuoi eventi</p>
        <div className="my-4">
          <input type="text" placeholder="Nome" value={title} onChange={e => setTitle(e.target.value)} className="input input-bordered w-full max-w-lg my-3" />
        </div>
        <div className="text-end">
          <button onClick={onAdd} className="btn btn-primary" >aggiungi</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
}