import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../web');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.json':'application/json','.webmanifest':'application/manifest+json'};
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const target=path.resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!target.startsWith(root+path.sep)){res.writeHead(403).end('Acesso negado');return;}
  try{const file=await stat(target);if(!file.isFile())throw new Error('Diretorio nao permitido');const data=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'}).end(data);}catch{res.writeHead(404).end('Arquivo nao encontrado');}
}).listen(port,'127.0.0.1',()=>console.log(`Meu Pequeno Pet V56: http://127.0.0.1:${port}`));
