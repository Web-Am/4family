import { useState } from "react";

// useForm functional componen
const useForm = (callback: any, initialState = {}) => {
    const [values, setValues] = useState<any>(initialState);
    const [isBeenModidied, setIsBeenModidied] = useState<boolean>(false);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        setIsBeenModidied(true);

        let data = null;
        switch (event.target.type) {
            case "checkbox":
                data = event.target.checked;
                break;
            case "number":
                data = Number(event.target.value);
                break;
            case "file":
                data = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
                break;
            default:
                data = event.target.value;
                break;
        }

        setValues((prevState: any) => ({
            ...prevState,
            [event.target.name]: data
        }));
    };

    const onSubmit = async (event: any = null) => {
        event?.preventDefault();
        await callback();
        return false;
    };

    const onReset = (values: any) => {
        setIsBeenModidied(false);
        setValues(values);
    }

    const update = (name: string, value: any) => {
        onChange({ target: { name: name, value: value } } as any);
    }

    return {
        onChange,
        onSubmit,
        onReset,
        update,
        isBeenModidied,
        values,
    };
}

export default useForm;