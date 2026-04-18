# Otimizador de NMS: Criador de Layouts e Calculadora de Adjacência

![Captura de tela do aplicativo Otimizador de NMS mostrando uma grade de tecnologia de nave com posicionamento de módulos otimizado](/assets/img/screenshots/screenshot.png)

O Otimizador de NMS descobre onde colocar seus módulos de tecnologia para que você não precise fazer isso. Escolha sua plataforma, selecione seus módulos, marque seus espaços sobrecarregados e o otimizador calculará o layout que aproveita ao máximo seus bônus de adjacência. Funciona para naves, corvetas, multiferramentas, exotrajes, exonaves e cargueiros.

## O Que É Um Bônus de Adjacência?

Quando você coloca módulos de tecnologia compatíveis lado a lado no No Man's Sky, eles ganham um aumento de atributos. O jogo não explica muito sobre como isso funciona, mas a versão curta é: módulos do mesmo tipo que compartilham uma borda ganham um aumento percentual em seus atributos. Quanto mais bordas compartilhadas, maior o bônus. Determinar o layout correto manualmente é tedioso, especialmente em grades grandes com espaços sobrecarregados para considerar.

## O Que São Espaços Sobrecarregados?

Alguns espaços de inventário no No Man's Sky são sobrecarregados. Qualquer módulo de tecnologia colocado em um deles ganha um grande multiplicador de atributos, além dos bônus de adjacência normais. Eles são posicionados aleatoriamente em cada equipamento, então o layout ideal muda dependendo de onde os espaços sobrecarregados caíram. Essa é a parte difícil, e é para isso que esta ferramenta foi projetada.

## Como Funciona

O otimizador usa uma combinação de correspondência de padrões determinística e Simulated Annealing. Para conjuntos de módulos menores, ele pode encontrar exatamente o melhor layout. Para grades maiores ou mais complexas, o Simulated Annealing explora milhares de disposições para encontrar uma que obtenha a maior pontuação possível. A pontuação leva em conta os bônus de adjacência, la localização dos espaços sobrecarregados e os pesos de atributos específicos de cada módulo. O backend roda em Rust para garantir velocidade.

## Plataformas Suportadas

- Naves (padrão, sentinela, solar, lutadora, viva, atlante)
- Corvetas
- Multiferramentas (padrão e sentinela)
- Exotrajes
- Exonaves (roamer, pilgrim, nomad, colossus, minotaur, nautilon)
- Cargueros
