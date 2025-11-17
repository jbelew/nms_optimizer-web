## O que é o Otimizador NMS?

O NMS Optimizer é uma poderosa **calculadora**, **planejadora** e **construtor** baseada na Web para o jogo No Man's Sky. Ele ajuda os jogadores a projetar layouts ideais para seus equipamentos, descobrindo a melhor disposição dos módulos. Esta ferramenta suporta **layouts de Starship**, **layouts de cargueiro**, **layouts de Corvette**, **construções de multiferramentas**, **layouts de Exocraft** e **construções de Exosuit**. Ele calcula automaticamente o **colocamento ideal do módulo** para maximizar mecânicas cruciais no jogo, como **bônus de adjacência** (do agrupamento de tecnologias semelhantes) e os poderosos reforços de **slots sobrecarregados**. Compreender como usar melhor esses recursos é fundamental para alcançar o desempenho máximo, e essa ferramenta simplifica esse processo complexo.

## Como funciona

> Como você resolve um problema com até ~8,32 × 10⁸¹ permutações possíveis (82 dígitos!) Em menos de cinco segundos?

Descobrir o melhor **posicionamento de módulo** com tantas permutações de layout possíveis para uma grade completa não é tarefa fácil. Esta ferramenta combina padrões determinísticos, aprendizado de máquina e recozimento simulado baseado em Rust para fornecer **construções de naves estelares**, **construções de cargueiros**, **construções de Corvette**, **layouts de multiferramentas**, **construções de Exocraft** e **layouts de Exosuit** em cerca de cinco segundos. Ele considera todos os fatores, incluindo **bônus de adjacência** e o uso estratégico de **slots sobrecarregados**.

1. **Pré-solução baseada em padrões:** começa com uma biblioteca selecionada de padrões de layout testados manualmente, otimizando para bônus máximos de adjacência em diferentes tipos de grade.
2. **Posicionamento guiado por IA (inferência de ML):** Se uma configuração viável incluir slots sobrecarregados, a ferramenta invoca um modelo do TensorFlow treinado em mais de 16.000 grades para prever o posicionamento ideal.
3. **Recozimento Simulado (Refinamento):** Refina o layout por meio de pesquisa estocástica – trocando módulos e mudando de posição para aumentar a pontuação de adjacência, evitando ótimos locais.
4. **Apresentação de resultados:** Produz a configuração de pontuação mais alta, incluindo detalhamentos de pontuação e recomendações de layout visual para naves estelares, cargueiros, corvetas, ferramentas múltiplas, Exocraft e Exosuits.

## Principais recursos

- **Otimização de grade abrangente:** Suporte completo para slots padrão, **superalimentados** e inativos para encontrar o verdadeiro layout ideal.
- **Utilização estratégica de slots sobrecarregados:** Além de apenas reconhecer slots sobrecarregados, o otimizador determina de forma inteligente se deve colocar tecnologias essenciais (como uma arma principal) ou suas melhores atualizações nesses slots de alto reforço, navegando pelas compensações complexas para maximizar seus objetivos de construção específicos (por exemplo, dano, alcance ou eficiência). Isso reflete estratégias de jogadores experientes, mas com precisão computacional.
- **Inferência de aprendizado de máquina:** treinado em mais de 16.000 layouts de grade históricos para identificar padrões poderosos.
- **Recozimento Simulado Avançado:** Para refinamento meticuloso do layout, garantindo que cada ponto percentual de desempenho seja eliminado.

## Por que usar esta ferramenta?

Pare de adivinhar a colocação da tecnologia e desbloqueie o verdadeiro potencial do seu equipamento! Esteja você buscando uma **construção de nave estelar** de dano máximo, uma **construção de cargueiro** de longo alcance, uma poderosa **construção de Corvette**, o melhor alcance de varredura com um **layout de multiferramentas** perfeito, um **Exocraft** otimizado ou um **Exosuit** robusto, este otimizador desmistifica as regras complexas de **bônus de adjacência** e interações de **slots superalimentados**. Ele fornece uma maneira clara e eficiente de planejar atualizações com confiança e obter desempenho de alto nível sem horas de tentativa e erro manual. Se você já se perguntou sobre a melhor maneira de usar seus slots superalimentados limitados, esta **calculadora NMS** tem a resposta.

## Pilha de tecnologia

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Solucionador de back-end:** Implementações de recozimento simulado personalizado baseado em Python, Flask, TensorFlow, NumPy e Rust e pontuação heurística.
- **Testes:** Vitest, Python Unittest
- **Implantação:** Heroku (Hospedagem), Cloudflare (DNS e CDN), Docker
- **Automação:** Ações do GitHub (CI/CD)
- **Análise:** Google Analytics

## Repositórios

- IU da Web: [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Back-end: [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Um pouco de história divertida

Aqui está uma **versão inicial** da IU – funcionalmente sólida, mas visualmente mínima. A versão atual é uma grande atualização em design, usabilidade e clareza, ajudando os jogadores a encontrar rapidamente o **melhor layout** para qualquer nave ou ferramenta.

![Protótipo inicial da interface de usuário do otimizador de layout No Man's Sky](/assets/img/screenshots/screenshot_v03.png)