# Como importar o ZIP V84.24 no GitHub

Este ZIP contém o **projeto inteiro já corrigido**. O relógio da cozinha e o enquadramento dos cenários estão incluídos nos arquivos finais. Não é preciso rodar scripts de ajustes.

## No computador — GitHub Desktop

1. Baixe este ZIP V84.24 e use **Extrair tudo**. Dentro da pasta extraída devem aparecer diretamente `web/`, `assets-src/`, `scripts/`, `Agents.md`, `README.md`, `.github/` e `package.json`.
2. Abra [GitHub Desktop](https://desktop.github.com/) e entre em sua conta `adilsonsenabio-lang`.
3. **File → Clone repository** → selecione `adilsonsenabio-lang/meu-pequeno-pet` → **Clone**.
4. **Repository → Show in Explorer** (Windows). Copie **todo o conteúdo da pasta extraída** para a pasta do repositório clonado. Aceite substituir os arquivos `README.md`, `Agents.md` e `.gitignore`, se solicitado. NÃO apague a pasta oculta `.git` do repositório clonado.
5. Volte ao GitHub Desktop. Em **Summary** escreva `Importar Meu Pequeno Pet V84.24 completo`, clique em **Commit to main**, depois **Push origin**.
6. No site do GitHub, abra [Settings → Pages](https://github.com/adilsonsenabio-lang/meu-pequeno-pet/settings/pages), configure **Source: GitHub Actions**, se ainda não estiver.
7. Abra a aba **Actions** e aguarde a publicação ser concluída com sucesso. O link esperado é https://adilsonsenabio-lang.github.io/meu-pequeno-pet/.

## Atenção

- Não envie apenas o ZIP como um arquivo para o repositório: **extraia os arquivos** e faça o commit da estrutura.
- Arquivos e pastas iniciados por ponto, como `.github`, podem ficar ocultos no Windows. Eles já estão dentro do ZIP e precisam ser preservados.
- O GitHub Pages **não está publicado automaticamente por baixar este ZIP**. É necessário fazer o Push e habilitar o Pages.
- O projeto está pronto para PWA, mas os saves do HTML local antigo não aparecem automaticamente no endereço novo. Faça backup do progresso antes de trocar de origem.
- Depois desta importação, futuras melhorias podem ser enviadas diretamente ao GitHub, sem produzir ZIP novo.
