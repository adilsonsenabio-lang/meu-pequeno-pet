# Meu Pequeno Pet — versão para GitHub Pages e PWA

Projeto do jogo infantil, migrado da V84.22 para a estrutura GitHub V84.24.

## Executar no computador

`npm run dev` e abra `http://localhost:4173`.

O GitHub Pages publica automaticamente o conteúdo de `web/` após os commits na branch `main`. A publicação só funciona depois de criar o repositório e ativar **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## O que muda

- Um só link e atualizações via GitHub Pages.
- O PWA pode ser instalado na tela inicial e guarda os arquivos necessários para jogar offline após o cache inicial se completar; atualizações reutilizam as imagens cujo conteúdo não mudou.
- Cada cenário tem GIF, PNG e miniatura próprios em `web/assets/scenes/`, sem 21 MB embutidos no HTML.
- Os sprites originais, scripts e testes ficam no projeto para edições futuras.
- Fantasma do Halloween usa ciclo de 15 segundos, configurado na V84.22.
- Dados de save continuam no navegador (localStorage). Não limpe os dados do site; não há migração automática dos saves do HTML `file://` anterior. Faça backup dentro do jogo antes de trocar.
- A versão offline em HTML único não é gerada automaticamente a cada mudança.

## Fluxo de atualização

1. Modificar os arquivos do repositório.
2. Rodar `python3 scripts/update_sw.py`, depois `python3 scripts/verify_pages.py` e `npm run test:pwa` (o GitHub Actions regenera o cache também automaticamente).
3. Fazer commit e push na branch `main`.
4. O GitHub Actions publica no mesmo link; o PWA atualiza seu cache quando recebe nova versão.

Não há necessidade de entregar novos ZIPs para cada edição. Veja `Agents.md` e `PUBLICAR_NO_GITHUB.md`.

## V84.24 — correções concluídas

- Relógio da cozinha movido para a parede central e balcão restaurado a partir da arte original.
- Todos os cenários preenchem a altura útil do quadro, sem faixa vazia superior; miniaturas e pet mantidos em camadas independentes.
- Arquivos finais **já corrigidos** no ZIP: não é necessário rodar scripts de remendo ao importar.
- Veja **IMPORTAR_NO_GITHUB.md** para importar na conta `adilsonsenabio-lang` sem apagar o repositório existente.
