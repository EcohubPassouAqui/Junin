# Junin — v1

Landing page para venda de pods descartáveis **Ignite V80**. Site focado em conversão via WhatsApp, com design escuro premium, animações de partículas e globo 3D interativo.

## Tecnologias

- HTML5 semântico
- CSS3 (Grid, Flexbox, variáveis customizadas, animações)
- Vanilla JavaScript — sem dependências de build
- Font Awesome 6.5 (ícones)
- Google Fonts: Syne + DM Sans

## Estrutura de arquivos

| Arquivo    | Descrição |
|------------|-----------|
| `index.html` | Estrutura completa — hero, produtos, ofertas, especificações, footer, cookies |
| `main.css`   | Estilos — tema escuro, responsivo, animações e transições |
| `app.js`     | Canvas (grid + partículas), globo 3D, sabores, WhatsApp, scroll spy, cookies |

## Seções

1. **Hero** — título, badge "8000 Puffs", CTA para WhatsApp, globo 3D com Maringá destacada
2. **Produtos** — abas (Produto / Ofertas / Detalhes), seletor de sabores, especificações técnicas e info de entrega
3. **Footer** — links WhatsApp e Instagram
4. **Cookie Banner** — consentimento com opção de cookies analíticos

## Sabores (12)

- Acai Ice, Artic Gum, Frozen Mint, Menthol, Ice Mint+
- Blueberry Lemon, Grape Ice, Blueberry Frozen
- Strawberry Kiwi, Watermelon Ice, Lime Mango, Frozen Strawberry

## Categorias

| Categoria   | Cor     |
|-------------|---------|
| Gelado      | Teal    |
| Frutado     | Amber   |
| Mentolado   | Blue    |
| Tropical    | Green   |

## WhatsApp

Atendimento via `wa.me/554499663436` — botões geram mensagens contextuais baseadas no sabor e quantidade selecionados.

## Como rodar

Basta abrir `index.html` no navegador. Nenhum build server necessário.

```
npx serve .
```
ou abra direto no navegador.
