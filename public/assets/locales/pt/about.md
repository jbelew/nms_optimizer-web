# Sobre o NMS Optimizer: A Calculadora Definitiva de Layouts de Tecnologia para No Man's Sky

**NMS Optimizer** é uma ferramenta 100% gratuita e sem anúncios projetada para descobrir exatamente onde colocar seus módulos de tecnologia em _No Man's Sky_. Você escolhe seu equipamento, seleciona seus módulos de atualização Classe S ou Classe X, marca seus espaços superalimentados (Supercharged Slots) e nossa calculadora gera quase instantaneamente o layout que maximiza seus atributos no jogo.

Ao equilibrar perfeitamente as mecânicas de jogo, um layout otimizado normalmente pontua **15-20% mais alto** do que a maioria dos jogadores consegue organizar à mão.

## O Problema: Maximizando Bônus de Adjacência (Adjacency Bonuses) & Espaços Superalimentados

_No Man's Sky_ não explica explicitamente os bônus de adjacência e não oferece orientação sobre a estratégia para espaços superalimentados. Maximizar a manobrabilidade de sua nave ou o dano de sua multiferramenta significa lidar com dois sistemas complexos:

- **Bônus de Adjacência:** Quando você coloca módulos de tecnologia compatíveis lado a lado na grade do inventário, eles ganham um bônus de atributos. Tecnologias diferentes têm parceiros de adjacência diferentes — atualizações de armas impulsionam umas às outras, tecnologia de movimento impulsiona outra tecnologia de movimento, e quanto mais bordas compartilhadas você criar, maior será o bônus cumulativo.
- **Espaços Superalimentados:** Esses raros espaços de inventário (geralmente até 4 por grade) fornecem um enorme multiplicador de atributos de ~25-30% para qualquer módulo colocado neles.

Descobrir o melhor arranjo absoluto significa testar combinações em milhões de permutações possíveis — até cerca de 8.32 × 10⁸¹ para uma grade totalmente expandida. Ninguém está resolvendo isso à mão.

## Como o Motor de Otimização de Layout Funciona

Nós não dependemos de adivinhação. O motor do NMS Optimizer usa um sofisticado fluxo de trabalho de quatro etapas para encontrar automaticamente sua melhor build:

1.  **Reconhecimento de Padrões:** O solucionador começa com arranjos testados manualmente e aprovados pela comunidade que obtêm boas pontuações de forma confiável para conjuntos de módulos comuns.
2.  **Aprendizado de Máquina (IA):** Se sua grade possui espaços superalimentados únicos, um modelo de aprendizado de máquina TensorFlow — treinado em mais de 16.000 layouts de alta pontuação — prevê os posicionamentos mais inteligentes para suas tecnologias principais em relação aos seus módulos de atualização.
3.  **Recozimento Simulado (Simulated Annealing):** Nosso principal motor de otimização, construído em Rust, troca rapidamente os módulos e testa milhares de arranjos em milissegundos para escalar em direção à pontuação mais alta absoluta possível.
4.  **Exibição de Resultados:** Você vê imediatamente o layout vencedor ao lado de um detalhamento completo dos multiplicadores de adjacência.

## Equipamentos Suportados

O NMS Optimizer fornece resolução dinâmica para cada plataforma principal do jogo:

- **Naves (Starships):** Naves Padrão, Exóticas (Exotic), Interceptadores Sentinela (Sentinel Interceptor), Solares, Caças (Fighter), Vivas (Living) e Atlantid.
- **Multiferramentas (Multi-Tools):** Todas as variantes de armas e mineração, incluindo Cajados (Staves).
- **Exotrajes (Exosuits) & Exoveículos (Exocraft):** Todas as tecnologias de Exotraje e tipos de veículos (Nômade, Colosso, Pilgrim, Roamer, Minotauro, Nautilon).
- **Cargueiros (Freighters):** Tecnologia de hiperpropulsor de nave capital e coordenação de frota.
- **Corvetas (Corvettes):** Suporte para layouts complexos, incluindo módulos de reator únicos e espaços de tecnologia estética.

## Perguntas Frecuentes (FAQ)

**O que devo colocar nos meus espaços superalimentados?**
Depende do seu layout! Às vezes é melhor superalimentar sua tecnologia principal, e outras vezes é melhor superalimentar sua atualização com os atributos mais altos. Nosso modelo de IA foi treinado em mais de 16.000 layouts reais especificamente para tomar essa decisão por você.

**O NMS Optimizer é gratuito?**
Sim. É 100% gratuito, sem anúncios e de código aberto (GPL-3.0). Você não precisa criar uma conta ou fornecer um e-mail.

**Posso salvar e compartilhar meus layouts?**
Sim! Você pode salvar suas builds favoritas localmente como arquivos `.nms`, gerar links compartilháveis para enviar a amigos, ou compartilhar capturas de tela de alta qualidade dos layouts diretamente nas redes sociais. As builds são validadas quanto à integridade antes de serem compartilhadas.

**Por que a ferramenta não mostra as estatísticas do jogo?**
A ferramenta evita intencionalmente calcular métricas padrão do jogo, como DPS ou Alcance de Anos-Luz. Como números exatos requerem "seeds" (sementes) ocultas da nave, inacessíveis sem um editor de save, o otimizador confia em uma pontuação de "porcentagem do máximo" em seu lugar.

**Por que o layout otimizado não inclui meu módulo específico de Expedição?**
O NMS Optimizer suporta totalmente todas as **Recompensas de Expedição e Redux de Expedição** oferecidas após a atualização _Worlds Part I_. No entanto, como nem todos os jogadores possuem esses itens raros, esses módulos opcionais não são incluídos por padrão em suas soluções. Você pode ativá-los facilmente para sua build abrindo a <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> **Interface de Seleção de Módulos**.

## Sob o Capô: Nossa Pilha de Tecnologia

Para os desenvolvedores e nerds de dados, aqui está a pilha de tecnologia que alimenta o NMS Optimizer:

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend Solucionador:** Python, Flask, TensorFlow, NumPy, Rust (alimenta o recozimento simulado e o motor de pontuação)
- **Testes:** Vitest, Python Unittest
- **Implantação & Hospedagem:** Heroku (hospedagem da API), Cloudflare (DNS/CDN), Docker
- **CI/CD:** GitHub Actions

### Repositórios de Código Aberto

Quer contribuir? O NMS Optimizer é totalmente de código aberto.

- Interface Web: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Um Enorme Muito Obrigado à Comunidade

Este projeto não seria possível sem a incrível comunidade de _No Man's Sky_. Um agradecimiento especial a George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray e todos os outros que contribuíram. Seu apoio, doações, compartilhamentos e palavras gentis significam tudo e ajudam a manter este projeto vivo.

## Uma Olhada no Passado: Versões Iniciais

![Early prototype of No Man's Sky layout optimizer user interface](/assets/img/screenshots/screenshot_v03.png)
Se você esteve conosco desde o começo, pode se lembrar da aparência da interface do usuário em seus estágios iniciais alfa. Ela funcionava, mas o design era minimalista. A versão atual representa uma grande e contínua melhoria em design, usabilidade móvel e clareza geral.
