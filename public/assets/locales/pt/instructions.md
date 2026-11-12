# Instruções do NMS Optimizer: Módulos e Espaços Supercarregados

## Primeiros Passos com a Grade

- Selecione um **Tipo de Plataforma** (Nave, Multiferramenta, Corveta, etc.) com o botão <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon>.
- **Clique** ou **toque duas vezes** (celular) em um espaço vazio para alternar seu estado **Supercarregado**.
- **Ctrl-clique** (Windows) / **⌘-clique** (Mac) / **toque uma vez** (celular) em um espaço para alternar seu estado **ativo** ou **inativo**.
- **Controles do teclado:** Pressione as **teclas de seta** (↑, ↓, ←, →) e **Home** / **End** para mover o foco. Pressione **S** ou **Shift+Enter** para alternar o estado **Supercarregado**. Pressione **Espaço** ou **Enter** para alternar o estado **ativo** ou **inativo**.
- Use os **interruptores de linha** para ativar ou desativar uma linha inteira. _(Os interruptores de linha são bloqueados após posicionar módulos na grade.)_
- Clique no botão **Seleção de Módulos** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> em uma **Categoria de Tecnologia** para ativar ou desativar módulos individuais e visualizar as dimensões necessárias da **Janela de Cálculo**.
- Alterne o **Modo de Foco** <radix-icon name="EyeOpenIcon" size="20" color="var(--accent-11)"></radix-icon> para reduzir distrações visuais e melhorar a legibilidade do texto.

> 💡 **Nota:**
> **Restrições de Espaço** se aplicam a Exotrajes e Exoveículos. Os Exoveículos usam um **Layout Padrão da Grade** fixo onde os espaços não podem ser alterados. Os Exotrajes possuem posições fixas para espaços supercarregados, permitindo alterar apenas os estados ativo e inativo dos espaços.

## Antes de Começar

Esta ferramenta foi projetada para **otimização de fim de jogo (endgame)** e produz os melhores resultados quando:

- A maioria ou todos os espaços da grade estão ativos.
- Todos os módulos de cada **Categoria de Tecnologia** estão desbloqueados.
- Você possui **três módulos de atualização procedimentais** por **Categoria de Tecnologia**.

Você pode otimizar configurações parciais, mas o solucionador é voltado para **Tipos de Plataforma** totalmente aprimorados.

## Dicas de Uso

Os espaços supercarregados são limitados. Distribua-os entre várias **Categorias de Tecnologia** para obter o maior bônus total:

- **Não atribua todos os espaços supercarregados à primeira Categoria de Tecnologia.** Isso reduz o bônus disponível para os demais sistemas.
- Atribua **2 a 3 espaços supercarregados** à sua **Categoria de Tecnologia** de maior prioridade.
- Reserve **1 ou mais espaços supercarregados** para uma segunda **Categoria de Tecnologia**.
- Depois que todos os espaços supercarregados estiverem ocupados, otimize primeiro as **Categorias de Tecnologia** que exigem dimensões maiores de **Janela de Cálculo**.
- Defina suas prioridades e deixe o solucionador calcular o posicionamento ideal dos módulos.

### Janela de Cálculo e Alertas de Otimização

Cada **Categoria de Tecnologia** exige uma **Janela de Cálculo** (`largura × altura`) baseada na sua **Seleção de Módulos** ativa.

- Se nenhuma região contígua de espaços ativos comportar a **Janela de Cálculo** necessária, um **Alerta de Otimização** (**Padrão sem Encaixe**) será exibido.
- No alerta, você pode executar uma **Resolução Forçada** (recozimento simulado completo nos espaços disponíveis) ou cancelar, usar **Redefinir** nas categorias já posicionadas e otimizar em outra ordem.
- **Dica Profissional:** Defina temporariamente espaços específicos como **inativos** antes de otimizar para guiar onde a **Janela de Cálculo** será posicionada.

## Ordem de Classificação dos Módulos (Theta / Tau / Sigma)

A **Ordem de Classificação dos Módulos** (`Theta → Tau → Sigma`) classifica os módulos de atualização procedimentais **pelo valor dos atributos**, e não pela classe da atualização:

- **Theta (1)** — maiores atributos
- **Tau (2)** — atributos intermediários
- **Sigma (3)** — menores atributos

Esses rótulos não aparecem dentro do jogo. Compare diretamente os valores dos atributos das suas atualizações procedimentais:

- Maiores atributos → **Theta**
- Segundos maiores atributos → **Tau**
- Menores atributos → **Sigma**

**A classe da atualização não determina a Ordem de Classificação dos Módulos.** Uma atualização de Classe X pode ter atributos maiores ou menores que uma atualização de Classe S.

## Corvetas

As Corvetas suportam até **três Grupos de Módulos de atualização separados** dentro de uma mesma **Categoria de Tecnologia**:

- **Módulos cosméticos** usam o rótulo `Cn`.
- **Módulos de reator** usam o rótulo `Rn`.

O solucionador prioriza bônus de atributos em vez da aparência visual ao posicionar módulos cosméticos.

## Builds Recomendadas

Exotrajes e Exoveículos possuem espaços supercarregados fixos e menos permutações de layout. Use o menu **Builds Recomendadas** para carregar layouts selecionados para configurações comuns.

Envie sugestões de layouts ou comentários nas discussões do projeto:
<https://github.com/jbelew/nms_optimizer-web/discussions>

## Salvando, Carregando e Compartilhando

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Carregar Build** — Abre um **Arquivo de Build** `.nms` salvo no disco.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Salvar Build** — Baixa o layout atual como um **Arquivo de Build** `.nms`.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Compartilhar Build** — Gera um URL de **Grade Compartilhada** que abre seu layout no otimizador.
- <radix-icon name="CameraIcon" size="20" color="var(--accent-11)"></radix-icon> **Capturar Tela da Build** — Captura uma imagem PNG do layout atual da grade.
