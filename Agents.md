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

## Regras permanentes V84.25 — enquadramento de cenário
- Os 13 fundos são imagens 320×320, sempre com escala uniforme, nunca com largura/altura independentes ou `object-fit:fill`.
- O recorte para molduras retangulares é feito pelo contêiner; `scene-v64.css` usa um palco interno quadrado dimensionado pelo maior eixo (cqw/cqh) e centralizado.
- GIF, animais, luminárias, fantasmas, cometas e marcadores de toque devem permanecer dentro do mesmo palco para não sofrer desencontro.
- A camada do pet permanece independente, sem alterar suas proporções.
- Miniaturas do seletor devem manter proporção quadrada.
- Após alterar o enquadramento, testar Jardim, Noite, Entardecer, Floresta, Cozinha, Quarto e restantes em 320, 390 e 430 px, mantendo o relógio correto da Cozinha.
- A V84.25 modifica somente CSS, referência de cache e teste. Não muda sprites, comportamento ou saves.

- Em celulares de até 520px, limite a altura da moldura com `#world.world {max-height:calc(100vw - 4px);}` para que o recorte proporcional não esconda a lua, a coruja e os móveis laterais. Preserve o pet em camada independente.
