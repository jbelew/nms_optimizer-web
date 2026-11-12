# Sobre o NMS Optimizer: A Calculadora Definitiva de Layouts de Tecnologia para No Man's Sky

O **NMS Optimizer** é uma ferramenta 100% gratuita e sem anúncios projetada para descobrir exatamente onde posicionar seus módulos de tecnologia em _No Man's Sky_. Você escolhe seu equipamento, seleciona seus módulos de atualização de Classe S ou Classe X, marca seus espaços supercarregados e nossa calculadora gera quase instantaneamente o layout que maximiza seus atributos no jogo.

Ao equilibrar perfeitamente as mecânicas do jogo, um layout otimizado normalmente alcança uma pontuação **15-20% maior** do que o que a maioria dos jogadores consegue organizar manualmente.

## O Problema: Maximizar Bônus de Adjacência e Espaços Supercarregados

_No Man's Sky_ não explica explicitamente os bônus de adjacência e não oferece nenhuma orientação sobre estratégias para espaços supercarregados. Maximizar a manobrabilidade da sua nave ou o dano da sua multiferramenta exige conciliar dois sistemas complexos:

- **Bônus de Adjacência:** Quando você coloca módulos de tecnologia compatíveis lado a lado na grade de inventário, eles recebem um bônus nos atributos. Tecnologias diferentes têm parceiros de adjacência diferentes — atualizações de armas fortalecem umas às outras, tecnologias de movimento impulsionam outras tecnologias de movimento e, quanto mais bordas compartilhadas você criar, maior será o bônus acumulado.
- **Espaços Supercarregados:** Esses raros espaços de inventário (geralmente até 4 por grade) concedem um enorme multiplicador de ~25-30% nos atributos de qualquer módulo colocado dentro deles.

Descobrir o melhor arranjo absoluto exige testar combinações entre milhões de permutações possíveis — até cerca de 8,32 × 10⁸¹ em uma grade totalmente expandida. Ninguém resolve isso manualmente.

## Como Funciona o Motor de Otimização de Layouts

Nós não dependemos de palpites. O motor do NMS Optimizer utiliza um pipeline sofisticado de quatro etapas para encontrar automaticamente sua melhor build:

1. **Reconhecimento de Padrões:** O solucionador começa com arranjos testados manualmente e comprovados pela comunidade que obtêm ótimas pontuações de forma consistente em conjuntos comuns de módulos.
2. **Aprendizado de Máquina (IA):** Se a sua grade possui espaços supercarregados exclusivos, um modelo de aprendizado de máquina em TensorFlow — treinado com mais de 16.000 layouts de alta pontuação — prevê os posicionamentos mais inteligentes para suas tecnologias principais em relação aos seus módulos de atualização.
3. **Recozimento Simulado:** Nosso motor central de otimização, desenvolvido em Rust, troca módulos rapidamente e testa milhares de arranjos em milissegundos para alcançar a maior pontuação possível.
4. **Exibição dos Resultados:** Você vê imediatamente o layout vencedor acompanhado do detalhamento completo dos multiplicadores de adjacência.

## Equipamentos Suportados

O NMS Optimizer oferece otimização dinâmica para todas as principais plataformas do jogo:

- **Naves:** Padrão, Exóticas, Interceptadores sentinela, Solares, Caças e Vivas.
- **Multiferramentas:** Todas as variantes de armas e mineração, incluindo Bastões.
- **Exotrajes e Exoveículos:** Todas as tecnologias de Exotraje e tipos de veículos (Nômade, Colosso, Peregrino, Andarilho, Minotauro e Nautilon).
- **Naves Cargueiras:** Tecnologias de hiperpropulsor de nave capital e coordenação de frota.
- **Corvetas:** Suporte a layouts complexos, incluindo módulos de reator exclusivos e espaços de tecnologia cosmética.

## Perguntas Frequentes (FAQ)

**O que devo colocar nos meus espaços supercarregados?**
Depende do seu layout! Às vezes é melhor supercarregar sua tecnologia principal, e em outros casos vale mais a pena supercarregar sua atualização com os atributos mais altos. Nosso modelo de IA foi treinado com mais de 16.000 layouts reais especificamente para tomar essa decisão por você.

**O NMS Optimizer é gratuito?**
Sim. É 100% gratuito, sem anúncios e de código aberto (GPL-3.0). Você não precisa criar conta nem informar um e-mail.

**Posso salvar e compartilhar meus layouts?**
Sim! Você pode salvar suas builds favoritas localmente como arquivos `.nms`, gerar links compartilháveis para enviar a amigos ou compartilhar capturas de tela em alta qualidade dos layouts diretamente nas redes sociais. As builds passam por validação de integridade antes do compartilhamento.

**Por que a ferramenta não mostra os atributos numéricos do jogo?**
A ferramenta evita intencionalmente calcular métricas brutas do jogo, como DPS ou alcance em anos-luz. Como os números exatos dependem de sementes (_seeds_) ocultas da nave que são inacessíveis sem um editor de salvamento, o otimizador utiliza uma pontuação baseada em "porcentagem do máximo".

**Por que o layout otimizado não inclui meu módulo específico de Expedição?**
O NMS Optimizer oferece suporte completo a todas as **Recompensas de Expedição e Redux de Expedição** lançadas após a atualização _Worlds Part I_. No entanto, como nem todos os jogadores possuem esses itens raros, esses módulos opcionais não são incluídos por padrão nas otimizações. Você pode ativá-los facilmente na sua build abrindo o <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> **diálogo de Seleção de Módulos**.

## Nos Bastidores: Nossa Stack Tecnológica

Para desenvolvedores e entusiastas de dados, esta é a stack tecnológica por trás do NMS Optimizer:

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Solucionador Backend:** Python, Flask, TensorFlow, NumPy, Rust (responsável pelo recozimento simulado e pelo motor de pontuação)
- **Testes:** Vitest, Python Unittest
- **Implantação e Hospedagem:** Heroku (hospedagem da API), Cloudflare (DNS/CDN), Docker
- **CI/CD:** GitHub Actions

### Repositórios de Código Aberto

Quer contribuir? O NMS Optimizer tem código totalmente aberto.

- Interface Web: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Um Enorme Agradecimento à Comunidade

Este projeto não seria possível sem a incrível comunidade de _No Man's Sky_. Um agradecimento especial a **George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray, jayriley, arratikbehavior, Someone, Cal Abunga** e a todas as outras pessoas que contribuíram. Seu apoio, doações, compartilhamentos e palavras gentis significam tudo e ajudam a manter este projeto vivo.

## Uma Olhada no Passado: Primeiras Versões

![Protótipo inicial da interface de usuário do otimizador de layouts para No Man's Sky](/assets/img/screenshots/screenshot_v03.webp)
Se você nos acompanha desde o início, talvez se lembre de como era a interface nas primeiras fases alfa. Ela funcionava, mas o visual era minimalista. A versão atual representa uma evolução grande e contínua em design, usabilidade móvel e clareza geral.
