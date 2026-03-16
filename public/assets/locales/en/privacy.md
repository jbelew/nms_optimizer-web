# Privacy Policy

**Last Updated:** March 16, 2026

Your privacy is important to us. This Privacy Policy explains how **NMS Optimizer** ("we", "us", or "our") collects, uses, and protects your information when you use our web application and its associated optimization engine.

---

## 1. Information Collection
NMS Optimizer is designed to be a privacy-focused tool.

* **No Personal Information:** We do not collect personally identifiable information (PII) such as your name, email address, or physical address. There is no login or account system.
* **Local Storage:** The application uses your browser's **LocalStorage** to save your preferences and build state. This data stays on your device and is not transmitted to our servers or stored by us.
* **Anonymous Usage Data:** We use **Google Analytics** to collect anonymous usage statistics (such as page views and feature interaction). This data is aggregated and does not identify you personally.

## 2. Technical Infrastructure & Monitoring
To ensure the application is secure, fast, and bug-free, we utilize the following service providers:

* **Cloudflare:** Our application is hosted and secured via Cloudflare. They process IP addresses and technical metadata to provide DDoS protection and optimize content delivery.
* **Heroku (Salesforce):** Our internal optimization API is hosted on Heroku. Heroku processes technical request data and maintains standard server logs (e.g., IP addresses and timestamps) to ensure the API remains operational and secure.
* **Sentry:** We use Sentry for error monitoring. If the application encounters a bug, a technical report is sent to Sentry. These reports are configured to exclude your personal data and are used strictly for debugging.

## 3. Data Processing (Internal API)
NMS Optimizer interacts with a dedicated API, authored by us and hosted on Heroku, to perform technology layout calculations.

* **Purpose:** When you perform an optimization, the technical parameters of the technology and your grid layout are sent to this API.
* **Privacy:** This interaction is strictly functional. No personal data or persistent user identifiers are sent with these requests. Data is processed in memory and is not persisted in a database.

## 4. Data Security
We implement reasonable security measures, including **SSL/TLS encryption** across all data in transit (via Cloudflare and Heroku), to protect the integrity of the application.

## 5. Your Control
Because your application state is stored locally:
* **To delete your data:** Simply clear your browser's "Site Data" or cache for this domain.
* **To opt-out of tracking:** You can use browser extensions (like uBlock Origin) to prevent usage data collection without affecting the app's functionality.

## 6. Changes to This Policy
We may update our Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this page.

## 7. Contact Us
If you have any questions about this Privacy Policy, you can contact us via [GitHub Issues](https://github.com/jbelew/nms_optimizer-web/issues).
