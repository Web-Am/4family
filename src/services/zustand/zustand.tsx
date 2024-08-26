import { create } from "zustand";
import { AccountModel } from "../api/firebase/useFirebase";

type IStateStore = {
    currentFamily: string | null;
    account: AccountModel;
    setAccount: (account: AccountModel) => void
};

export const useStateStore = create<IStateStore>((set) => ({
    currentFamily: null,
    account: null,
    setAccount: (newAccount) => set((state) => ({ account: newAccount, currentFamily: newAccount ? newAccount.system : "" }))
}))
