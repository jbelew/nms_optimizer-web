# Guia do otimizador NMS: bônus de adjacência e otimização de layout

## Uso Básico

- **Clique ou toque** no ícone ⚙️ para selecionar sua **Plataforma** (Naves Estelares, Multiferramentas, Corvetas, etc.).
- **Clique ou toque duas vezes** (no celular) para marcar uma célula como **Supercharged**.
- **Ctrl-clique** (Windows) / **⌘-clique** (Mac) ou **toque único** (no celular) para alternar o estado **ativo** de uma célula.
- Use os **botões de alternância de linha** para ativar ou desativar linhas inteiras. As alternâncias de linha são **desativadas quando os módulos são colocados**.

> 💡 **Nota:** Exosuits e Exocraft têm configurações de grade fixas. As células Exocraft não podem ser modificadas. Nos Exosuits, você só pode alternar células ativas ou inativas; alterar o layout sobrealimentado não é suportado.

## Antes de começar

Esta ferramenta foi projetada para **jogadores finais** otimizando o layout de tecnologia de sua plataforma para máxima eficiência. Funciona melhor quando:

- Você desbloqueou **a maioria ou todas as células** em sua plataforma (Starship, Exosuit, Exocraft ou Multi-Tool).
- Você tem acesso a **todas as tecnologias relevantes**.
- Você possui um **conjunto completo de três módulos de atualização** de acordo com a tecnologia aplicável.

Se você ainda estiver desbloqueando células ou coletando módulos, a ferramenta ainda poderá fornecer insights, mas foi projetada principalmente para **plataformas totalmente atualizadas**.

## Etiquetas Teta / Tau / Sigma

Esses rótulos classificam as atualizações procedimentais **por qualidade estatística**, não por classe. Eles são **termos legados de versões anteriores do jogo**, mantidos para manter a consistência no tema e no estilo.

- **Theta** — melhor atualização processual _(exibida como **1** na grade)_
- **Tau** — meio _(exibido como **2** na grade)_
- **Sigma** — pior _(exibido como **3** na grade)_

Você não verá esses nomes em seu inventário. Eles são atribuídos **comparando as estatísticas reais de atualizações para a mesma tecnologia**.

### Como usar isso no jogo

Ignore a letra da classe (S, X, etc.). Em vez disso, compare as estatísticas diretamente:

- Melhores estatísticas → **Theta (1)**
- Segundo melhor → **Tau (2)**
- Piores estatísticas → **Sigma (3)**

### Classe S vs Classe X

A classe **não** determina a classificação. As atualizações da Classe X podem ser superiores ou inferiores às da Classe S.

- Se uma Classe X tiver as melhores estatísticas, é **Theta (1)**
- Se um Classe S for mais fraco, ele se tornará **Tau (2)** ou **Sigma (3)**

**Resumindo:** Theta / Tau / Sigma significa simplesmente **melhor/médio/pior**, com base apenas nas estatísticas.

## Informações sobre Corvetas

Os Corvettes funcionam de maneira um pouco diferente de outras plataformas – em vez de apenas um conjunto de atualizações, eles podem ter até três.

- **Atualizações cosméticas** são mostradas como `Cn`.
- **Atualizações do reator** são mostradas como `Rn`.

O solucionador também irá sugerir as melhores atualizações cosméticas se você preferir priorizar o desempenho em vez da aparência – embora, na prática, as compensações sejam mínimas na maioria das vezes.

## Construções recomendadas

Para plataformas como **Exosuits** e **Exocraft**, onde as células sobrecarregadas são fixas, o número de layouts viáveis ​​é **extremamente limitado**.
Isso permite que a ferramenta ofereça **construções recomendadas** — layouts cuidadosamente escolhidos a dedo e altamente opinativos, refletindo as melhores combinações disponíveis.

Se você tiver comentários ou quiser sugerir configurações alternativas, sinta-se à vontade para [iniciar uma discussão](https://github.com/jbelew/nms_optimizer-web/discussions) — essas compilações são selecionadas, não geradas automaticamente, e as contribuições da comunidade ajudam a torná-las melhores.

## Salvando, carregando e compartilhando compilações

Você pode salvar seus layouts otimizados, recarregá-los mais tarde ou compartilhá-los com amigos, facilitando o gerenciamento de múltiplas configurações para a mesma plataforma.

- **Salvar compilação** — Clique no ícone salvar para baixar seu layout atual como um arquivo `.nms`. Você será solicitado a nomear sua compilação; a ferramenta também gera automaticamente nomes temáticos como `"Corvette - Crusade of the Starfall.nms"`, que você pode personalizar.
- **Load Build** — Clique no ícone de carregamento para carregar um arquivo `.nms` salvo anteriormente. Sua grade será atualizada imediatamente para corresponder ao layout salvo, incluindo todos os posicionamentos de módulos e posições de células sobrecarregadas.
- **Compartilhar compilação** — Clique no ícone de compartilhamento para gerar um link compartilhável para seu layout atual. Amigos podem usar este link para carregar sua compilação diretamente no otimizador sem precisar do arquivo.

## Dicas de uso

As células sobrecarregadas oferecem bônus importantes, mas são limitadas – cada colocação é importante. **Evite combinar cegamente o layout superalimentado do jogo.** Para obter melhores resultados:

- **Comece com uma tecnologia de alto impacto** — uma que se adapta ao seu estilo de jogo e se beneficia de duas ou três células sobrecarregadas, como _Pulse Engine_, _Pulse Spitter_, _Infra-Knife Accelerator_ ou _Neutron Cannon_.
  Marque essas células como sobrecarregadas e resolva.
- **Use suas células sobrecarregadas restantes** para uma tecnologia de segunda prioridade, como _Hyperdrive_, _Scanner_ ou _Mining Beam_, e resolva novamente. Distribuir bônus geralmente é melhor do que acumulá-los todos em uma única tecnologia.
- Depois que suas principais tecnologias forem resolvidas, mude o foco para aqueles com **contagens maiores de módulos** (por exemplo, _Hyperdrive_, _Starship Trails_) antes de ficar sem espaço contíguo.
- O solucionador faz o trabalho pesado — seu trabalho é **priorizar tecnologias** com base em como você joga.

À medida que o espaço da grade fica apertado, pode ser necessário **redefinir algumas tecnologias** e resolvê-las em uma ordem diferente para evitar o temido **Alerta de Otimização**. Com uma nave totalmente atualizada, você geralmente terá uma grade completamente cheia.

## Dica profissional

Há matemática real por trás do posicionamento. O solucionador procura janelas fixas que correspondam ao número de módulos que uma tecnologia precisa e geralmente encontra o layout com maior eficiência de espaço. Se algo não estiver alinhado, tente **desativar temporariamente algumas células** para direcioná-lo para um local melhor na grade.