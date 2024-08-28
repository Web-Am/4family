import { useState, useEffect } from "react";
import { NavBar } from "../../../components/navbar";
import { getMembers, addMember, deleteMember } from "../../../services/api/firebase/api";
import { findLastWithMaxId } from "../../../services/utils/utils";
import { useStateStore } from "../../../services/zustand/zustand";
import { MemberModel } from "../home/home";


export function Family() {

  const [members, setMembers] = useState<MemberModel[]>([]);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState(-1);
  const [desc, setDesc] = useState("");
  const currentFamily = useStateStore((state) => state.currentFamily);

  useEffect(() => {
    getMembers(currentFamily).then(l => { setMembers(l) });
  }, [])

  const onAdd = () => {
    let m = new MemberModel();
    const lastUserWithMaxId = findLastWithMaxId(members, "id");
    m.id = lastUserWithMaxId ? lastUserWithMaxId.id + 1 : 1;
    m.desc = desc;
    m.name = title;
    addMember(m, currentFamily)
      .finally(() => getMembers(currentFamily).then(l => { setMembers(l) }));
  }
  const onDelete = (element: any) => {
    if (window.confirm("convinto di cancellare il dato?"))
      deleteMember(element, currentFamily)
        .finally(() => getMembers(currentFamily).then(l => { setMembers(l) }));
  }

  return <div className="relative gradient-grigio-bluastro h-full">

    <NavBar />

    <div className="p-10 pt-0">

      <div className="container mx-auto text-center">

        <h3 className="text-4xl lg:text-7xl font-bold my-6">Famiglia</h3>
        <div className="grid px-10 grid-cols-1 lg:grid-cols-2">

          <div className="text-center">
            {
              members?.map((el, idx) => {
                return <div><div className="flex flex-row justify-between m-4 text-start">
                  <div className="flex flex-col">
                    <span className="font-medium text-md text-gray-900">{el.name}</span>
                    <span className="font-medium text-sm text-gray-500">{el.desc}</span>
                  </div>
                  <button onClick={e => onDelete(el)} className="btn btn-danger w-20">elimina</button>
                </div>
                  <hr className="w-full"></hr>
                </div>
              })
            }
          </div>

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
              <h3 className="font-medium text-2xl text-gray-900">Icona</h3>
              <select onChange={e => { setIcon(Number(e.target.value)) }} value={icon} className="select select-bordered w-full max-w-lg my-3">
                <option value={-1} >NESSUNO</option>
                {
                  ["assets/man.svg", "assets/man.svg",]?.map((el, idx) => {
                    return <option key={idx} value={el}><img src={el} /></option>
                  })
                }
              </select>
            </div>
            <button onClick={onAdd} className="btn btn-primary " disabled={title.length == 0 || desc.length == 0}>aggiungi</button>
          </div>
        </div>
      </div>
    </div>
  </div>
}