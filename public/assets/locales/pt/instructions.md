# Instruções do NMS Optimizer: uso, módulos e células supercarregadas

## Primeiros passos com a grade

- Selecione uma **Plataforma** (Starship, Multi-Tool, Corvette, etc.) usando o ícone <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon>.
- **Clique** ou **toque duas vezes** (móvel) em uma célula para marcá-la como **Supercharged**.
- **Ctrl-clique (Windows) / ⌘-clique (Mac) / toque único (móvel)** para alternar uma célula **ativa** ou **inativa**.
- Use **alternâncias de linha** para ativar ou desativar linhas inteiras. *(As alternâncias de linha são desativadas quando os módulos são colocados.)*
- Use o botão **seleção de módulo** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> para adicionar ou remover módulos individuais dentro de um grupo de tecnologia.

> 💡 **Nota:**
> Exosuits e Exocraft possuem grades fixas. As células Exocraft não podem ser modificadas. Nos Exosuits, apenas os estados ativo/inativo podem ser alterados – os layouts de slots sobrecarregados são corrigidos.

## Antes de começar

Esta ferramenta destina-se à **otimização de final de jogo** e funciona melhor quando:

- A maioria ou todas as células da grade estão desbloqueadas.
- Todas as tecnologias relevantes estão disponíveis.
- Você tem **três módulos de atualização** por tecnologia.

Configurações parciais são suportadas, mas os resultados são otimizados para plataformas totalmente atualizadas.

## Dicas de uso

As células sobrecarregadas são limitadas – o posicionamento é importante.

- **Não atribua todas as células sobrecarregadas à primeira tecnologia que você colocar.** Isso geralmente bloqueia layouts gerais mais fortes posteriormente.
- Comece atribuindo **2 a 3 células sobrecarregadas a uma tecnologia de alto impacto**, não todas.
- Reserve pelo menos **uma ou mais células sobrecarregadas** para uma **tecnologia de segunda prioridade** para melhorar a eficácia total.
- Depois de usar todas as suas células sobrecarregadas, priorize tecnologias com **contagens maiores de módulos** antes que o espaço fique restrito.
- Deixe o solucionador cuidar do posicionamento; sua função é **definir prioridades e distribuição**.

Se o espaço ficar apertado, talvez seja necessário redefinir e resolver as tecnologias em uma ordem diferente para evitar um **Alerta de otimização**.

## Dica profissional

O solucionador usa janelas fixas dimensionadas de acordo com a contagem de módulos de cada tecnologia para encontrar posicionamentos com eficiência de espaço.
Se os resultados não forem ideais, **desative temporariamente as células** para orientar o solucionador em direção a um layout melhor.

## Etiquetas Teta / Tau / Sigma

Esses rótulos classificam as atualizações procedimentais **por estatísticas**, não por classe. São termos legados mantidos para fins de consistência.

- **Theta (1)** — melhores estatísticas
- **Tau (2)** — meio
- **Sigma (3)** — mais fraco

Você não verá esses rótulos no jogo. Eles são atribuídos comparando diretamente as estatísticas de atualização.

### Comparação no jogo

Ignore as letras das classes (S, X, etc.) e compare as estatísticas:

- Melhor → **Teta**
- Segundo → **Tau**
- Pior → **Sigma**

**A classe não determina a classificação.** As atualizações da Classe X podem ter desempenho superior ou inferior ao da Classe S.

## Corvetas

Os Corvettes diferem de outras plataformas: eles podem ter **até três conjuntos de atualização separados**.

- **Atualizações cosméticas** são mostradas como `Cn`.
- **Atualizações do reator** são mostradas como `Rn`.

O solucionador pode sugerir atualizações cosméticas para desempenho em vez de aparência, embora as diferenças geralmente sejam pequenas.

## Construções recomendadas

Para **Exosuits** e **Exocraft**, as células sobrecarregadas são fixas e os layouts viáveis ​​são limitados.
A ferramenta fornece **compilações recomendadas selecionadas manualmente** refletindo as combinações ideais.

Sugestões e layouts alternativos são bem-vindos nas discussões do projeto:
https://github.com/jbelew/nms_optimizer-web/discussions

## Salvando, carregando e compartilhando

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Load** — Carregue um arquivo `.nms` salvo para restaurar um layout.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Salvar** — Baixe o layout atual como um arquivo `.nms`.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Compartilhar** — Gere um link que outras pessoas possam abrir diretamente no otimizador.
- <radix-icon name="CameraIcon" size="20" color="var(--accent-11)"></radix-icon> **Screenshot** — Gere uma captura de tela do layout atual.