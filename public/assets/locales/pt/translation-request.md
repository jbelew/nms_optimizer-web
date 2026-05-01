# Ajude a Traduzir o NMS Optimizer: Participe da Localização Comunitária

## Ajude a Traduzir o NMS Optimizer

As estatísticas mostram visitantes de todo o mundo e eu adoraria torná-lo mais acessível para a comunidade global de No Man's Sky — e é aqui que você entra.

## Como Você Pode Ajudar

Estou procurando jogadores bilíngues para ajudar a traduzir o app — especialmente para **editar e revisar as traduções em francês, alemão, espanhol e português geradas por IA**, ou para trabalhar em outros idiomas com comunidades fortes de jogadores de NMS.

Você não precisa ser um tradutor profissional — basta ser fluente, familiarizado com o jogo e disposto a ajudar. Embora as traduções geradas por IA sejam um ótimo ponto de partida, elas frequentemente perdem o contexto ou as nuances específicas do jogo. Você será creditado (ou poderá permanecer anônimo, se preferir).

La maioria das frases são rótulos curtos de interface, dicas de ferramentas (tooltips) ou mensagens de status divertidas.

## O Fluxo de Trabalho

O NMS Optimizer agora utiliza um **Fluxo de Trabalho de Tradução Baseado Em IA** usando a API do Gemini 2.5 Flash. Isso garante que, toda vez que o conteúdo em inglês é atualizado, todos os outros idiomas suportados sejam atualizados automaticamente em minutos.

No entanto, a IA não é perfeita. Contamos com a comunidade para identificar e corrigir "alucinações" ou terminologia incorreta de NMS.

## Como Contribuir

A maneira mais fácil de contribuir é diretamente pelo GitHub. Você não precisa saber programar para sugerir uma tradução melhor.

1. **Encontre o Arquivo**: Todos os arquivos de localização estão em `/public/assets/locales/[codigo_do_idioma]/`.
    - `translation.json`: Rótulos de interface, tooltips e mensagens de status.
    - `*.md`: Conteúdo para diálogos maiores (Sobre, Instruções, etc.).
2. **Edite Directamente No GitHub**:
    - Navegue até o arquivo do seu idioma (ex: `/public/assets/locales/pt/translation.json`).
    - Clique no **ícone do lápis (Edit this file)**.
    - Faça suas alterações.
    - Clique em **Commit changes...** e o GitHub criará automaticamente um Pull Request para você.
3. **Aguarde a Fusão**: Assim que eu fundir seu PR, o script de IA detectará automaticamente suas edicões humanas e garantirá que elas sejam preservadas em atualizações futuras.

## Idiomas Suportados

Atualmente suportamos:

- `en` (Inglês - Fonte)
- `es` (Espanhol)
- `fr` (Francés)
- `de` (Alemão)
- `pt` (Português)

Se você quiser adicionar um **Novo Idioma**, basta criar uma nova pasta com o [código ISO 639-1](https://pt.wikipedia.org/wiki/ISO_639-1) apropriado e eu o adicionarei à rotação da IA!

## Notas

- **Interpolação**: Você verá tags como `<1></1>` ou `{{techName}}` — **por favor, mantenha-as exatamente como estão**, pois o app as utiliza para inserir conteúdo dinâmico ou estilização.
- **Prioridade Humana**: O script de tradução foi projetado para respeitar edições humanas. Se você alterar um valor em um arquivo JSON, a IA não irá sobrescrevê-lo durante a próxima execução automatizada.

Obrigado por ajudar a tornar o Otimizador de Layout de Tecnologia de No Man's Sky melhor para todos! Deixe-me saber se tiver alguma dúvida — ficarei feliz em ajudar.
