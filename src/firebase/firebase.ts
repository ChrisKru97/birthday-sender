import { initializeApp, auth, firestore } from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

class Firebase {
    public auth: auth.Auth;
    public firestore: firestore.Firestore;
    public provider: auth.GoogleAuthProvider;

    constructor() {
        initializeApp({
            apiKey: process.env.REACT_APP_API_KEY,
            authDomain: process.env.REACT_APP_AUTH_DOMAIN,
            databaseURL: process.env.REACT_APP_DATABASE_URL,
            projectId: process.env.REACT_APP_PROJECT_ID,
            storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
            messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
        });
        this.auth = auth();
        this.auth.setPersistence(auth.Auth.Persistence.LOCAL);
        this.firestore = firestore();
        this.provider = new auth.GoogleAuthProvider();
    }
}

export default Firebase;
