## Uso Básico

- **Clique ou toque** no ícone ⚙️ para selecionar sua **Plataforma** (Naves Estelares, Multiferramentas, Corvetas, etc.).
- **Clique ou toque duas vezes** em uma célula para marcá-la como **Supercharged** (até 4 por grade).
- **Ctrl-clique** (Windows) / **⌘-clique** (Mac) ou **toque único** (no celular) para alternar o estado **ativo** de uma célula — as células ativas podem conter módulos.
- Use os **botões de alternância de linha** para ativar ou desativar linhas inteiras. As alternâncias de linha são **desativadas quando os módulos são colocados** e reativadas quando você pressiona **Redefinir grade**.

> 💡 **Observação:** Exosuits e Exocraft têm configurações de grade fixas. As células Exocraft não podem ser modificadas. Em Exosuits, você só pode alternar células ativas ou inativas; alterar o layout sobrealimentado não é suportado.

## Salvando e carregando compilações

Você pode salvar seus layouts otimizados em um arquivo e recarregá-los mais tarde, facilitando o gerenciamento de múltiplas configurações para a mesma plataforma ou o compartilhamento de construções com amigos.

- **Salvar compilação** — Clique no ícone salvar para baixar seu layout atual como um arquivo `.nms`. Você será solicitado a nomear sua compilação; a ferramenta gera automaticamente nomes temáticos como `"Corvette - Crusade of the Starfall.nms"` que você pode personalizar.
- **Load Build** — Clique no ícone de carregamento para carregar um arquivo `.nms` salvo anteriormente. Sua grade será atualizada imediatamente para corresponder ao layout salvo, incluindo todos os posicionamentos de módulos e posições de células sobrecarregadas.

Os arquivos de compilação são validados quanto à integridade e compatibilidade — se uma compilação foi salva em um tipo de plataforma diferente ou está corrompida, a ferramenta informará você.

## Antes de começar

Esta ferramenta é para **jogadores finais** otimizando o layout de tecnologia de sua plataforma para máxima eficiência. Funciona melhor quando:

- Você desbloqueou **a maioria ou todas as células** em sua plataforma (Starship, Exosuit, Exocraft ou Multi-Tool).
- Você tem acesso a **todas as tecnologias relevantes**.
- Você possui um **conjunto completo de três módulos de atualização** de acordo com a tecnologia aplicável.

Se você ainda estiver desbloqueando células ou coletando módulos, a ferramenta ainda poderá fornecer insights, mas foi projetada principalmente para **plataformas totalmente atualizadas**.

## Informações sobre Corvetas

Os Corvettes funcionam de maneira um pouco diferente de outras plataformas – em vez de apenas um conjunto de atualizações, eles podem ter até três.

- **Atualizações cosméticas** são mostradas como `Cn`.
- **Atualizações do reator** são mostradas como `Rn`.

O solucionador também irá sugerir as melhores atualizações cosméticas se você preferir priorizar o desempenho em vez da aparência – embora, na prática, as compensações sejam mínimas na maioria das vezes.

Tenha em mente que um subsistema de tecnologia Corvette totalmente atualizado ocupa **muito** espaço. Com 60 slots de tecnologia completos, você normalmente só terá espaço para três ou quatro **resoluções min/máx**, então escolha com sabedoria.

## Construções recomendadas

Para plataformas como **Exosuits** e **Exocraft**, onde as células sobrecarregadas são fixas, o número de layouts viáveis ​​é **extremamente limitado**. Em vez de lidar com bilhões de permutações como fazemos com naves estelares ou ferramentas múltiplas, estamos trabalhando com apenas algumas possibilidades de melhor caso.

Isso permite que a ferramenta ofereça **construções recomendadas** — layouts cuidadosamente escolhidos a dedo e altamente opinativos, refletindo as melhores combinações disponíveis. O sistema também oferece suporte a **múltiplas compilações por plataforma**, adaptadas a diferentes casos de uso. Por exemplo:

- O **Minotaur** inclui uma **compilação de uso geral** (para quando você estiver testando-o ativamente) e uma **compilação de suporte de IA dedicada** (otimizada para implantação remota).

Outras plataformas podem incluir **variantes especializadas no futuro** — como uma **configuração de corrida Pilgrim** ou um **Exosuit com scanner** — dependendo do feedback e da demanda do usuário.

Se você tiver comentários ou quiser sugerir configurações alternativas, sinta-se à vontade para [iniciar uma discussão](https://github.com/jbelew/nms_optimizer-web/discussions) — essas compilações são selecionadas, não geradas automaticamente, e as contribuições da comunidade ajudam a torná-las melhores.

## Dicas de uso

As células sobrecarregadas oferecem bônus importantes, mas são limitadas – cada colocação é importante. **Evite combinar cegamente o layout superalimentado do jogo.** Para obter melhores resultados:

- **Comece com uma tecnologia de alto impacto** — uma que se adapta ao seu estilo de jogo e se beneficia de duas ou três células sobrecarregadas, como _Pulse Engine_, _Pulse Spitter_, _Infra-Knife Accelerator_ ou _Neutron Cannon_.
  Marque essas células como sobrecarregadas e resolva.
- **Use suas células sobrecarregadas restantes** para uma tecnologia de segunda prioridade, como _Hyperdrive_, _Scanner_ ou _Mining Beam_, e resolva novamente. Distribuir bônus geralmente é melhor do que acumulá-los todos em uma única tecnologia.
- Depois que suas principais tecnologias forem resolvidas, mude o foco para aqueles com **contagens maiores de módulos** (por exemplo, _Hyperdrive_, _Starship Trails_) antes de ficar sem espaço contíguo.
- O solucionador faz o trabalho pesado — seu trabalho é **priorizar tecnologias** com base em como você joga.

À medida que o espaço da grade fica apertado, pode ser necessário **redefinir algumas tecnologias** e resolvê-las em uma ordem diferente para evitar o temido **Alerta de Otimização**. Com uma nave totalmente atualizada, muitas vezes você ficará com apenas uma célula aberta — ou nenhuma, se estiver otimizando um **Interceptor**.

## Dica profissional

Há matemática real por trás do posicionamento. O solucionador funciona em janelas fixas com base em quantos módulos uma tecnologia requer e geralmente escolhe o layout mais eficiente sem desperdiçar espaço. Mas se as coisas não estão se alinhando:

- Tente **desativar algumas células** para orientar o solucionador em direção a uma janela melhor.
- Um pequeno ajuste pode liberar zonas de posicionamento importantes e melhorar seu layout final.