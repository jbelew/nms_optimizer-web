## Visão geral

Este aplicativo da web, o NMS Optimizer, ajuda os jogadores de No Man's Sky a descobrir a melhor disposição de módulos para projetar ótimos **layouts de Nave Estelar**, **layouts de Corveta**, **montagens de Ferramenta Múltipla**, **layouts de Exocraft** e **montagens de Exotraje**. Ele calcula automaticamente o **posicionamento ideal do módulo** para maximizar mecânicas cruciais do jogo, como **bônus de adjacência** (alcançados agrupando tecnologias semelhantes para efeitos sinérgicos) e os poderosos impulsos de **slots sobrecarregados**. Entender como utilizar melhor esses recursos, especialmente os slots sobrecarregados, é fundamental para alcançar o desempenho máximo, e esta ferramenta simplifica esse processo complexo.

## Como funciona

> Como você resolve um problema com até ~8.32 × 10⁸¹ permutações possíveis (são 82 dígitos!) em menos de cinco segundos?

Descobrir o melhor **posicionamento de módulo** absoluto com tantas permutações de layout possíveis para uma grade completa não é tarefa fácil. Esta ferramenta combina padrões determinísticos, aprendizado de máquina e recozimento simulado para fornecer sugestões de **montagem de Nave Estelar**, **montagem de Corveta**, **layout de Ferramenta Múltipla**, **montagem de Exocraft** e **layout de Exotraje** de alto nível em menos de cinco segundos. Ele considera todos os fatores, incluindo **bônus de adjacência** e o uso estratégico de **slots sobrecarregados**.

1.  **Pré-resolução baseada em padrões:** Começa com uma biblioteca com curadoria de padrões de layout testados manualmente, otimizando para bônus de adjacência máximos em diferentes tipos de grade.
2.  **Posicionamento guiado por IA (inferência de ML):** Se uma configuração viável incluir slots sobrecarregados, a ferramenta invoca um modelo TensorFlow treinado em mais de 16.000 grades para prever o posicionamento ideal.
3.  **Recozimento simulado (refinamento):** Refina o layout por meio de pesquisa estocástica — trocando módulos e mudando posições para aumentar a pontuação de adjacência, evitando ótimos locais.
4.  **Apresentação de resultados:** Apresenta a configuração com a pontuação mais alta, incluindo detalhamento de pontuação e recomendações visuais de layout para Naves Estelares, Corvetas, Ferramentas Múltiplas, Exocrafts e Exotrajes.

## Recursos principais

- **Otimização abrangente da grade:** Suporte total para slots padrão, **sobrecarregados** e inativos para encontrar o verdadeiro layout ideal.
- **Utilização estratégica de slots sobrecarregados:** Além de apenas reconhecer os slots sobrecarregados, o otimizador determina inteligentemente se deve colocar tecnologias principais (como uma arma principal) ou suas melhores atualizações nesses slots de alto impulso, navegando pelas complexas compensações para maximizar suas metas de construção específicas (por exemplo, dano, alcance ou eficiência). Isso espelha as estratégias de jogadores experientes, mas com precisão computacional.
- **Inferência de aprendizado de máquina:** Treinado em mais de 16.000 layouts de grade históricos para identificar padrões poderosos.
- **Recozimento simulado avançado:** Para um refinamento meticuloso do layout, garantindo que cada ponto percentual de desempenho seja aproveitado.

## Por que usar esta ferramenta?

Pare de adivinhar o posicionamento da tecnologia e libere o verdadeiro potencial do seu equipamento! Esteja você buscando uma **montagem de Nave Estelar** de dano máximo, uma poderosa **montagem de Corveta**, o alcance de varredura definitivo com um **layout de Ferramenta Múltipla** perfeito, um **Exocraft** otimizado ou um **Exotraje** robusto, ou tentando descobrir a melhor maneira de usar seus limitados slots sobrecarregados, este otimizador desmistifica as regras complexas de **bônus de adjacência** e interações de **slots sobrecarregados**. Ele fornece uma maneira clara e eficiente de planejar suas atualizações com confiança e alcançar um desempenho de alto nível sem horas de tentativa e erro manual.

## Pilha de tecnologia

**Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI\
**Solucionador de back-end:** Python, Flask, TensorFlow, NumPy, implementação de recozimento simulado personalizado e pontuação heurística\
**Testes:** Vitest, Python Unittest\
**Implantação:** Heroku (hospedagem) e Cloudflare (DNS e CDN)\
**Automação:** Ações do GitHub (CI/CD)\
**Análise:** Google Analytics

## Repositórios

- Web UI: [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Uma história divertida

Aqui está uma olhada em uma **versão inicial** da interface do usuário — funcionalmente sólida, mas visualmente mínima. A versão atual é uma grande atualização em design, usabilidade e clareza, ajudando os jogadores a encontrar rapidamente o **melhor layout** para qualquer nave ou ferramenta.

![Protótipo inicial da interface do usuário do otimizador de layout de No Man's Sky](/assets/img/screenshots/screenshot_v03.png)