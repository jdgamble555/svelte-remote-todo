import { PUBLIC_FIREBASE_CONFIG } from "$env/static/public";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

const firebase_config = JSON.parse(PUBLIC_FIREBASE_CONFIG);

const app = getApps().length
    ? getApp()
    : initializeApp(firebase_config);

export const db = getFirestore(app, 'todo');