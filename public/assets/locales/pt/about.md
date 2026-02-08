# Como funciona o NMS Optimizer: otimização de layout de tecnologia baseada em ML

## O que é o Otimizador NMS?

O NMS Optimizer é a melhor calculadora de layout de tecnologia gratuita baseada na web para jogadores de No Man's Sky que desejam encontrar o posicionamento ideal do módulo para seus equipamentos. Esta ferramenta ajuda você a projetar e visualizar layouts ideais para:

- **Layouts tecnológicos de naves estelares** e construções de naves estelares
- **Layouts de cargueiros** e colocação de tecnologia de cargueiros
- **Layouts de tecnologia Corvette** e construções de corveta
- **Layouts multiferramentas** e construções multiferramentas
- **Layouts de Exocraft** e construções de exocraft
- **Layouts de exosuit** e colocação de tecnologia de exosuit

A ferramenta lida com a matemática automaticamente, contabilizando **bônus de adjacência** (o aumento de desempenho que você obtém ao colocar tecnologias compatíveis próximas umas das outras em sua grade de inventário) e **slots sobrecarregados** (os raros slots de alto valor que oferecem aumentos de aproximadamente 25-30%). Ele calcula e encontra o arranjo que dá a pontuação mais alta possível para sua construção.

## Como funciona?

O problema é matematicamente enorme: ~8,32 × 10⁸¹ permutações possíveis (82 dígitos). Nós resolvemos isso usando reconhecimento de padrões, aprendizado de máquina e otimização. A ferramenta funciona em quatro etapas:

1. **Verifique os padrões selecionados:** Comece com padrões testados manualmente que oferecem bônus sólidos de adjacência
2. **Preveja com ML:** se sua configuração incluir slots superalimentados, um modelo do TensorFlow (treinado em mais de 16.000 grades do mundo real) prevê o melhor posicionamento para tecnologias principais
3. **Refinar com recozimento simulado:** Um otimizador baseado em Rust troca módulos e muda de posição para alcançar a melhor pontuação possível
4. **Mostre o resultado:** A ferramenta exibe sua configuração de pontuação mais alta com detalhes de pontuação

## O que pode fazer

- **Lida com todos os tipos de slots:** Slots padrão, sobrecarregados e inativos
- **Compreende slots sobrecarregados:** O otimizador decide se uma tecnologia principal ou sua melhor atualização deve ser usada nesses slots de alto valor. Ele navega pelas compensações para maximizar seu objetivo
- **Usa padrões de ML:** Treinado em mais de 16.000 layouts reais para identificar arranjos de alto desempenho
- **Refina até a perfeição:** O recozimento simulado extrai todos os pontos percentuais de desempenho possíveis

## Por que usá-lo

Evite as intermináveis ​​tentativas e erros. Obtenha o layout matematicamente ideal para sua nave estelar de dano máximo, cargueiro de maior alcance, corveta poderosa ou exosuit robusto. A ferramenta explica bônus de adjacência e slots sobrecarregados em vez de deixar você na dúvida. Se você já se perguntou como usar melhor seus slots superalimentados limitados, isto lhe dá a resposta.

## Por que escolher o otimizador NMS em vez do planejamento manual?

**O problema:** O equipamento No Man's Sky pode ter milhões de arranjos tecnológicos possíveis, e encontrar o layout ideal por tentativa e erro leva horas.

**A solução:** O NMS Optimizer usa aprendizado de máquina e algoritmos avançados para:
- Encontre seu melhor layout de tecnologia em segundos
- Maximize os bônus de adjacência automaticamente
- Otimize o posicionamento de slots sobrecarregados
- Mostrar o detalhamento exato da pontuação
- Trabalho para todos os tipos de equipamentos (naves estelares, corvetas, multiferramentas, exosuits, exocraft, cargueiros)
- Atualize em tempo real conforme você ajusta suas seleções de tecnologia

Em vez de adivinhar, você obtém o arranjo matematicamente ideal – sempre.

## Pilha de tecnologia

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Solucionador de back-end:** Python, Flask, TensorFlow, NumPy, recozimento e pontuação simulados baseados em Rust
- **Testes:** Vitest, Python Unittest
- **Implantação:** Heroku (Hospedagem), Cloudflare (DNS e CDN), Docker
- **Automação:** Ações do GitHub (CI/CD)
- **Análise:** Google Analytics

## Repositórios

