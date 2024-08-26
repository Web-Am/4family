import { collection, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import moment from "moment";
import { app } from "./useFirebase";

import { getDatabase, ref, onValue, push, remove, set, update } from 'firebase/database';


//
// https://firebase.google.com/docs/database/web/read-and-write
//

export const getElements = (path: string) => {
    return new Promise<any>((resolve, reject) => {
        try {
            onValue(ref(getDatabase(), path), (snapshot) => {
                const jsonData = snapshot.val();
                if (jsonData == null) {
                    resolve([]);
                    return;
                }
                const array: any[] = Object.keys(jsonData).map((key) => {
                    return {
                        reference: key, // Use the key as the ID property
                        ...jsonData[key], // Spread the remaining properties from the object
                    };
                });
                console.log(path);
                console.log(array);
                resolve(array);
            }, (ex) => {
                console.error('Error retrieving data:', ex);
                reject(ex);
            });
        }
        catch (ex) {
            console.error(ex);
            reject(ex);
        }
    });
};

export const getElement = (path: string) => {
    return new Promise<any>((resolve, reject) => {
        try {
            onValue(ref(getDatabase(), path), (snapshot) => {
                const jsonData = snapshot.val();
                if (jsonData == null) {
                    resolve([]);
                    return;
                }
                console.log(path);
                console.log(jsonData);
                resolve(jsonData);
            }, (ex) => {
                console.error('Error retrieving data:', ex);
                reject(ex);
            });
        }
        catch (ex) {
            console.error(ex);
            reject(ex);
        }
    });
};

export const pushElement = (path: string, object: any) => {
    return new Promise<void>((resolve, reject) => {
        try {
            const objectRef = ref(getDatabase(), path);
            push(objectRef, object);
            resolve();
        }
        catch (ex) {
            console.error('Error pushing data:', ex);
            reject(ex);
        }
    });
};

export const updateElement = (path: string, object: any) => {
    return new Promise<void>((resolve, reject) => {
        try {
            const objectRef = ref(getDatabase(), path);
            update(objectRef, object);
            resolve();
        }
        catch (ex) {
            console.error('Error pushing data:', ex);
            reject(ex);
        }
    });
};

export const pushValue = (path: string, value: any) => {
    return new Promise<void>((resolve, reject) => {
        try {
            const objectRef = ref(getDatabase(), path);
            set(objectRef, value);
            resolve();
            resolve();
        }
        catch (ex) {
            console.error('Error pushing data:', ex);
            reject(ex);
        }
    });
};
export const deleteElement = (path: string) => {
    return new Promise<void>((resolve, reject) => {
        try {
            const objectRef = ref(getDatabase(), path);
            remove(objectRef);
            resolve();
        }
        catch (ex) {
            console.error('Error pushing data:', ex);
            reject(ex);
        }
    });
};



//
//
//

//
// CATEGORY
//
export const getCategories = (family: string) => {
    return new Promise<any>((resolve, reject) => {
        getElements(family + "/CATEGORIES")
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};
export const addCategory = (object: any, family: string) => {
    return new Promise<any>((resolve, reject) => {
        pushElement(family + "/CATEGORIES", object)
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};
export const updateCategory = (object: any, family: string) => {
    return new Promise<any>((resolve, reject) => {
        updateElement(family + "/CATEGORIES/" + object.reference, object)
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};
export const deleteCategory = (object: any, family: string) => {
    return new Promise<any>((resolve, reject) => {
        deleteElement(family + "/CATEGORIES/" + object.reference + "/")
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};

//
// TAGS
//
export const getTags = (family: string) => {
    return new Promise<any>((resolve, reject) => {
        getElements(family + "/TAG")
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};
export const addTag = (object: any, family: string) => {
    return new Promise<any>((resolve, reject) => {
        pushElement(family + "/TAG", object)
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};
export const updateTag = (object: any, family: string) => {
    return new Promise<any>((resolve, reject) => {
        updateElement(family + "/TAG/" + object.reference, object)
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};
export const deleteTag = (object: any, family: string) => {
    return new Promise<any>((resolve, reject) => {
        deleteElement(family + "/TAG/" + object.reference + "/")
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};

//
// MEMBER
//
export const getMembers = (family: string) => {
    return new Promise<any>((resolve, reject) => {
        getElements(family + "/MEMBERS")
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};
export const addMember = (object: any, family: string) => {
    return new Promise<any>((resolve, reject) => {
        pushElement(family + "/MEMBERS", object)
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};
export const updateMember = (object: any, family: string) => {
    return new Promise<any>((resolve, reject) => {
        updateElement(family + "/MEMBERS/" + object.reference, object)
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};
export const deleteMember = (object: any, family: string) => {
    return new Promise<any>((resolve, reject) => {
        deleteElement(family + "/MEMBERS/" + object.reference + "/")
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};


//
// systems info
//
export const getFamilyMember = (email: string) => {
    return new Promise<any>((resolve, reject) => {
        getElement("SYSTEMS/MEMBERS/" + email.replaceAll(".", "-"))
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};

export const addFamilyMember = (email: string, family: string) => {
    return new Promise<any>((resolve, reject) => {
        pushValue("SYSTEMS/MEMBERS/" + email.replaceAll(".", "-"), family)
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};


//
// EVENT
//

export const getEvents = (year: string, month: string) => {
    return new Promise<any>((resolve, reject) => {
        month = (month.toString().length == 1 ? "0" + month : month)
        getElements("BEXPO/EVENTS/" + year + "/" + month)
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};

export const addEvent = (object: any) => {
    return new Promise<any>((resolve, reject) => {
        pushElement("BEXPO/EVENTS/" + moment(object.at, "DDMMYYYY").format("YYYY") + "/" + moment(object.at, "DDMMYYYY").format("MM"), object)
            .then((list) => { resolve(list); })
            .catch((ex) => { reject(ex); })
    });
};

/*

    INFO

        getMasterPosts()

        updatePost("riese", "it/desc", "bella descrizione")
        
        getPost("riese").then((doc) => console.log("riese", doc));
                  
        addPost({ uid: "riese", it: { title: "Napoli" } });
*/
export const MASTER_POSTS = "posts-master";
export const DETAIL_POSTS = "posts-detail";

// get entire list of posts-master with classic data
// getMasterPosts
export const getMasterPosts = async () => {
    return new Promise<any>(async (resolve, reject) => {
        const db = getFirestore(app);
        const entitiesCol = collection(db, MASTER_POSTS);
        const entitiesSnapshot = await getDocs(entitiesCol);
        const entities = entitiesSnapshot.docs.map(doc => doc.data());
        const dt = entities.sort((a: any, b: any) => { return moment(a.date).diff(moment(b.date)) })
        resolve(dt);

    });
}

// get entity of posts-master with classic data
// getMasterPosts ("napoli")
export const getMasterPost = async (uid: string) => {
    return new Promise<any>(async (resolve, reject) => {
        const db = getFirestore(app);
        const docRef = doc(db, MASTER_POSTS, uid);
        const docSnap = await getDoc(docRef);
        const entity = docSnap.data();
        resolve(entity);
    });
}

// set entity of posts-master with classic data
// addMasterPost({ uid: "napoli", it: { title: "Napoli" } });
export const addMasterPost = async (obj: any) => {
    return new Promise<void>(async (resolve, reject) => {
        const db = getFirestore(app);
        const res = await setDoc(doc(db, MASTER_POSTS, obj.uid), obj);
        resolve();
    });
}

// update a determinate path of entity
// updatePost("napoli", "it/desc", "bella descrizione")
export const updateMasterPost = async (uid: string, path: string, value: any) => {
    return new Promise<void>(async (resolve, reject) => {
        const db = getFirestore(app);
        const docRef = doc(db, MASTER_POSTS, uid);
        await updateDoc(docRef, { [path.replace("/", ".")]: value });
        resolve();
    });
}

// update a determinate path of entity
// getDetailPost("napoli")
export const getDetailPost = async (uid: string) => {
    return new Promise<any>(async (resolve, reject) => {
        try {
            const db = getFirestore(app);
            const docRef = doc(db, DETAIL_POSTS, uid);
            const entitySnap = await getDoc(docRef);
            const entity = entitySnap ? entitySnap.data() : null;
            resolve(entity);
        }
        catch (ex: any) {
            resolve({ components: [] });
        }
    });
}

// update a determinate path of entity
// addDetailPost({ uid: "napoli", it: { title: "Napoli" } });
export const addDetailPost = async (obj: any) => {
    return new Promise<void>(async (resolve, reject) => {
        const db = getFirestore(app);
        await setDoc(doc(db, DETAIL_POSTS, obj.uid), obj);
        resolve();
    });
}


export const iniPosts = async () => {


    // 1
    addMasterPost({
        uid: "napoli",
        date: "22/10/2021",
        preview: "https://images.pexels.com/photos/2440021/pexels-photo-2440021.jpeg?auto=compress&cs=tinysrgb&w=1600",

        it:
        {
            title: "napoli",
            desc: "Bell   "
        },
        en:
        {
            title: "napoli",
            desc: "Nice view"
        },
    });
    addDetailPost({
        uid: "napoli",
        date: "22/10/2021",
        preview: "https://images.pexels.com/photos/2440021/pexels-photo-2440021.jpeg?auto=compress&cs=tinysrgb&w=1600",
        it:
        {
            title: "napoli",
            desc: "Bell   "
        },
        en:
        {
            title: "napoli",
            desc: "Nice view"
        },
    });


    // 2
    addMasterPost({
        uid: "innbruck",
        date: "22/10/2022",
        preview: "https://images.pexels.com/photos/2440021/pexels-photo-2440021.jpeg?auto=compress&cs=tinysrgb&w=1600",
        it:
        {
            title: "innbruck",
            desc: "Bell innbruck  "
        },
        en:
        {
            title: "innbruck",
            desc: "Nice view innbruck"
        },
    });

    addDetailPost({
        uid: "innbruck",
        date: "22/10/2022",
        preview: "https://images.pexels.com/photos/2440021/pexels-photo-2440021.jpeg?auto=compress&cs=tinysrgb&w=1600",
        it:
        {
            title: "innbruck",
            desc: "Bell innbruck  "
        },
        en:
        {
            title: "innbruck",
            desc: "Nice view innbruck"
        },
    });
}