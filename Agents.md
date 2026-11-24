# Agents.md — Meu Pequeno Pet no GitHub (V84.24)

## Objetivo
Jogo de bichinho virtual em português para criança de 4 anos, acessível mesmo sem saber ler. Priorizar botões com ícones, feedback visual, animações suaves, baixa exigência de hardware, cuidado e evolução do pet.

## Publicação
- Fonte principal: `web/` (app HTML/CSS/JS e assets referenciados por URL relativa).
- GitHub Actions em `.github/workflows/pages.yml` publica `web/` no GitHub Pages ao fazer push em `main`.
- PWA usa `web/sw.js` e `web/manifest.webmanifest`, mantendo o mesmo domínio/scope em todas as versões.
- Ao editar JS/CSS/imagens, rodar `python3 scripts/update_sw.py` para gerar hashes dos arquivos; a Action faz isso automaticamente. O cache PWA é incremental: imagens não alteradas são reaproveitadas. Atualizar sem limpar `localStorage`.
- **Não gerar HTML offline completo ou ZIP a cada mudança.** Alterar arquivos e versionar via commits. ZIP só em backup solicitado; todo ZIP deve conter `Agents.md`.
- As mídias dos 13 cenários foram extraídas do JSON de base64 e estão em `web/assets/scenes/<scene>-<gif|still|preview>.<ext>`. `web/index.html` contém apenas os caminhos relativos.
- `scripts/verify_pages.py` confirma existência de todas as cenas e cache; `npm run test:pwa` testa o cache incremental; `npm run dev` roda servidor local.
- Fontes de sprites aprovadas permanecem em `assets-src/v63/` e `assets-src/v84_remakes/`. Não rodar scripts históricos que voltem a incorporar cenas em base64 sem adaptar a este padrão.

## Regras visuais e mecânicas já aprovadas
- Jardim: flores e borboletas ampliadas, árvore estreita e movimento somente nas folhas.
- Entardecer: sem moinho; dois pássaros com asas animadas; luminária com base correta, ponta animada e luz constante.
- Noite: coruja maior; luminária sem fundo branco, no tamanho correto restaurado na V84.19.
- Floresta: manter cenário ilustrado aprovado, tronco estático e formiga que espelha no retorno.
- Halloween: ciclo de surgimento/desaparecimento do fantasma de **15 segundos**.
- V84.24 Cozinha: relógio original movido para a parede entre a geladeira e o armário (posição x=131, y=48, considerando a imagem inteira 320×320); balcão da direita restaurado.
- V84.24 Telas: o palco dos cenários deve ocupar toda a área interna da moldura, sem a faixa superior colorida; manter miniaturas e pet em dimensões próprias.
- Boca: sem seletor/filtro de cor; manter ajustes de tamanho/altura.
- Preservar as 13 cenas, casa, jardim, ambientes, evolução, alimentação, sono, cuidados, animais e persistência dos saves.
- Não substituir os gráficos por arte genérica ou recriar cenários quando o usuário pede apenas um ajuste pontual.

## Testes e alertas
- Rodar `python3 scripts/update_sw.py`, `python3 scripts/verify_pages.py`, `npm run test:pwa` e testes de navegador em 320/390/430 px, online/offline quando disponíveis.
- `scripts/ajustar_v84_24.py` documenta/reproduz a correção gráfica da V84.24. A versão deste ZIP já tem os arquivos finais corrigidos: **não é necessário executar esse script para publicar**.
- A suíte histórica `npm test` da V84.22 ainda tinha 28 falhas antigas de expectativas obsoletas; não declarar regressão aprovada sem analisar a baseline.
- Não anunciar URL público antes de existir repositório e deploy confirmado.
- Saves de `file://` para GitHub Pages **não migram automaticamente**; orientar exportação/importação no jogo antigo.
- O GitHub Pages implica hospedagem do código do jogo em um repositório público, se a opção Public for usada.