- IU da Web: [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Back-end: [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Perguntas frequentes

### P: O que é um bônus de adjacência?

R: Um **bônus de adjacência** em No Man's Sky é o aumento de desempenho que você recebe ao colocar módulos de tecnologia compatíveis próximos uns dos outros em sua grade de inventário. Diferentes tecnologias têm diferentes parceiros adjacentes – por exemplo, atualizações de armas geralmente dão bônus quando colocadas próximas umas das outras. O NMS Optimizer analisa as tecnologias selecionadas e encontra o arranjo que maximiza todos os bônus de adjacência em toda a sua rede, garantindo que você obtenha os melhores multiplicadores de desempenho possíveis.

### P: Como funcionam os slots sobrealimentados?

R: **Slots Supercharged** são slots de inventário raros e de alto valor (geralmente 4 por grade) que fornecem um aumento de aproximadamente 25–30% em qualquer coisa colocada neles. Eles são um dos imóveis mais valiosos da sua rede. O desafio é decidir quais tecnologias devem ser utilizadas nesses espaços limitados. O otimizador usa aprendizado de máquina treinado em mais de 16.000 layouts reais para decidir se deve colocar uma tecnologia central ou sua melhor atualização em cada slot superalimentado, maximizando seu desempenho geral.

### P: Como funciona o otimizador de posicionamento de tecnologia NMS?

R: O NMS Optimizer usa três métodos trabalhando juntos:
1. **Correspondência de padrões** – Começa com padrões de layout de tecnologia comprovados e testados à mão que oferecem bônus de adjacência sólidos
2. **Previsão de aprendizado de máquina** – Uma rede neural TensorFlow treinada em mais de 16.000 grades do mundo real prevê o melhor posicionamento para suas tecnologias principais
3. **Refinamento de recozimento simulado** – Um otimizador baseado em Rust ajusta o layout testando milhares de trocas de posição para alcançar a melhor pontuação possível

Esta abordagem de três camadas resolve o que de outra forma seria um problema incrivelmente complexo (~8,32 × 10⁸¹ permutações).

### P: Qual equipamento No Man's Sky é compatível com o otimizador?

R: O NMS Optimizer suporta todos os principais equipamentos No Man's Sky:

- **Naves estelares:** variantes Padrão, Exótica, Sentinela, Solar, Viva e MT (focada em múltiplas ferramentas)
- **Corvetas:** Incluindo módulos de reator exclusivos e slots de tecnologia cosmética
- **Multiferramentas:** Todos os tipos, incluindo pautas
- **Exocraft:** Todos os tipos de veículos (Nomad, Pilgrim, Roamer, Minotaur, Nautilon)
- **Exosuits:** Todos os tipos de tecnologia
- **Cargueiros:** Layouts de tecnologia de navios capitais

### P: Quão preciso é o otimizador?

R: Muito preciso. O NMS Optimizer combina padrões de layout testados manualmente, aprendizado de máquina treinado em mais de 16.000 grades do mundo real e um algoritmo de recozimento simulado baseado em Rust para encontrar o layout de tecnologia matematicamente ideal para sua configuração exata. Ele leva em conta todos os bônus de adjacência, compensações de slots sobrecarregados e slots inativos para maximizar o desempenho da sua construção.

### P: Posso encontrar o melhor layout de nave estelar, layout de corveta ou layout de exosuit com esta ferramenta?

R: Sim. O NMS Optimizer encontra o **melhor layout de tecnologia** para qualquer tipo de equipamento:
- **Melhores layouts de naves** considerando suas escolhas de armas e tecnologia utilitária
- **Melhores layouts de corveta** balanceando reator e tecnologias de combate
- **Melhores layouts de exosuit** otimizando utilidade, defesa e tecnologia de movimento
- **Melhores layouts multiferramentas** para máximo dano ou utilidade
- **Melhores layouts de cargueiro** para armazenamento e utilidade

Basta selecionar o tipo de equipamento, escolher suas tecnologias, marcar seus slots sobrecarregados e o otimizador calculará o arranjo matematicamente ideal.

### P: O NMS Optimizer é gratuito?

R: Sim. O NMS Optimizer é totalmente gratuito, sem anúncios e de código aberto (licença GPL-3.0). Não é necessário registro ou pagamento. Toda otimização acontece instantaneamente no seu navegador ou em nossos servidores sem nenhum custo.

### P: Posso salvar e compartilhar minhas construções?

R: Sim. Você pode:
- **Salve compilações** como arquivos `.nms` em seu computador e recarregue-os mais tarde
- **Gere links compartilháveis** para enviar seu layout de tecnologia para amigos
- **Compartilhe sua construção diretamente** via mídia social ou mensagens
Todas as construções são validadas quanto à integridade e compatibilidade do equipamento antes do compartilhamento.

## Obrigado

George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrally, Kevin Murray e todos os outros que contribuíram – seu apoio significa tudo. Cada doação, compartilhamento e palavra gentil me ajuda a continuar construindo. Obrigado.

## Versão inicial

Esta é a aparência da IU em uma versão inicial: funcionava, mas o design era mínimo. A versão atual é uma grande melhoria em design, usabilidade e clareza.

![Protótipo inicial da interface de usuário do otimizador de layout No Man's Sky](/assets/img/screenshots/screenshot_v03.png)