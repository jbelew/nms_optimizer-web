# Política de Privacidade do NMS Optimizer: Seus Dados e Segurança

**Última atualização:** 16 de março de 2026

Sua privacidade é importante para nós. Esta Política de Privacidade explica como o **NMS Optimizer** ("nós", "nos" ou "nosso") coleta, utiliza e protege suas informações quando você usa nossa aplicação web e seu motor de otimização associado.

## 1. Coleta de Informações

O NMS Optimizer foi projetado como uma ferramenta focada em privacidade.

- **Nenhuma Informação Pessoal:** Não coletamos informações de identificação pessoal (PII), como seu nome, endereço de e-mail ou endereço físico. Não há sistema de login ou de contas.
- **Armazenamento Local:** A aplicação usa o **LocalStorage** do seu navegador para salvar suas preferências e o estado das suas builds. Esses dados permanecem no seu dispositivo e não são transmitidos para nossos servidores nem armazenados por nós.
- **Dados Anônimos de Uso:** Utilizamos o **Google Analytics** para coletar estatísticas anônimas de uso (como visualizações de página e interação com recursos). Esses dados são agregados e não identificam você pessoalmente.

## 2. Infraestrutura Técnica e Monitoramento

Para garantir que a aplicação seja segura, rápida e livre de erros, utilizamos os seguintes provedores de serviço:

- **Cloudflare:** Nossa aplicação é hospedada e protegida via Cloudflare. Eles processam endereços IP e metadados técnicos para oferecer proteção contra DDoS e otimizar a entrega de conteúdo.
- **Heroku (Salesforce):** Nossa API interna de otimização é hospedada no Heroku. O Heroku processa dados técnicos de requisição e mantém registros padrão de servidor (como endereços IP e carimbos de data/hora) para garantir que a API permaneça operacional e segura.
- **Sentry:** Utilizamos o Sentry para monitoramento de erros. Se a aplicação encontrar um bug, um relatório técnico é enviado ao Sentry. Esses relatórios são configurados para excluir seus dados pessoais e são usados estritamente para depuração.

## 3. Processamento de Dados (API Interna)

O NMS Optimizer interage com uma API dedicada, desenvolvida por nós e hospedada no Heroku, para realizar os cálculos de layout de tecnologia.

- **Finalidade:** Quando você executa uma otimização, os parâmetros técnicos da tecnologia e o layout da sua grade são enviados para essa API.
- **Privacidade:** Essa interação é estritamente funcional. Nenhum dado pessoal ou identificador persistente de usuário é enviado com essas requisições. Os dados são processados em memória e não são armazenados em banco de dados.

## 4. Segurança dos Dados

Implementamos medidas razoáveis de segurança, incluindo **criptografia SSL/TLS** em todos os dados em trânsito (via Cloudflare e Heroku), para proteger a integridade da aplicação.

## 5. Seu Controle

Como o estado da aplicação é armazenado localmente:

- **Para excluir seus dados:** Basta limpar os "Dados do site" ou o cache do navegador para este domínio.
- **Para desativar o rastreamento:** Você pode usar extensões de navegador (como o uBlock Origin) para impedir a coleta de estatísticas de uso sem afetar o funcionamento do aplicativo.

## 6. Alterações nesta Política

Podemos atualizar nossa Política de Privacidade periodicamente. Informaremos sobre quaisquer alterações atualizando a data de "Última atualização" no topo desta página.

## 7. Fale Conosco

Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco pelo [GitHub Issues](https://github.com/jbelew/nms_optimizer-web/issues).
