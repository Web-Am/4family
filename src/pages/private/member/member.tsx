import { useEffect, useState } from "react"
import { NavBar } from "../../../components/navbar";
import { addCategory, addMember, deleteCategory, deleteMember, getMembers, updateCategory, updateMember } from "../../../services/api/firebase/api";
import { BasicModel } from "../home/home";
import { useStateStore } from "../../../services/zustand/zustand";
import { findLastWithMaxId } from "../../../services/utils/utils";
import useEffectOnce from "../../../services/hooks/useEffectOnce";

export function MemberInfo() {


  return (
    <div className="min-h-screen bg-gray-100">

      <NavBar />

      <div className="container mx-auto py-8 px-6 md:px-0">

        INFO MEMBRO DELLA FAMIGLIA

      </div >
    </div >
  );
}