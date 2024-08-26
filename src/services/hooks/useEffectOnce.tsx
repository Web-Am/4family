import { useEffect } from "react"

export default function useEffectOnce(cb:any) {
    useEffect(cb, [])
}