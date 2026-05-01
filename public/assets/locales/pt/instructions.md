# Instruções do NMS Optimizer: Módulos e Espaços Sobrecarregados

## Primeiros Passos Com A Grade

- Selecione uma **Plataforma** (Nave, Multiferramenta, Corveta, etc.) usando o ícone <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon>.
- **Clique** ou **toque duas vezes** (mobile) em um espaço para marcá-lo como **Sobrecarregado**.
- **Ctrl-clique (Windows) / ⌘-clic (Mac) / toque simples (mobile)** para alternar entre um espaço **ativo** ou **inactive**.
- Use os **interruptores de linha** para activar ou desativar linhas inteiras. _(Os interruptores são desativados após a colocação de módulos)._
- Use o botão de **seleção de módulos** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> para adicionar ou remover módulos individuais dentro de um grupo tecnológico.

> 💡 **Nota:**
> Exotrajes e Exonaves possuem grades fixas. Os espaços de Exonaves não podem ser modificados. Em Exotrajes, apenas os estados ativo/inativo podem ser alterados — os layouts de espaços sobrecarregados são fixos.

## Antes De Começar

Esta ferramenta é destinada à **otimização de final de jogo (endgame)** e funciona melhor quando:

- A maioria ou todos os espaços da grade estão desbloqueados.
- Todas as tecnologias relevantes estão disponíveis.
- Você possui **três módulos de melhoria** por tecnologia.

Configurações parciais são suportadas, mas os resultados são otimizados para plataformas totalmente melhoradas.

## Dicas De Uso

Espaços sobrecarregados são limitados — o posicionamento importa.

- **Não atribua todos os espaços sobrecarregados à primeira tecnologia que você colocar.** Isso geralmente bloqueia layouts gerais mais fortes posteriormente.
- Comece atribuindo **2–3 espaços sobrecarregados a uma tecnologia de alto impacto**, não todos eles.
- Reserve pelo menos **um ou mais espaços sobrecarregados** para uma **segunda tecnologia prioritária** para melhorar a eficácia total.
- Depois de usar todos os seus espaços sobrecarregados, priorize tecnologias com **maior contagem de módulos** antes que o espaço se torne limitado.
- Deixe o otimizador cuidar do posicionamento; seu papel é **definir prioridades e distribuição**.

Si o espaço ficar apertado, você pode precisar redefinir e resolver as tecnologias em uma ordem diferente para evitar um **Alerta de Otimização**.

## Dica Profissional

O otimizador usa janelas fixas dimensionadas para a contagem de módulos de cada tecnologia para encontrar posicionamentos eficientes.
Si os resultados não forem ideais, **desative espaços temporariamente** para guiar o otimizador em direção a um layout melhor.

## Rótulos Theta / Tau / Sigma

Esses rótulos classificam melhorias procedimentais **pelos atributos**, não pela classe. São termos legados mantidos para consistência.

- **Theta (1)** — melhores atributos
- **Tau (2)** — intermediário
- **Sigma (3)** — mais fraco

Você não verá esses rótulos no jogo. Eles são atribuídos comparando diretamente os atributos das melhorias.

### Comparação No Jogo

Ignore as letras de classe (S, X, etc.) e compare os atributos:

- Melhor → **Theta**
- Segundo → **Tau**
- Pior → **Sigma**

**A classe não determina a classificação.** Melhorias de Classe X podem superar ou subestimar as de Classe S.

## Corbetas

Corvetas diferem de outras plataformas: elas podem ter **até três conjuntos de melhorias separados**.

- **Melhorias cosméticas** são mostradas como `Cn`.
- **Melhorias de reator** são mostradas como `Rn`.

O otimizador pode sugerir melhorias Cosméticas pelo desempenho em vez da aparência, embora as diferenças sejam geralmente pequenas.

## Builds Recomendadas

Para **Exotrajes** e **Exonaves**, os espaços sobrecarregados são fixos e os layouts viáveis são limitados.
A ferramenta fornece **builds recomendadas selecionadas manualmente** que refletem as combinações ideais.

Sugestões e layouts alternativos são bem-vindos através das discussões do projeto:
https://github.com/jbelew/nms_optimizer-web/discussions

## Salvando, Carregando E Compartilhando

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Carregar** — Carregue um arquivo `.nms` salvo para restaurar um layout.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Salvar** — Baixe o layout atual como um arquivo `.nms`.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Compartilhar** — Gere um link que outros podem abrir diretamente no otimizador.
- <radix-icon name="CameraIcon" size="20" color="var(--accent-11)"></radix-icon> **Capturar Tela** — Gere uma captura de tela do layout atual.
