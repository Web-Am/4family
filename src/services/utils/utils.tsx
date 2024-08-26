export const makeid = (length: number) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

export const getLocalStorageValue = (key: string) => {
    let f = localStorage.getItem(key);
    return f ? f.toString() : "";
}
export const getSessionStorageValue = (key: string) => {
    let f = sessionStorage.getItem(key);
    return f ? f.toString() : "";
}

export const isEmailFormattedCorrectly = (email: string) => {
    let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return regexp.test(email)
}

export const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

export const focusElement = (id: string) => {
    document.getElementById(id)?.focus();
}

export const scrollToElement = (id: string) => {
    setTimeout(() => {
        var element = document.getElementById(id);
        element?.scrollIntoView({ behavior: "smooth" });
    }, 150)
}

export const addClass = (elementID: string, classToAdd: string) => {
    document.getElementById(elementID)?.classList.add(classToAdd);
}

export const removeClass = (elementID: string, classToAdd: string) => {
    document.getElementById(elementID)?.classList.remove(classToAdd);
}

export function findLastWithMaxId<T>(array: T[], idProp: keyof T): T | undefined {
    if (array.length === 0) {
        return undefined;
    }

    let maxId = array[0][idProp];
    let lastMaxElement = array[0];

    for (const element of array) {
        const id = element[idProp];
        if (id > maxId) {
            maxId = id;
            lastMaxElement = element;
        }
    }

    return lastMaxElement;
}