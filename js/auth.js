import { auth, googleProvider, db } from "./firebase.js";
import { signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const button=document.getElementById("googleLogin");
const message=document.getElementById("authMessage");

button?.addEventListener("click",async()=>{
  button.disabled=true;
  message.textContent="Conectando con Google...";
  try{
    const result=await signInWithPopup(auth,googleProvider);
    const u=result.user;
    await setDoc(doc(db,"usuarios",u.uid),{
      uid:u.uid,
      nombre:u.displayName||"Explorador",
      correo:u.email||"",
      foto:u.photoURL||"",
      ultimaSesion:serverTimestamp()
    },{merge:true});
    location.href="app.html";
  }catch(error){
    console.error(error);
    message.textContent="No se pudo iniciar sesión. Revisa Authentication y los dominios autorizados.";
    button.disabled=false;
  }
});

onAuthStateChanged(auth,u=>{
  if(u && location.pathname.endsWith("login.html")){
    // No redirigir automáticamente: permite cambiar de cuenta.
  }
});

window.turismoLogout=async()=>{
  await signOut(auth);
  location.href="login.html";
};
