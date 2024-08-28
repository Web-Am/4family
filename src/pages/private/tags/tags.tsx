import { useEffect, useState } from "react"
import { NavBar } from "../../../components/navbar";
import { addTag, deleteTag, getTags, updateTag } from "../../../services/api/firebase/api";
import { BasicModel } from "../home/home";
import { useStateStore } from "../../../services/zustand/zustand";
import { findLastWithMaxId } from "../../../services/utils/utils";

export function Tags() {

  const [tags, setTags] = useState<BasicModel[]>([]);
  const [tagSelected, setTagSelected] = useState<BasicModel>();
  const [activeTab, setActiveTab] = useState('list'); // 'list' o 'add'

  const currentFamily = useStateStore((state) => state.currentFamily);
  const [newTagID, setNewTagID] = useState(0);
  const [newTagTitle, setNewTagTitle] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');

  useEffect(() => {
    getTags(currentFamily).then(l => { setTags(l) });
  }, [])

  const onAdd = () => {
    if (newTagID == 0) {
      const lastUserWithMaxId = findLastWithMaxId(tags, "id");
      addTag({ id: lastUserWithMaxId ? lastUserWithMaxId.id + 1 : 1, title: newTagTitle.toUpperCase(), desc: newTagDescription }, currentFamily)
        .finally(() => getTags(currentFamily).then(l => { setTags(l); setActiveTab("list") }));
    }
    else {
      tagSelected.desc = newTagDescription;
      tagSelected.title = newTagTitle.toUpperCase();

      console.log("updating", tagSelected)
      updateTag(tagSelected, currentFamily)
        .finally(() => getTags(currentFamily).then(l => { setTags(l); setActiveTab("list") }));
    }
  }

  const onModify = (Tag: BasicModel) => {
    setTagSelected(Tag);
    setNewTagID(Tag.id);
    setNewTagTitle(Tag.title);
    setNewTagDescription(Tag.desc);
    setActiveTab('add');
  }

  const onDelete = (element: any) => {
    if (window.confirm("convinto di cancellare il dato?"))
      deleteTag(element, currentFamily)
        .finally(() => getTags(currentFamily).then(l => { setTags(l) }));
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <NavBar />

      <div className="container mx-auto py-8 px-6 md:px-0">

        <div className="flex mb-4">
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => {
              setNewTagID(0); setActiveTab('list');
            }}>
            Tags
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => {
              setNewTagID(0);
              setNewTagTitle("");
              setNewTagDescription("");
              setActiveTab('add');
            }}>
            {newTagID == 0 ? "Aggiungi" : "Modifica"}
          </button>
        </div>

        {activeTab === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tags.map((Tag, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">{Tag.title}</h3>
                <p className="text-gray-700">{Tag.desc}</p>
                <div className="text-end">
                  <button
                    onClick={() => onModify(Tag)}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700  hover:bg-gray-100 focus:ring-red-400 disabled:bg-gray-300 disabled:text-gray-400 disabled:text-opacity-60">
                    Modifica
                  </button>
                  <button
                    onClick={() => onDelete(Tag)}
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
                <input type="text" placeholder="Inserisci il titolo" value={newTagTitle} onChange={e => setNewTagTitle(e.target.value)} className="input input-bordered w-full max-w-lg my-3" />
              </div>
              <div className="my-4">
                <h3 className="font-medium text-2xl text-gray-900">Descrizione</h3>
                <textarea placeholder="Inserisci una descrizione" value={newTagDescription} onChange={e => setNewTagDescription(e.target.value)} className="input input-bordered w-full max-w-lg my-3 p-3 min-h-[160px]" />
              </div>
              <button
                type="button" onClick={onAdd} disabled={newTagTitle.length == 0 || newTagDescription.length == 0}
                className="inline-flex first-letter:items-center px-3 py-2 bg-blue-500 border text-sm disabled:bg-gray-300 disabled:text-gray-400 disabled:text-opacity-60 border-transparent rounded-md font-medium text-white hover:bg-blue-700">
                {newTagID == 0 ? "Aggiungi" : "Modifica"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div >
  );
}