# 📊 Easy Charts

Um site open-source para gerar gráficos bonitos com animações suaves usando Framer Motion.

## ✨ Características

- **Interface Intuitiva**: Layout limpo com header, menu lateral e área do gráfico
- **Animações Suaves**: Transições e animações fluidas usando Framer Motion
- **Adição de Pontos**: Adicione pontos manualmente ou automaticamente
- **Linhas Animadas**: Linhas são criadas automaticamente entre pontos consecutivos
- **Design Responsivo**: Interface moderna e responsiva com Tailwind CSS
- **TypeScript**: Código tipado e bem estruturado

## 🚀 Como Usar

1. **Adicionar Pontos**:
   - Clique no botão "Ativar Modo de Adição" no menu lateral
   - O botão ficará verde indicando que o modo está ativo
   - Clique em qualquer lugar do gráfico para adicionar pontos
   - Pontos são criados automaticamente com rótulos sequenciais (P1, P2, P3...)

2. **Adicionar Curvas**:
   - Após criar pelo menos uma linha, use o botão "Adicionar Curva"
   - O botão ficará roxo indicando que o modo está ativo
   - Clique em uma linha existente para adicionar pontos de controle
   - Adicione vários pontos para criar curvas complexas
   - Arraste os pontos de controle para ajustar a curvatura

3. **Interação**:
   - Clique nos pontos para interagir
   - Arraste qualquer ponto para movê-lo
   - Pontos de controle das curvas são menores e roxos
   - Use "Reiniciar Animações" para ver as animações novamente
   - Use "Limpar Gráfico" para resetar tudo
   - Desative os modos clicando novamente nos botões

## 🛠️ Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **pnpm** - Gerenciador de pacotes

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/easy-charts.git
cd easy-charts

# Instale as dependências
pnpm install

# Execute o servidor de desenvolvimento
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver o resultado.

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Chart.tsx          # Componente principal do gráfico
│   ├── ChartContainer.tsx # Container que integra todos os componentes
│   ├── Header.tsx         # Cabeçalho da aplicação
│   └── Sidebar.tsx        # Menu lateral com controles
├── hooks/
│   └── useChart.ts        # Hook personalizado para gerenciar o estado
└── types/
    └── chart.ts           # Definições de tipos TypeScript
```

## 🎨 Componentes

### Chart
- Renderiza o gráfico SVG com pontos, linhas e curvas
- Animações de entrada para pontos, linhas e curvas
- Grid de fundo para referência visual
- Detecta cliques para adicionar pontos e pontos de controle
- Suporte completo para arrastar pontos (drag & drop)
- Cursor crosshair quando os modos estão ativos
- Pontos de controle das curvas são visualmente diferenciados
- Linhas ficam tracejadas quando o modo de curva está ativo
- Suporte para múltiplos pontos de controle por linha
- Curvas complexas com diferentes tipos (quadrática, cúbica, múltiplas)

### Sidebar
- Botão para ativar/desativar modo de adição de pontos
- Botão para adicionar curvas com pontos de controle
- Estatísticas em tempo real (pontos, linhas, curvas)
- Botões de ação (reiniciar animações, limpar gráfico)

### Header
- Informações do projeto
- Links para GitHub
- Design responsivo

## 🔧 Scripts Disponíveis

```bash
pnpm dev      # Servidor de desenvolvimento
pnpm build    # Build de produção
pnpm start    # Servidor de produção
pnpm lint     # Verificação de código
pnpm format   # Formatação de código
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- [Framer Motion](https://www.framer.com/motion/) por fornecer animações incríveis
- [Tailwind CSS](https://tailwindcss.com/) pelo sistema de design
- [Next.js](https://nextjs.org/) pelo framework React

---

Feito com ❤️ para a comunidade open-source
