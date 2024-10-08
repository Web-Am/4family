import moment from "moment";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "../../../components/navbar";
import { getCategories, getEvents, getMembers, getTags } from "../../../services/api/firebase/api";
import useEffectOnce from "../../../services/hooks/useEffectOnce";
import { useStateStore } from "../../../services/zustand/zustand";


const Header = (props: any) => {
  return <div className="flex flex-col text-center px-3 py-3">
    <span className=" text-sm lg:text-lg text-gray-600">{props.text}</span>
  </div>
}

const Day = (props: any) => {

  const { text, notify } = props;

  return <div className="relative flex flex-row align-middle justify-center text-center p-4 hover:cursor-pointer hover:scale-110">
    {text != -1 && <span className="text-gray-500 text-sm lg:text-lg">{text}</span>}
    {notify && <span className="w-2 h-2 absolute top-0 right-10 text-red-900"><i className="fa-solid fa-circle opacity-60 p-0 fa-xs"></i></span>}
  </div>
}

const Events = (props: any) => {

  const { events, categories, tags } = props;

  return <div className="w-full overflow-y-auto ">
    {
      events?.map((el, idx) => {

        const cat = categories.find(x => x.id == el.category);
        const tag = tags.find(x => x.id == el.tag);

        console.log("cat", categories, cat);

        return <div key={idx} className="flex flex-col">
          <div className=" py-6">
            <div className="flex flex-row align-middle relative">

              <div className="m-4 rounded-lg w-[70px] text-center p-3 my-auto flex flex-col align-middle justify-center bg-gray-300">
                <p className=" text-md">Lun</p>
                <p className="font-bold text-2xl">{moment(el.at, "DDMMYYYY").format("DD")}</p>
              </div>

              <img src={"icons/" + el.img} className="w-8 h-8 my-auto hidden" />

              <div className="flex flex-col m-4">
                <span className="ps-3 font-medium text-md text-gray-900">{el.title}</span>
                <span className="ps-3 font-medium text-sm text-gray-500">{el.desc}</span>
              </div>

              <div className="absolute top-0 right-6">
                <div>
                  {tag?.title && <span className="bg-yellow-600 p-1 rounded-lg font-medium text-sm text-white mx-3">{tag?.title}</span>}
                  {cat?.title && <span className="bg-green-600 p-1 rounded-lg font-medium text-sm text-gray-900">{cat?.title}</span>}
                </div>
              </div>
            </div>
          </div>
          <hr className="w-[350px] mx-auto" />
        </div>
      })
    }
  </div >
}

const Calendar = (props: any) => {

  const { year, month, addMonth } = props;

  const daysDescription = ["L", "M", "M", "G", "V", "S", "D"];
  const monthsDescription = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

  const [days, setDays] = useState<number[]>([]);

  useEffect(() => {

    let k: number[] = [];
    const today = moment("01" + ((month < 10 ? "0" : "") + (month).toString()) + year.toString(), "DDMMYYYY");
    const currentWeekday = today.weekday();

    for (let index = 1; index <= today.daysInMonth(); index++)
      k.push(index);

    for (let index = 0; index < currentWeekday - 1; index++)
      k = [-1].concat(k);

    setDays(k);
  }, [month]);

  return <div className="bg-white p-5">
    <div className="px-4 py-5 flex justify-between">
      <h3 className="font-medium text-3xl text-gray-900">{monthsDescription[month - 1]}</h3>
      <div className="flex gap-5">
        <h3 className="font-medium text-gray-900 hover:scale-110 cursor-pointer" onClick={e => { addMonth(-1) }}><i className="fa-solid fa-arrow-left"></i></h3>
        <h3 className="font-medium text-gray-900 hover:scale-110 cursor-pointer" onClick={e => { addMonth(1) }}><i className="fa-solid fa-arrow-right"></i></h3>
      </div>
    </div>
    <div className="grid grid-cols-7">
      {
        daysDescription.map((el, idx) => {
          return <Header key={idx} text={daysDescription[idx]} />
        })
      }
    </div>

    <div className="grid grid-cols-7">
      {days?.map((el, idx) => {
        return <Day text={el} key={idx} />
      })}
    </div>
  </div>
}

