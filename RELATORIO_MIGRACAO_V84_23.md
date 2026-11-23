# Migração Meu Pequeno Pet para GitHub Pages/PWA — V84.23

## Fonte
V84.22 (fantasma de Halloween em 15 segundos, mecânicas e cenas da V84.21 preservadas).

## O que foi preparado
- Projeto com `web/`, sprites aprovados, testes, instruções e `Agents.md`.
- 13 cenários extraídos do HTML para arquivos de mídia independentes (`web/assets/scenes/`), 39 arquivos de mídia no total.
- `web/index.html` passou de aproximadamente 21,4 MB para 190 KB, reduzindo a duplicação entre cenas e base64.
- PWA com manifesto de URL estável, service worker que armazena a primeira instalação e reutiliza arquivos que não mudaram em lançamentos posteriores.
- Workflow de GitHub Actions para publicar no GitHub Pages a cada push na branch `main`.
- Auditoria já realizada na V84.22 manteve o fantasma em 15 segundos e removeu HTMLs antigos dos pacotes.

## Limites e alertas
- **Ainda não foi publicado:** a conta GitHub conectada não tinha repositórios acessíveis para receber o projeto.
- É necessário criar o repositório e ativar Pages. A importação inicial do projeto é feita uma única vez; depois, o jogo é atualizado pelo mesmo link.
- Saves do HTML `file://` do celular não são transferidos automaticamente para o novo domínio. Fazer backup dentro do jogo anterior e importar no novo.
- Com repositório público, o código-fonte e as artes ficam públicos.

## Testes feitos
- `python3 scripts/verify_pages.py`: PASSOU (13 cenas, caminhos, cache, fantasma 15s).
- `npm run test:pwa`: PASSOU em simulação de cache incremental, inclusive navegação offline e reuso dos arquivos inalterados.
- Chromium com conteúdo de teste autocontido: PASSOU (Jardim, Entardecer, Noite, Floresta, Halloween sem erros JavaScript).
- O teste real do service worker hospedado não pôde ser executado neste ambiente, pois o navegador de automação bloqueou navegação para HTTP/HTTPS, inclusive localhost. É necessário validar após publicação.
- A suíte histórica do projeto de origem tinha 28 falhas já existentes na V84.22; não foi declarada totalmente aprovada.
