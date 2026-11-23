export async function registerOfflineWorker(
  navigatorLike=globalThis.navigator,
  locationLike=globalThis.location
){
  const serviceWorker=navigatorLike?.serviceWorker;
  const protocol=locationLike?.protocol||'';
  if(!protocol.startsWith('http')||typeof serviceWorker?.register!=='function')return false;
  try{
    await serviceWorker.register('./sw.js');
    return true;
  }catch(error){
    console.warn('Modo offline indisponível neste navegador:',error);
    return false;
  }
}
