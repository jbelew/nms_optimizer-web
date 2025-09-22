## Ajude a Traduzir o Otimizador NMS

As análises mostram visitantes de todo o mundo e eu adoraria torná-lo mais acessível para a comunidade global de No Man's Sky — e é aí que você entra.

## Como Você Pode Ajudar

Estou procurando por jogadores bilíngues para ajudar a traduzir o aplicativo — especialmente para **editar e revisar as traduções em francês, alemão e espanhol geradas por IA**, ou para trabalhar em outros idiomas com fortes comunidades de jogadores de NMS.

Você não precisa ser um tradutor profissional — apenas fluente, familiarizado com o jogo e disposto a ajudar. Com certeza será melhor do que essa bagunça do ChatGPT! Você será creditado (ou permanecerá anônimo, se preferir).

A maioria das strings são rótulos curtos de interface do usuário, dicas de ferramentas ou mensagens de status divertidas.

As traduções são gerenciadas usando [`i18next`](https://www.i18next.com/), com arquivos JSON e Markdown simples. Também usamos o **Crowdin** para gerenciar as contribuições de tradução colaborativa.

## Usando o Crowdin (Recomendado)

Se você quer a maneira mais fácil de contribuir:

1. **Inscreva-se no Crowdin** em [https://crowdin.com](https://crowdin.com/project/nms-optimizer) e solicite acesso ao projeto NMS Optimizer.
2. Uma vez aprovado, você pode **editar as traduções existentes diretamente na interface do usuário da web**, ou enviar suas próprias traduções.
3. O Crowdin lida com diferentes idiomas e garante que suas atualizações sejam sincronizadas com o aplicativo automaticamente.
4. Você pode se concentrar em **revisar as traduções existentes** ou adicionar novas em seu idioma.

> O Crowdin usa códigos de idioma [ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) padrão: `fr` para francês, `de` para alemão, `es` para espanhol, etc.

Esta é a abordagem recomendada se você não está familiarizado com o GitHub ou quer que suas alterações sejam refletidas imediatamente no aplicativo.

## Se Você Estiver Confortável com o GitHub

**Faça um fork do repositório:**
[github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)

**Atualize ou Crie os Arquivos de Tradução:**

- Os rótulos da interface do usuário do aplicativo estão localizados em `/src/i18n/locales/[language_code]/translation.json`.
- O conteúdo de caixas de diálogo maiores é armazenado como arquivos Markdown puros dentro de `/public/locales/[language_code]/`.

Você pode atualizar os arquivos existentes ou criar uma nova pasta para o seu idioma usando o [código ISO 639-1](https://en.wikipedia.org/wiki/List_of-ISO_639-1-codes) (por exemplo, `de` para alemão). Copie os arquivos Markdown e JSON relevantes para essa pasta e atualize o conteúdo de acordo.

> _Exemplo:_ Crie `/public/locales/de/about.md` para o conteúdo do diálogo e `/src/i18n/locales/de/translation.json` para os rótulos da interface do usuário.

**Envie um pull request** quando terminar.

## Não Gosta de Pull Requests?

Sem problemas — basta ir para a [página de Discussões do GitHub](https://github.com/jbelew/nms_optimizer-web/discussions) e iniciar um novo tópico.

Você pode colar suas traduções lá ou fazer perguntas se não tiver certeza por onde começar. Eu cuido do resto.

## Notas

`randomMessages` é exatamente isso — uma lista de mensagens aleatórias que aparecem quando a otimização leva mais do que alguns segundos. Não há necessidade de traduzir todas elas, apenas crie algumas que façam sentido em seu idioma.

Obrigado por ajudar a tornar o Otimizador de Layout de Tecnologia de No Man's Sky melhor para todos! Me avise se tiver alguma dúvida — ficarei feliz em ajudar.
