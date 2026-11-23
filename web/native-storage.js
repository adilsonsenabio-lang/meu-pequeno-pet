// Espelho persistente do salvamento para o aplicativo Capacitor.
// No navegador comum, estas funções são no-op e o localStorage continua válido.
const preferences=()=>globalThis.Capacitor?.Plugins?.Preferences||null;

export function isNativeApp(){return Boolean(globalThis.Capacitor?.isNativePlatform?.());}

export async function hydrateNativeStorage(storage=localStorage,keys=[]){
  const plugin=preferences();
  if(!plugin)return {native:false,migrated:0,restored:0};
  let migrated=0,restored=0;
  for(const key of keys){
    try{
      const local=storage.getItem(key);
      const {value:native}=await plugin.get({key});
      if(local!==null){
        if(local!==native){await plugin.set({key,value:local});migrated++;}
      }else if(native!==null&&native!==undefined){storage.setItem(key,native);restored++;}
    }catch{}
  }
  return {native:true,migrated,restored};
}

export function mirrorNativeValue(key,value){
  const plugin=preferences();
  if(!plugin)return Promise.resolve(false);
  return plugin.set({key,value:String(value)}).then(()=>true,()=>false);
}

export function removeNativeValue(key){
  const plugin=preferences();
  if(!plugin)return Promise.resolve(false);
  return plugin.remove({key}).then(()=>true,()=>false);
}

export async function shareNativeBackup(text){
  const filesystem=globalThis.Capacitor?.Plugins?.Filesystem;
  const share=globalThis.Capacitor?.Plugins?.Share;
  if(!filesystem||!share)return false;
  try{
    const result=await filesystem.writeFile({path:'meu-pequeno-pet-backup.json',data:text,directory:'CACHE',encoding:'utf8',recursive:true});
    await share.share({title:'Backup do Meu Pequeno Pet',text:'Guarde este arquivo para restaurar o pet.',url:result.uri,dialogTitle:'Salvar ou compartilhar backup'});
    return true;
  }catch{return false;}
}
