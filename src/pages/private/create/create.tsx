import moment from "moment";
import { useState } from "react";
import { NavBar } from "../../../components/navbar";
import { addEvent, getCategories, getTags, getMembers } from "../../../services/api/firebase/api";
import useEffectOnce from "../../../services/hooks/useEffectOnce";
import { useStateStore } from "../../../services/zustand/zustand";
import { BasicModel } from "../home/home";
import { Link } from "react-router-dom";

export function Create() {

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [at, setAt] = useState(moment().format("YYYY-MM-DD"));
  const [category, setCategory] = useState(-1);
  const [tag, setTag] = useState(-1);
  const [member, setMember] = useState(-1);

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<BasicModel[]>([]);
  const [tags, setTags] = useState<BasicModel[]>([]);
  const [members, setMembers] = useState<BasicModel[]>([]);
  const currentFamily = useStateStore((state) => state.currentFamily);

  const onAdd = () => {

    setIsLoading(true);

    setTimeout(() => {
      if (document.getElementById('my_modal_1'))
        (document.getElementById('my_modal_1') as any).showModal();
      setIsLoading(false);
    }, 1000);

    addEvent({
      title: title,
      desc: desc,
      at: moment(at, "YYYY-MM-DD").format("DDMMYYYY"),
      category: category,
      tag: tag,
      created: moment().format("DDMMYYYY"),
      createdby: 1,
      directto: member,
    }, currentFamily);
  }

  useEffectOnce(() => {
    getCategories(currentFamily).then(l => { setCategories(l) });
    getTags(currentFamily).then(l => { setTags(l) });
    getMembers(currentFamily).then(l => { setMembers(l) });
  })

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
                <option value={-1} >NESSUNO</option>
                {
                  categories?.map((el, idx) => {
                    return <option key={idx} value={el.id}>{el.title}</option>
                  })
                }
              </select>
            </div>
            <div className="my-4">
              <h3 className="font-medium text-2xl text-gray-900">Tag</h3>
              <select onChange={e => { setTag(Number(e.target.value)) }} value={tag} className="select select-bordered w-full max-w-lg my-3">
                <option value={-1} >NESSUNO</option>
                {
                  tags?.map((el, idx) => {
                    return <option key={idx} value={el.id}>{el.title}</option>
                  })
                }
              </select>
            </div>

            <div className="my-4">
              <h3 className="font-medium text-2xl text-gray-900">Associato a </h3>
              <select onChange={e => { setMember(Number(e.target.value)) }} value={member} className="select select-bordered w-full max-w-lg my-3">
                <option value={-1} >NESSUNO</option>
                {
                  members?.map((el, idx) => {
                    return <option key={idx} value={el.id}>{el.title}</option>
                  })
                }
              </select>
            </div>

            <div className="my-4">
              <button onClick={onAdd} className="btn btn-primary" disabled={member == -1 || title.length == 0 || desc.length == 0 || isLoading}>aggiungi</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <dialog id="my_modal_1" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg text-green-600">Complimenti</h3>
        <p className="py-4">Evento creato con successo!</p>
        <div className="modal-action">
          <form method="dialog">
            <Link to="/" className="hover:bg-gray-100 p-3 rounded">Procedi</Link>
          </form>
        </div>
      </div>
    </dialog>
  </div>
}