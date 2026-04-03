# NMS Optimizer: Calculadora de layout técnico e bônus de adjacência para No Man's Sky

![Captura de tela do aplicativo NMS Optimizer mostrando uma grade de tecnologia de nave estelar com posicionamento de módulo otimizado](/assets/img/screenshots/screenshot.png)

O NMS Optimizer descobre onde colocar seus módulos de tecnologia para que você não precise fazer isso. Escolha sua plataforma, selecione seus módulos, marque seus slots sobrecarregados e o otimizador calcula o layout que aproveita ao máximo seus bônus de adjacência. Funciona para naves estelares, corvetas, ferramentas múltiplas, exosuits, exocraft e cargueiros.

## O que é um bônus de adjacência?

Quando você coloca módulos de tecnologia compatíveis próximos uns dos outros no No Man's Sky, eles recebem um aumento nas estatísticas. O jogo não diz muito sobre como isso funciona, mas a versão resumida: módulos do mesmo tipo que compartilham uma vantagem recebem um aumento percentual em suas estatísticas. Quanto mais arestas forem compartilhadas, maior será o bônus. Descobrir o arranjo certo manualmente é entediante, especialmente em grades maiores com slots sobrecarregados para levar em conta.

## O que são caça-níqueis superalimentados?

Alguns slots de inventário em No Man's Sky estão sobrecarregados. Qualquer módulo de tecnologia colocado em um recebe um grande multiplicador de estatísticas além dos bônus normais de adjacência. Eles são colocados aleatoriamente em cada peça de equipamento, então o layout ideal muda dependendo de onde seus slots superalimentados pousaram. Essa é a parte difícil e é para isso que esta ferramenta foi criada.

## Como funciona

O otimizador usa uma combinação de correspondência de padrões determinísticos e recozimento simulado. Para conjuntos de módulos menores, ele pode encontrar exatamente o melhor layout. Para grades maiores ou mais complexas, o recozimento simulado explora milhares de arranjos para encontrar aquele que obtenha a pontuação mais alta possível. A pontuação leva em conta bônus de adjacência, colocação de slots sobrealimentados e pesos de estatísticas específicos do módulo. O back-end é executado em Rust para maior velocidade.

## Plataformas Suportadas

- Naves estelares (padrão, sentinela, solar, lutador, viva, atlântida)
- Corvetas
- Multiferramentas (padrão e sentinela)
- Exosuits
- Exocraft (roamer, peregrino, nômade, colosso, minotauro, nautilon)
- Cargueiros