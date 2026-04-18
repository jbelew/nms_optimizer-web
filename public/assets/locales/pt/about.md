# Sobre o Otimizador de NMS: Como a Otimização Funciona

## O Que É Isso?

O Otimizador de NMS é uma ferramenta gratuita que descobre onde colocar seus módulos de tecnologia no No Man's Sky. Você escolhe seu equipamento, seleciona suas tecnologias, marca seus espaços sobrecarregados e a ferramenta calcula o layout que obtém a maior pontuação.

Funciona para naves (padrão, sentinela, solar, lutadora, viva, atlante), corvetas, multiferramentas, exotrajes, todos os tipos de exonaves e cargueros.

A ferramenta gerencia automaticamente os bônus de adjacência e a localização dos espaços sobrecarregados. Na prática, um layout otimizado costuma pontuar entre 15% e 20% a mais do que o que a maioria dos jogadores organiza manualmente.

## O Problema

No Man's Sky não explica bem os bônus de adjacência e não explica nada sobre a estratégia de espaços sobrecarregados. Módulos do mesmo tipo ganham um aumento de atributos quando compartilham uma borda na grade. Espaços sobrecarregados dão um multiplicador de aproximadamente 25-30% a qualquer coisa que você colocar neles. Descobrir a melhor disposição significa equilibrar ambos os sistemas ao mesmo tempo, em grades com milhões de permutações possíveis (~8,32 × 10⁸¹ para um layout completo).

Ninguém consegue resolver isso manualmente.

## Como o Otimizador Resolve Isso

O otimizador executa quatro etapas:

1. **Correspondência de Padrões**: Começa com disposições testadas manualmente que pontuam bem de forma confiável para conjuntos comuns de módulos.
2. **Previsão Por ML**: Se sua grade tiver espaços sobrecarregados, um modelo TensorFlow treinado em mais de 16.000 layouts de alta pontuação prevê onde colocar as tecnologias principais em relação às melhorias.
3. **Simulated Annealing (Recozimento Simulado)**: Um otimizador baseado em Rust troca módulos e testa milhares de disposições em milissegundos, buscando a maior pontuação possível.
4. **Visualização de Resultados**: Você verá o layout com a maior pontuação com um detalhamento completo do multiplicador de adjacência.

Cada etapa alimenta a próxima. O modelo de ML dá ao Simulated Annealing um ponto de partida sólido, e o algoritmo de Rust cuida do refino a partir daí.

## O Que o Otimizador Considera

- Espaços padrão, sobrecarregados e inativos.
- Se uma tecnologia principal ou sua melhor melhoria deve ir em cada espaço sobrecarregado.
- Equilíbrio entre atributos conflitantes (manobrabilidade vs. velocidade, dano vs. cadência de tiro).
- Pesos de atributos específicos de cada módulo e regras de adjacência.

## Pilha Tecnológica

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI.
- **Serviço de Otimização:** Python, Flask, TensorFlow, NumPy, Rust (Simulated Annealing e pontuação).
- **Testes:** Vitest, Python Unittest.
- **Implantação:** Heroku (hospedagem), Cloudflare (Hosting/DNS/CDN), Docker.
- **CI/CD:** GitHub Actions.

## Repositórios

- Interface Web: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Perguntas Frequentes (FAQ)

### O Que É Bônus de Adjacência?

Quando você coloca módulos de tecnologia compatíveis lado a lado na grade de inventário, eles ganham um aumento de atributos. Diferentes tecnologias têm diferentes parceiros de adjacência: melhorias de armas se ajudam, tecnologias de movimento se ajudam, e assim por diante. O otimizador testa todas as disposições possíveis e escolhe aquela onde os bônus totais são os mais altos.

### Como Funcionam os Espaços Sobrecarregados?

Espaços sobrecarregados são espaços raros (geralmente 4 por grade) que dão um impulso de cerca de 25-30% a qualquer módulo colocado neles. A parte difícil é decidir o que colocar lá. Às vezes é a tecnologia principal, outras vezes é a melhoria com os melhores atributos. O modelo de ML do otimizador é treinado especificamente para essa decisão, usando mais de 16.000 layouts reais como dados de treinamento.

### Quais Tipos de Equipamento São Suportados?

Todos eles:

- **Naves:** Padrão, Exótica, Sentinela, Solar e Viva.
- **Corvetas:** Incluindo módulos de reator únicos e espaços de tecnologia cosmética.
- **Multiherramientas:** Todos os tipos, incluindo Cajados.
- **Exonaves:** Todos os veículos (Nomad, Colossus, Pilgrim, Roamer, Minotaur, Nautilon).
- **Exotrajes:** Todos os tipos de tecnologia.
- **Cargueiros:** Layouts de tecnologia de naves capitais.

### É Gratuito?

Sim. Gratuito, sem anúncios, de código aberto (GPL-3.0). Sem contas ou e-mails.

### Posso Salvar e Compartilhar Builds?

Sim. Você pode salvar builds como arquivos `.nms`, gerar links compartilháveis ou postar diretamente nas redes sociais. As builds são validadas para garantir integridade e compatibilidade antes do compartilhamento.

## Agradecimentos

George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray e todos os outros que contribuíram: seu apoio significa tudo. Cada doação, cada compartilhamento da ferramenta e cada palavra de incentivo me ajuda a continuar construindo. Obrigado.

## Versão Antiga

Aqui está como a interface parecia em uma versão inicial: funcionava, mas o design era mínimo. A versão atual é uma grande evolução em design, usabilidade e clareza.
![Protótipo inicial da interface de usuário do otimizador de layouts do No Man's Sky](/assets/img/screenshots/screenshot_v03.png)
