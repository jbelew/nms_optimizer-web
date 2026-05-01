# Política de Privacidade do NMS Optimizer: Seus Dados e Segurança

**Última Atualização:** 16 de março de 2026

Sua privacidade é importante para nós. Esta Política de Privacidade explica como o **NMS Optimizer** ("nós" ou "nosso") coleta, usa e protege suas informações ao utilizar nossa aplicação web e seu motor de otimização associado.

---

## 1. Coleta De Informações

O NMS Optimizer foi projetado para ser uma ferramenta focada em privacidade.

- **Nenhuma Informação Pessoal:** Não coletamos informações de identificação pessoal (PII), como seu nome, endereço de e-mail ou endereço físico. Não existe sistema de login ou contas.
- **Armazenamento Local:** A aplicação utiliza o **LocalStorage** do seu navegador para salvar suas preferências e o estado das suas builds. Esses dados permanecem no seu dispositivo e não são transmitidos aos nossos servidores nem armazenados por nós.
- **Dados De Uso Anônimos:** Utilizamos o **Google Analytics** para coletar estatísticas de uso anônimas (como visualizações de página e interação com recursos). Esses dados são agregados e não identificam você pessoalmente.

## 2. Infraestrutura Técnica E Monitoramento

Para garantir que a aplicação seja segura, rápida e livre de bugs, utilizamos os seguintes provedores de serviços:

- **Cloudflare:** Nossa aplicação é hospedada e protegida via Cloudflare. Eles processam endereços IP e metadados técnicos para fornecer proteção DDoS e otimizar a entrega de conteúdo.
- **Heroku (Salesforce):** Nossa API interna de otimização é hospedada no Heroku. O Heroku processa dados técnicos de requisição e mantém logs padrão do servidor (ex: endereços IP e carimbos de data/hora) para garantir que a API permaneça operacional e segura.
- **Sentry:** Utilizamos o Sentry para monitoramento de erros. Se a aplicação encontrar um bug, um relatório técnico é enviado ao Sentry. Esses relatórios são configurados para excluir seus dados pessoais e são usados estritamente para depuração.

## 3. Processamento De Dados (API Interna)

O NMS Optimizer interage com uma API dedicada, de nossa autoria e hospedada no Heroku, para realizar os cálculos de layout de tecnologia.

- **Finalidade:** Quando você realiza uma otimização, os parâmetros técnicos da tecnologia e seu layout de grade são enviados para esta API.
- **Privacidade:** Esta interação é estritamente funcional. Nenhum dado pessoal ou identificador persistente de usuário é enviado com essas requisições. Os dados são processados em memória e não são persistidos em um banco de dados.

## 4. Segurança De Dados

Implementamos medidas de segurança razoáveis, incluindo **criptografia SSL/TLS** em todos os dados em trânsito (via Cloudflare e Heroku), para proteger a integridade da aplicação.

## 5. Seu Controle

Como o estado da sua aplicação é armazenado localmente:

- **Para Excluir seus Dados:** Basta limpar os "Dados do Site" ou o cache do seu navegador para este domínio.
- **Para Desativar o Rastreamento:** Você pode usar extensões de navegador (como o uBlock Origin) para impedir a coleta de dados de uso sem afetar a funcionalidade do app.

## 6. Alterações Nesta Política

Podemos atualizar nossa Política de Privacidade de tempos em tempos. Notificaremos você sobre quaisquer alterações atualizando a data de "Última Atualização" no topo desta página.

## 7. Contato

Se você tiver alguma dúvida sobre esta Política de Privacidade, pode nos contatar via [GitHub Issues](https://github.com/jbelew/nms_optimizer-web/issues).
