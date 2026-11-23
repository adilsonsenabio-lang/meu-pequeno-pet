// V84.23: cenas em arquivos externos (web/assets/scenes). URLs relativas
// para GitHub Pages; dados antigos em base64 ainda são aceitos para compatibilidade.
const originals=JSON.parse(document.getElementById('v64-scene-media')?.textContent||'{}');
function blobUrl(dataUrl){
  if(!dataUrl?.startsWith('data:'))return dataUrl;
  try{
    const comma=dataUrl.indexOf(',');
    const contentType=dataUrl.slice(5,comma).split(';')[0]||'image/png';
    const binary=atob(dataUrl.slice(comma+1));
    const data=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)data[i]=binary.charCodeAt(i);
    return URL.createObjectURL(new Blob([data],{type:contentType}));
  }catch{return dataUrl;}
}
export const V63_SCENE_MEDIA=Object.fromEntries(Object.entries(originals).map(([name,media])=>[name,{
  gif:blobUrl(media.gif),still:blobUrl(media.still),preview:blobUrl(media.preview||media.gif)
}]));
