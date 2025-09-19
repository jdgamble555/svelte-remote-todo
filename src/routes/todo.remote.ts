import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { query } from '$app/server';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore/lite';
import { db } from '$lib/firebase';

export const getTodos = query(async () => {

    const todoDocs = await getDocs(
        collection(db, 'todos')
    );

    if (todoDocs.empty) error(404, 'No todos found');

    return todoDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

export const getTodo = query(v.string(), async (id) => {

    const todoDoc = await getDoc(
        doc(db, 'todos', id)
    );

    if (!todoDoc.exists()) error(404, 'Not found');

    return { id: todoDoc.id, ...todoDoc.data() };
});

