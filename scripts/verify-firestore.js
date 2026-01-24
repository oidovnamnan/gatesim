
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyAwNMPl5FROejDL-ibERM757pNSjpzIIqw",
    authDomain: "gatesim.firebaseapp.com",
    projectId: "gatesim",
    storageBucket: "gatesim.firebasestorage.app",
    messagingSenderId: "1029954251264",
    appId: "1:1029954251264:web:fc37c06dedd01d6c1546e5"
};

const targetSku = "9896c04f-b10c-46d2-8700-a609b5d42848";

async function verifyFirestore() {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        console.log(`Checking SKU: ${targetSku} in Firestore...`);
        const docRef = doc(db, "products", targetSku);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            console.log("DATA IN FIRESTORE:");
            console.log(JSON.stringify(snapshot.data(), null, 2));
        } else {
            console.log("Document NOT FOUND in Firestore.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

verifyFirestore();
