const DB_NAME = 'offline-queue-db';
const DB_VERSION = 1;
const STORE_NAME = 'requests';

export const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => reject(event.target.error);

        request.onsuccess = (event) => resolve(event.target.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

export const addRequestToDB = async (request) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const query = store.put(request);

        query.onsuccess = () => resolve(request);
        query.onerror = () => reject(query.error);
        transaction.oncomplete = () => db.close();
    });
};

export const getAllRequestsFromDB = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const query = store.getAll();

        query.onsuccess = () => resolve(query.result);
        query.onerror = () => reject(query.error);
        transaction.oncomplete = () => db.close();
    });
};

export const updateRequestInDB = async (request) => {
    // Same as add (put overwrites if key exists)
    return addRequestToDB(request);
};

export const deleteRequestFromDB = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const query = store.delete(id);

        query.onsuccess = () => resolve();
        query.onerror = () => reject(query.error);
        transaction.oncomplete = () => db.close();
    });
};

export const clearQueueDB = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const query = store.clear();

        query.onsuccess = () => resolve();
        query.onerror = () => reject(query.error);
        transaction.oncomplete = () => db.close();
    });
};
