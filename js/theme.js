/* Control del modo claro/oscuro.
   La app siempre inicia en modo claro salvo que el usuario haya
   activado el modo oscuro antes (se recuerda en este dispositivo). */
(function(){
  var KEY = "turismoAcobamba_theme";

  function get(){
    try{
      var saved = localStorage.getItem(KEY);
      return saved === "dark" ? "dark" : "light";
    }catch(e){ return "light"; }
  }

  function apply(theme){
    var dark = theme === "dark";
    document.documentElement.classList.toggle("dark-mode", dark);
    document.documentElement.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute("content", dark ? "#0e1b24" : "#aee9ff");
    var btns = document.querySelectorAll("[data-theme-toggle]");
    for(var i=0;i<btns.length;i++){
      btns[i].textContent = dark ? "☀️ Modo claro" : "🌙 Modo oscuro";
      btns[i].setAttribute("aria-pressed", dark ? "true" : "false");
    }
  }

  function set(theme){
    try{ localStorage.setItem(KEY, theme === "dark" ? "dark" : "light"); }catch(e){}
    apply(theme);
  }

  function toggle(){
    set(get() === "dark" ? "light" : "dark");
  }

  // Se aplica de inmediato (este script no es "defer"/"module", así que
  // corre antes del primer pintado y evita el parpadeo entre temas).
  apply(get());

  document.addEventListener("DOMContentLoaded", function(){
    apply(get());
    var btns = document.querySelectorAll("[data-theme-toggle]");
    for(var i=0;i<btns.length;i++){
      btns[i].addEventListener("click", toggle);
    }
  });

  window.TurismoTheme = { get: get, set: set, toggle: toggle };
})();
