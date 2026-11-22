# Agents.md — Meu Pequeno Pet

## Propósito
Jogo de bichinho virtual infantil em pixel art, pensado para criança pequena, com interação por ícones, vários cenários, animações, cuidados e salvamento local.

## Base e estrutura
- Versão-base da migração: V84.23 (continuação da V84.22).
- O aplicativo PWA será publicado da pasta `web/` pelo GitHub Pages.
- Usar caminhos relativos compatíveis com `/meu-pequeno-pet/`.
- Em atualizações normais, modificar os arquivos necessários e enviar commits: não gerar novos HTMLs offline nem ZIPs por padrão.
- Preservar código-fonte, spritesheets editáveis, artes aprovadas, caches e documentos de testes.

## Regressões a evitar
- Preservar os cenários, o pet, sua evolução, as necessidades, a criação e os controles mobile.
- Boca: não aplicar filtro de cor às peças de boca.
- Jardim: árvore estreita, tronco parado e folhas animadas; flores e borboletas na escala aprovada.
- Entardecer: sem moinho, apenas os pássaros corrigidos e luminária no tamanho original.
- Noite: coruja maior; luminária transparente com animação sutil na ponta e iluminação contínua, sem saltos.
- Floresta: tronco aprovado imóvel, formiga andando por cima e espelhada na volta; conservar o esquilo.
- Halloween: ajustar os períodos de aparição/desaparição do fantasma conforme o requisito da versão-base (15 segundos).
- Não substituir, recriar ou mudar artes já aprovadas sem pedido explícito.

## Correções V84.24 (aguardando importação inicial dos assets)
- Cozinha: usar o relógio `kitchen__clock` na parede central (x=131, y=48 no cenário 320×320), jamais sobre a bancada direita. Restaurar bancada a partir de `assets-src/v63/cenarios/kitchen_fundo.png` antes de redesenhar o relógio.
- Visualização: `#scene-art .v64-scene-stage` e `#create-scene-art .v64-scene-stage` ocupam toda a altura/largura interna, sem faixa extra no Quarto/Cozinha. A imagem do cenário usa nearest-neighbor; pet fica em camada própria.
- Aplicar `python3 scripts/ajustar_v84_24.py` uma vez após importar a base V84.23; reconstruir cache com `python3 scripts/update_sw.py`. Não apagar saves.
- A implementação dos gráficos está preparada localmente; o repositório ainda não inclui os 13 cenários completos enquanto não ocorrer a importação inicial.

## Qualidade e publicação
1. Inspecionar a versão real antes de modificar.
2. Realizar uma alteração focal, guardar reversibilidade e verificar o que mudou.
3. Testar largura de 320, 390 e 430 px quando houver alteração visual.
4. Testar carregamento, navegação Casa/Jardim, personalização, alimentação, sono, efeitos dos cenários e persistência sempre que afetados.
5. Validar imagens, dimensões, GIFs e spritesheets; reportar apenas testes executados.
6. O site está em `web/`; usar `scripts/update_sw.py` e `scripts/verify_pages.py` para preparar e validar assets.
7. Atualizar `Agents.md`, README ou relatório quando mudar estrutura do projeto.
8. O GitHub Pages publicará depois que os arquivos completos forem enviados e o Actions estiver habilitado.

## Economia de espaço
- Não versionar backups históricos, logs enormes, ZIPs antigos ou HTMLs offline duplicados.
- Imagens em arquivos separados sob `web/assets/`, não embutidas todas em base64 no HTML.
- Cache incremental no PWA para atualizar apenas arquivos modificados.
- Confirmar que dados salvos do HTML antigo não migram automaticamente entre origens; orientar exportação/importação.

## Segurança
- Não enviar senhas, tokens de acesso ou dados pessoais ao repositório público.
- Não publicar novas artes quando o usuário pedir uma prévia para aprovação.
