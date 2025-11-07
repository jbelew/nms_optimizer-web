
import i18n from "i18next";
import Backend from "i18next-fs-backend";
import { initReactI18next, I18nextProvider } from "react-i18next";
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { DialogProvider } from "./context/DialogContext";
import * as Toast from "@radix-ui/react-toast";
import { Theme } from "@radix-ui/themes";

import { ClientOnly } from "./components/ClientOnly/ClientOnly";

import { DialogProvider } from "./context/DialogContext";



import i18n from "i18next";



import Backend from "i18next-fs-backend";



import { initReactI18next, I18nextProvider } from "react-i18next";



import ReactDOMServer from 'react-dom/server';



import { StaticRouter } from 'react-router-dom';



import App from './App';



import { DialogProvider } from "./context/DialogContext";



import * as Toast from "@radix-ui/react-toast";



import { Theme } from "@radix-ui/themes";







const i18nServer = i18n.createInstance();















await i18nServer







	.use(Backend)







	.use(initReactI18next)







	.init({







		debug: false,







		lng: "en", // Hardcode language for now







		fallbackLng: "en",







		backend: {







			loadPath: "./public/assets/locales/{{lng}}/{{ns}}.json",







		},







		ns: ["translation"],







		defaultNS: "translation",







	});







export async function render(url: string, data: { shipTypes: any, techTree: any }) {







  await i18nServer







    .use(Backend)







    .use(initReactI18next)







    .init({







      debug: false,







      lng: "en", // Hardcode language for now







      fallbackLng: "en",







      backend: {







        loadPath: "./public/assets/locales/{{lng}}/{{ns}}.json",







      },







      ns: ["translation"],







      defaultNS: "translation",







    });







  return ReactDOMServer.renderToString(







    <StaticRouter location={url}>







      <I18nextProvider i18n={i18nServer}>







        <DialogProvider>







          <Theme







            appearance="dark"







            panelBackground="solid"







            accentColor="cyan"







            grayColor="sage"







            scaling="100%"







          >







            <Toast.Provider>







              <Toast.Provider swipeDirection="right">







                <App shipTypes={data.shipTypes} techTree={data.techTree} />







              </Toast.Provider>{" "}







              <Toast.Viewport />







            </Toast.Provider>







          </Theme>







        </DialogProvider>







      </I18nextProvider>







    </StaticRouter>







  );







}


