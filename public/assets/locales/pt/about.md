# Como funciona o otimizador NMS

## O que é isso?

NMS Optimizer é uma ferramenta gratuita que descobre onde colocar seus módulos de tecnologia no No Man's Sky. Você escolhe seu equipamento, seleciona suas tecnologias, marca seus slots sobrecarregados e ele calcula o layout com maior pontuação.

Funciona para naves estelares (padrão, sentinela, solar, caça, viva, atlântida), corvetas, multiferramentas, exosuits, todos os tipos de exocraft e cargueiros.

A ferramenta lida automaticamente com bônus de adjacência e posicionamento de slots sobrecarregados. Na prática, um layout otimizado normalmente pontua de 15 a 20% mais alto do que a maioria dos jogadores organiza manualmente.

## O problema

No Man's Sky não explica bem os bônus de adjacência e não explica de forma alguma a estratégia de slots sobrecarregada. Módulos do mesmo tipo obtêm um aumento de estatísticas quando compartilham uma borda na grade. Os slots sobrecarregados oferecem um multiplicador de aproximadamente 25-30% para tudo o que você coloca neles. Descobrir o melhor arranjo significa fazer malabarismos com os dois sistemas ao mesmo tempo, em grades com milhões de permutações possíveis (~8,32 × 10⁸¹ para um layout completo).

Ninguém está resolvendo isso manualmente.

## Como o otimizador resolve isso

O otimizador passa por quatro etapas:

1. **Correspondência de padrões** — começa com arranjos testados manualmente que apresentam boa pontuação confiável para conjuntos de módulos comuns
2. **Previsão de ML** — se sua grade tiver slots sobrecarregados, um modelo do TensorFlow treinado em mais de 16.000 layouts de alta pontuação prevê onde colocar as tecnologias principais versus atualizações
3. **Recozimento simulado** — um otimizador baseado em Rust troca módulos e testa milhares de arranjos em milissegundos, subindo em direção à pontuação mais alta possível
4. **Exibição de resultados** — você vê o layout de maior pontuação com um detalhamento completo do multiplicador de adjacência

Cada etapa alimenta a próxima. O modelo ML dá ao recozimento simulado um forte ponto de partida e o recozimento é refinado a partir daí.

## O que o otimizador representa

- Slots padrão, sobrecarregados e inativos
- Se uma tecnologia central ou sua melhor atualização pertence a cada slot superalimentado
- Trade-offs entre estatísticas concorrentes (manobrabilidade vs. velocidade, dano vs. taxa de tiro)
- Pesos estatísticos específicos do módulo e regras de parceiros adjacentes

## Pilha de tecnologia

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Solucionador de back-end:** Python, Flask, TensorFlow, NumPy, Rust (recozimento e pontuação simulados)
- **Testes:** Vitest, Python Unittest
- **Implantação:** Heroku (hospedagem), Cloudflare (DNS/CDN), Docker
- **CI/CD:** Ações do GitHub

## Repositórios

- IU da Web: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Back-end: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## PERGUNTAS FREQUENTES

### O que é um bônus de adjacência?

Quando você coloca módulos de tecnologia compatíveis próximos uns dos outros na grade de inventário, eles recebem um aumento nas estatísticas. Diferentes tecnologias têm diferentes parceiros adjacentes – bônus de atualizações de armas entre si, bônus de tecnologia de movimento de outras tecnologias de movimento e assim por diante. O otimizador testa todos os arranjos possíveis e escolhe aquele em que os bônus totais de adjacência são mais altos.

### Como funcionam os caça-níqueis superalimentados?

Slots sobrecarregados são slots de inventário raros (geralmente 4 por grade) que dão um aumento de aproximadamente 25-30% a qualquer módulo que esteja neles. A parte complicada é decidir o que vai lá. Às vezes é a tecnologia central, às vezes é a atualização de maior estatística. O modelo de ML do otimizador é treinado especificamente nesta decisão, usando mais de 16.000 layouts reais como dados de treinamento.

### Quais tipos de equipamentos são suportados?

Todos eles:

- **Naves** — variantes padrão, exótica, sentinela, solar, viva e atlântida
- **Corvetas** — incluindo slots de reator e tecnologia cosmética
- **Multiferramentas** — todos os tipos, incluindo pautas
- **Exocraft** — nômade, peregrino, andarilho, colosso, minotauro, nautilon
- **Exosuits** — todas as categorias de tecnologia
- **Cargueiros** — layouts tecnológicos de naves capitais

### É grátis?

Sim. Gratuito, sem anúncios e de código aberto (GPL-3.0). Nenhuma conta é necessária.

### Posso salvar e compartilhar compilações?

Sim. Você pode salvar compilações como arquivos `.nms`, gerar links compartilháveis ​​ou compartilhar diretamente nas redes sociais. As compilações são validadas quanto à integridade e compatibilidade do equipamento antes do compartilhamento.

## Obrigado

George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrally, Kevin Murray e todos os outros que contribuíram – seu apoio significa tudo. Cada doação, compartilhamento e palavra gentil me ajuda a continuar construindo. Obrigado.

## Versão inicial

Esta é a aparência da IU em uma versão inicial: funcionava, mas o design era mínimo. A versão atual é uma grande melhoria em design, usabilidade e clareza.
![Protótipo inicial da interface de usuário do otimizador de layout No Man's Sky](/assets/img/screenshots/screenshot_v03.png)