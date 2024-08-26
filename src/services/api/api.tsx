import axios from "axios";
import { BACKEND } from "../../contants/contants";

export const PROFILES = ["A", "B", "C", "D", "E", "F", "G", "H", "K", "L", "M", "N", "P", "R", "S", "T", "MORE"];

export const Set = async (list: any) => {
    const payload = await axios.post(BACKEND + "api/agencies", list)
    return payload.status == 200;
}
export const Get = async () => {
    const payload = await axios.get(BACKEND + "api/agencies")
    return JSON.parse(payload.data);
}