## Regras permanentes V84.26 — cenas e escala do pet
- Todos os 13 cenários, inclusive Cozinha e Quarto, possuem 320×320 pixels. A moldura de criação e a moldura de jogo são quadradas, mostrando toda a imagem sem faixas.
- Não usar `object-fit:cover`, `object-fit:fill`, recorte lateral nem escala diferente nos eixos X e Y. Usar `contain` e `aspect-ratio:1/1`.
- `web/v84-26-layout.css` define exclusivamente as dimensões da moldura e o tamanho responsivo dos pets; é carregado por último.
- As alturas conflitantes foram retiradas de `game.css`, `retro.css`, `life.css`, `v55-mobile.css`, `v58-ajustes.css` e `v70-criacao-compacta.css`. Não restaurar essas declarações.
- Pet no jogo tem largura de 42,3% da área interna, proporção 168×190 e base a 8%. Na criação, fica centralizado com largura de 54,9%, proporção 222×236 e base a 7%.
- `scene-v64.css` conserva a escala e os marcadores no palco 1:1; retirados o zoom V84.25 e os dois backfills bitmap deformados dos cômodos.
- Miniaturas, coruja, flores, formiga, pássaros, luminárias e efeitos continuam usando coordenadas relativas ao cenário; saves e mecânicas permanecem intactos.
- Validar visualmente os 13 cenários em criação e jogo em 320, 390 e 430 px, incluindo alturas menores e a posição correta do relógio na Cozinha.

## V84.27 — trenó natalino e sombra
- Na criação do pet, o trenó natalino percorre a cena a cada 18 segundos, nos dois sentidos, com retorno espelhado e início perceptível logo após selecionar Natal.
- No jogo, conservar o ciclo original de 60 segundos do trenó.
- No modo de movimento reduzido, exibir o trenó parado; não deixá-lo invisível.
- A sombra do pet na criação fica imediatamente sob os pés, referenciada à posição real do pet (bottom 7%) e não à antiga variável `--pet-floor:12%`.
- A sombra da criação é ajustada no arquivo `web/v84-26-layout.css`, sem alterar spritesheets, animações, mecânicas ou saves.

## V84.28 — correção da atualização no navegador do computador
- Diagnóstico: o service worker antigo armazenava CSS por caminho e ignorava o parâmetro de versão da URL; um CSS antigo podia continuar visível depois do deploy.
- A correção do trenó e da sombra da criação está em arquivo NOVO: `web/v84-28-fix.css`, inserido no fim do HTML, para funcionar até com o worker antigo.
- O trenó natalino cruza o cenário na criação em dois sentidos a cada 18 s. A animação de Natal do jogo continua em 60 s. Em movimento reduzido fica parado e visível.
- A sombra da criação usa base do pet 7% + 2 px, encostada visualmente aos pés, sem modificar sprite nem mecânicas.
- `scripts/update_sw.py` e `web/sw.js`: HTML, CSS e JavaScript usam rede primeiro quando conectados, com fallback no cache offline; imagens, GIFs e sprites mantêm o cache incremental.
- `web/pwa.js` solicita verificação de atualização sem recarregar à força e sem apagar dados salvos. Não voltar ao cache-first para CSS e JavaScript.
- Cada atualização que precisar vencer o worker legado pode usar arquivo CSS com nome novo; não confiar somente em query `?v=...` para CSS que o worker antigo já conhece.

## V84.29 — luminárias realmente transparentes e animais
- Fontes das luminárias aprovadas ficam em `web/assets/v8429/{night,sunset}_approved_base.png`: PNGs RGBA 48×48 sem fundo branco. Na publicação, `scripts/generate_v8429.py` cria spritesheets de 8 quadros, GIFs transparentes e PNGs isolados.
- A luminária antiga estava embutida em cada GIF dos cenários: durante o build, substitua apenas as regiões antigas pelos trechos de `assets-src/v63/cenarios/{night,sunset}_fundo.png`. As luminárias novas são overlays no `scene-v63-player.js` com halo persistente, sem renderizar a antiga por trás.
- O poste é fixo, apenas o pendente oscila na animação; os quadros possuem transparência RGBA e ancoragem consistente.
- Na Noite, a coruja mantém os 40 quadros do percurso e, ao retornar, deve ser espelhada horizontalmente (nunca voar de ré).
- No Deserto, aplicar sombra sutil sob o calango que acompanha sua posição. Na Floresta, a sombra do esquilo acompanha o animal. Preservar tronco, formiga e demais animações.
- A sombra do pet é ajustada no `web/v8429-fixes.css`; deve ficar junto aos pés e acompanhar a posição do pet na caminhada.
- É obrigatório rodar o gerador **antes** de `scripts/update_sw.py` e `scripts/verify_pages.py`, para que Pages, PWA e miniaturas recebam os mesmos recursos.
- Nunca inserir novamente luminárias com fundo branco nem imagens achatadas sobre o fundo; testar 320/390/430 e versões offline, preservando saves.