class EventModel {
  at: string = "";
  title: string = "";
  desc: string = "";
}

export class BasicModel {
  id: number = -1;
  title: string = "";
  desc: string = "";
  icon: string = "";
}

export class MemberModel {
  id: number = -1;
  name: string = "";
  desc: string = "";
}


export function Home() {

  const [current, setCurrent] = useState<moment.Moment>(moment());

  const MAX_DATE = moment().add(100, 'years'); // Adjust as needed
  const MIN_DATE = moment().subtract(100, 'years'); // Adjust as needed
  const [events, setEvents] = useState<EventModel[]>([]);
  const [members, setMembers] = useState<BasicModel[]>([]);
  const [tags, setTags] = useState<BasicModel[]>([]);
  const [categories, setCategories] = useState<BasicModel[]>([]);
  const currentFamily = useStateStore((state) => state.currentFamily);

  //https://console.firebase.google.com/u/3/project/family-72d51/database/family-72d51-default-rtdb/data

  useEffectOnce(() => {
    getCategories(currentFamily).then(l => { setCategories(l) });
    getTags(currentFamily).then(l => { setTags(l) });
    getMembers(currentFamily).then(l => { setMembers(l) });
  })

  useEffect(() => {
    getEvents(current.format("YYYY"), current.format("MM"), currentFamily).then(l => setEvents(l));
  }, [current.month(), current.year()])

  const onAddMonth = (value: number) => {
    setCurrent((old) => {
      const newDate = old.clone().add(value, 'month');
      return newDate.isBefore(MIN_DATE) ? MIN_DATE : newDate.isAfter(MAX_DATE) ? MAX_DATE : newDate;
    });
  }

  const MemberLink = (props: any) => {
    const { route, name, desc, icon } = props;
    return <Link to={route}
      className="bg-white rounded-lg shadow-md mx-auto p-4 xl:p-10 mb-4 hover:scale-110 max-w-sm">
      <img src={icon} alt="Immagine" className="rounded-t-lg mx-auto max-w-[100px]" />
      <div className="text-center">
        <h3 className="text-gray-700 text-lg font-bold">{name}</h3>
        <p className="text-gray-500">{desc}</p>
      </div>
    </Link>
  }

  const monthsDescription = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  const monthDisplay = monthsDescription[Number(current.format("MM")) - 1] + " " + (current.year() != moment().year() ? current.year() : "");

  return <div className="relative gradient-grigio-bluastro h-full">

    <NavBar />

    <div className="grid grid-cols-1 lg:grid-cols-6">

      <div className="col-span-2 mx-auto text-center mt-10">
        <span className="text-4xl lg:text-6xl my-20 mb-10 mx-auto text-center">
          The F<span className="text-red-800">a</span>
          mi<span className="text-red-800">l</span>
          y
        </span>
        <div className="grid grid-cols-2 gap-8 p-4 lg:p-10 xl:p-14">
          {
            members.map((el, idx) => {
              return <MemberLink key={idx} route={"/member?id=" + el.id} name={el.title} desc={el.desc} icon={el.icon} />
            })
          }
        </div>
      </div>

      <div className="col-span-3 mx-autow-full">
        <div className="flex flex-row justify-center gap-10 align-middle p-10">
          <span className="btn btn-ghost my-auto font-medium text-gray-900 hover:scale-110 cursor-pointer h-auto" onClick={e => { onAddMonth(-1) }}><i className="fa-solid fa-xl fa-arrow-left"></i></span>
          <span className="font-medium text-3xl text-gray-900 text-center" style={{ width: 170 }}>{monthDisplay}</span>
          <span className="btn btn-ghost my-auto font-medium text-gray-900 hover:scale-110 cursor-pointer h-auto" onClick={e => { onAddMonth(1) }}><i className="fa-solid fa-xl fa-arrow-right"></i></span>
        </div>
        <Events events={events} tags={tags} categories={categories} />
      </div>

      <div className="cols-1 text-center mt-32">
        <Link to="/create" className="fade-in-low btn btn-circle btn-outline self-center size-40 lg:size-44 hover:scale-90 cursor-pointer">
          <span className="text-5xl">crea</span>
        </Link>
      </div>
    </div>
  </div >
} 