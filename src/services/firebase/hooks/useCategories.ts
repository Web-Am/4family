
import { useEffect, useState } from "react";
import { getCategories } from "../api";

export const useCategories = (houseId: string) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await getCategories(houseId);
            // getCategories returns an object map or null; convert to array
            const list = data ? Object.values(data) : [];
            setCategories(list as any[]);
            setLoading(false);
        };

        if (houseId) load();
        else {
            setCategories([]);
            setLoading(false);
        }
    }, [houseId]);

    return { categories, loading };
};
