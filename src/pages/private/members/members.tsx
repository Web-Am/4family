import { useEffect, useState } from "react"
import { NavBar } from "../../../components/navbar";
import { addCategory, addMember, deleteCategory, deleteMember, getMembers, updateCategory, updateMember } from "../../../services/api/firebase/api";
import { BasicModel } from "../home/home";
import { useStateStore } from "../../../services/zustand/zustand";
import { findLastWithMaxId } from "../../../services/utils/utils";
import useEffectOnce from "../../../services/hooks/useEffectOnce";

export function Members() {

  const [members, setMembers] = useState<BasicModel[]>([]);
  const [memberSelected, setMemberSelected] = useState<BasicModel>();
  const [activeTab, setActiveTab] = useState('list'); // 'list' o 'add'

  const currentFamily = useStateStore((state) => state.currentFamily);
  const [newID, setNewID] = useState(0);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState("");
  const [newDescription, setNewDescription] = useState('');

  useEffectOnce(() => {
    getMembers(currentFamily).then(l => { setMembers(l) });
  })

  const onAdd = () => {
    if (newID == 0) {
      const lastUserWithMaxId = findLastWithMaxId(members, "id");
      addMember({ id: lastUserWithMaxId ? lastUserWithMaxId.id + 1 : 1, title: newTitle.toUpperCase(), desc: newDescription, icon: newIcon }, currentFamily)
        .finally(() => getMembers(currentFamily).then(l => { setMembers(l); setActiveTab("list") }));
    }
    else {
      memberSelected.desc = newDescription;
      memberSelected.title = newTitle.toUpperCase();
      memberSelected.icon = newIcon;

      updateMember(memberSelected, currentFamily)
        .finally(() => getMembers(currentFamily).then(l => { setMembers(l); setActiveTab("list") }));
    }
  }

  const onModify = (bm: BasicModel) => {
    setMemberSelected(bm);
    setNewID(bm.id);
    setNewTitle(bm.title);
    setNewDescription(bm.desc);
    setNewIcon(bm.icon);
    setActiveTab('add');
  }

  const onDelete = (element: any) => {
    if (window.confirm("convinto di cancellare il dato?"))
      deleteMember(element, currentFamily)
        .finally(() => getMembers(currentFamily).then(l => { setMembers(l) }));
  }


  return (
    <div className="min-h-screen bg-gray-100">

      <NavBar />

      <div className="container mx-auto py-8 px-6 md:px-0">

        <div className="flex mb-4">
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => {
              setNewID(0);
              setActiveTab('list');
            }}>
            Famiglia
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => {
              setNewID(0);
              setNewTitle("");
              setNewDescription("");
              setNewIcon("");
              setActiveTab('add');
            }}>
            {newID == 0 ? "Aggiungi" : "Modifica"}
          </button>
        </div>

        {activeTab === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((category, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">{category.title}</h3>
                <p className="text-gray-700">{category.desc}</p>
                <div className="text-end">
                  <button
                    onClick={() => onModify(category)}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700  hover:bg-gray-100 focus:ring-red-400 disabled:bg-gray-300 disabled:text-gray-400 disabled:text-opacity-60">
                    Modifica
                  </button>
                  <button
                    onClick={() => onDelete(category)}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-400 disabled:bg-gray-300 disabled:text-gray-400 disabled:text-opacity-60">
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'add' && (
          <form className="space-y-4" onSubmit={onAdd}>
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="my-4">
                <h3 className="font-medium text-2xl text-gray-900">Titolo</h3>
                <input type="text" placeholder="Inserisci il titolo" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="input input-bordered w-full max-w-lg my-3" />
              </div>
              <div className="my-4">
                <h3 className="font-medium text-2xl text-gray-900">Descrizione</h3>
                <textarea placeholder="Inserisci una descrizione" value={newDescription} onChange={e => setNewDescription(e.target.value)} className="input input-bordered w-full max-w-lg my-3 p-3 min-h-[160px]" />
              </div>
              <div className="my-4">
                <h3 className="font-medium text-2xl text-gray-900">Icona</h3>
                {
                  ["icons/man.svg", "icons/woman.svg", "icons/baby-man.svg", "icons/baby-woman.svg"]?.map((el, idx) => {
                    return <button key={idx} value={el} onClick={e => setNewIcon(el)} type="button">
                      <img src={el} className={"w-28 hover:bg-gray-100 rounded mr-4" + (newIcon == el ? " bg-gray-300" : "")} />
                    </button>
                  })
                }
              </div>
              <button
                type="button" onClick={onAdd} disabled={newTitle?.length == 0 || newDescription?.length == 0}
                className="inline-flex first-letter:items-center px-3 py-2 bg-blue-500 border text-sm disabled:bg-gray-300 disabled:text-gray-400 disabled:text-opacity-60 border-transparent rounded-md font-medium text-white hover:bg-blue-700">
                {newID == 0 ? "Aggiungi" : "Modifica"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div >
  );
}