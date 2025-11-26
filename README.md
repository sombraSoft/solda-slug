<h1 align="center">Solda Slug</h1>

<h2 align="center">A mais nova e provavelmente a única simulação de remoção de tornozeleira eletrônica com um ferro de solda.</h2>

<p align="center">
  <img width="830" src="public/assets/solda_slug_banner.png">
  <br>
  <em>Atenção: o gameplay não tem absolutamente nada a ver com a imagem acima. Mas aquele seu jogo mobile também não se parece com a publicidade 🤷</em>
</p>

---

<h2 align="center">🎮 JOGUE AGORA! 🎮</h2>
<p align="center">O plano é infalível (ou não). Clique no link abaixo para começar a operação.</p>
<p align="center"><a href="https://sombrasoft.github.io/solda-slug/"><strong>CLIQUE AQUI PARA JOGAR</strong></a></p>

---

## A Trama

Em um futuro distópico não muito distante, um ex-presidente se encontra em uma situação delicada: uma tornozeleira eletrônica, cortesia de seu fã número um, o temível Xandão. A liberdade está a apenas alguns centímetros de distância, mas o tempo é curto e a vigilância é constante.

Sua missão, caso decida aceitá-la, é usar um ferro de solda para libertá-lo das garras da justiça. Mas cuidado! O olhar atento de Xandão pode aparecer a qualquer momento, de qualquer canto da tela. Se ele te pegar no flagra... é GAME OVER.

**Spoiler:** Não importa o que aconteça, o resultado é sempre o mesmo (a prisão era inevitável).

## Como Jogar

- **Mova o mouse:** Para posicionar o ferro de solda.
- **Clique e segure:** Para aquecer o ferro e aplicar na tornozeleira.
- **Solte o clique:** Para esfriar o ferro e evitar ser pego.
- **NÃO SEJA PEGO:** Se o Xandão aparecer, pare tudo!

## Para Desenvolvedores (ou Curiosos)

Quer inspecionar o código-fonte desta obra-prima da engenharia de software? Siga os passos abaixo.

1. **Clone o repositório (com Git LFS):**

    Este projeto utiliza [Git LFS](https://git-lfs.com/) para gerenciar assets pesados (imagens e áudio). Certifique-se de ter o Git LFS instalado e configurado.

    ```bash
    git clone https://github.com/sombraSoft/solda-slug.git
    cd solda-slug
    git lfs install
    git lfs pull
    ```

2. **Instale as dependências (com o coelhinho rápido):**

    Certifique-se de ter o [Bun instalado](https://bun.sh/).

    ```bash
    bun install
    ```

3. **Rode o servidor de desenvolvimento (e que a mágica aconteça):**

    ```bash
    bun run dev
    ```

### Outros Comandos Úteis

Para manter a qualidade do código (e evitar que o Xandão reclame da bagunça), utilize os comandos abaixo:

- **Lint e Formatação (Biome):**

    ```bash
    bun run lint    # Apenas verifica problemas
    bun run lint:fix  # Verifica e corrige problemas automaticamente
    ```

- **Build de Produção:**

    ```bash
    bun run build   # Gera os arquivos otimizados na pasta dist/
    ```

## Feito Com

Este projeto foi construído com as seguintes tecnologias:

- **Runtime:** [Bun](https://bun.sh/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Renderização:** [Three.js](https://threejs.org/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Linter/Formatter:** [Biome](https://biomejs.dev/)

## Licença

Este projeto é distribuído sob a licença **Creative Commons BY-NC-SA 4.0**. Isso significa que você é livre para compartilhar e adaptar este jogo, desde que dê o crédito, não o use para fins comerciais e o compartilhe sob a mesma licença. Veja o arquivo `LICENSE.md` para mais detalhes.

---

***Disclaimer:** Este jogo é uma obra de ficção e paródia. Qualquer semelhança com pessoas reais, vivas ou presas, ou eventos atuais é mera coincidência (ou talvez não).*
