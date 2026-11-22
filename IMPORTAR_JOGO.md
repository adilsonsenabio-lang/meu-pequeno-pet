# Importação inicial do jogo — uma única vez

Os documentos já foram criados diretamente no GitHub. Para o jogo funcionar, precisamos adicionar o código e os sprites do pacote V84.23.

## Método recomendado: computador + GitHub Desktop

1. Baixe o pacote `MEU_PEQUENO_PET_GITHUB_PWA_V84_23_CONFIGURACAO_INICIAL.zip` fornecido no ChatGPT e extraia no computador.
2. Instale o GitHub Desktop: https://desktop.github.com/ .
3. No GitHub Desktop, entre na mesma conta do repositório e use **File > Clone repository**. Selecione `adilsonsenabio-lang/meu-pequeno-pet`.
4. Abra a pasta do repositório clonado pelo menu **Repository > Show in Explorer/Finder**.
5. Copie todo o **conteúdo interno** da pasta extraída para essa pasta clonada: `web/`, `scripts/`, `.github/`, `assets-src/`, `package.json`, documentação e demais arquivos. Não apague a pasta oculta `.git/` do clone.
6. Volte ao GitHub Desktop; em **Summary**, escreva `Importar Meu Pequeno Pet V84.23`, clique **Commit to main** e depois **Push origin**.
7. No GitHub, vá em **Settings > Pages > Build and deployment > Source**, selecione **GitHub Actions**.
8. Acompanhe **Actions** até a publicação completar. O endereço do jogo será `https://adilsonsenabio-lang.github.io/meu-pequeno-pet/`.

## Depois da primeira importação

Todas as atualizações futuras podem ser feitas diretamente no repositório usando a integração GitHub do ChatGPT, sem gerar um novo HTML ou ZIP a cada versão.

## Atenção

O link do GitHub Pages ainda não funciona enquanto o código e os arquivos do jogo não tiverem sido enviados e publicados. O save do HTML local não é transferido automaticamente para o novo domínio; faça backup antes da migração.
