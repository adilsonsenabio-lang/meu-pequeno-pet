export async function registerOfflineWorker(
  navigatorLike=globalThis.navigator,
  locationLike=globalThis.location
){
  const serviceWorker=navigatorLike?.serviceWorker;
  const protocol=locationLike?.protocol||'';
  if(!protocol.startsWith('http')||typeof serviceWorker?.register!=='function')return false;
  try{
    const registration=await serviceWorker.register('./sw.js',{updateViaCache:'none'});
    // Detecta uma versão nova imediatamente, inclusive ao reabrir o PWA.
    // Não recarrega automaticamente enquanto a criança está criando o pet.
    if(typeof registration?.update==='function'){
      void registration.update().catch(()=>{});
    }
    return true;
  }catch(error){
    console.warn('Modo offline indisponível neste navegador:',error);
    return false;
  }
}
