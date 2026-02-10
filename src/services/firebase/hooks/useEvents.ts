import { useEffect, useState } from "react";
import { getEventsByYear } from "../api";

export const useEvents = (houseId: string, year: number) => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await getEventsByYear(houseId, year);
            // api returns array already, but guard in case
            const list = Array.isArray(data) ? data : (data ? Object.values(data) : []);
            setEvents(list as any[]);
            setLoading(false);
        };

        if (houseId) load();
        else {
            setEvents([]);
            setLoading(false);
        }
    }, [houseId, year]);

    return { events, loading };
};