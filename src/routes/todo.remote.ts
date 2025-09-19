import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { form, query } from '$app/server';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc
} from 'firebase/firestore/lite';
import { db } from '$lib/firebase';
import { FirebaseError } from 'firebase/app';

export const getTodos = query(async () => {

    const todoDocs = await getDocs(
        collection(db, 'todos')
    );

    if (todoDocs.empty) error(404, 'No todos found');

    return todoDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
});

export const getTodo = query(v.string(), async (id) => {

    const todoDoc = await getDoc(
        doc(db, 'todos', id)
    );

    if (!todoDoc.exists()) error(404, 'Not found');

    return {
        id: todoDoc.id,
        ...todoDoc.data()
    };
});

export const createTodo = form(
    v.object({
        title: v.pipe(v.string(), v.minLength(2), v.maxLength(100)),
        completed: v.optional(
            v.pipe(
                v.string(),
                v.transform((val) => {
                    const s = val.toLowerCase();
                    if (["true", "1", "on", "yes"].includes(s)) return true;
                    if (["false", "0", "off", "no"].includes(s)) return false;
                    return false;
                })
            )
        )
    }),
    async (data) => {

        const addTodo = await addDoc(
            collection(db, 'todos'),
            {
                title: data.title,
                completed: data.completed ?? false
            });

        if (!addTodo) error(500, 'Failed to create todo');

        return { success: true };
    }
);

export const updateTodo = form(
    v.object({
        id: v.string(),
        title: v.pipe(v.string(), v.minLength(2), v.maxLength(100)),
        completed: v.optional(
            v.pipe(
                v.string(), // FormData gives you only strings
                v.transform((val) => {
                    const s = val.toLowerCase();
                    if (["true", "1", "on", "yes"].includes(s)) return true;
                    if (["false", "0", "off", "no"].includes(s)) return false;
                    return false; // fallback if something unexpected comes in
                })
            )
        )
    }),
    async (data) => {

        try {
            await updateDoc(
                doc(db, 'todos', data.id),
                {
                    title: data.title,
                    completed: data.completed
                });
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.error('Firebase error code:', e.code);
                console.error('Firebase error message:', e.message);
                error(500, `Firebase error: ${e.message}`);
            }
        }

        return { success: true };
    }
);

