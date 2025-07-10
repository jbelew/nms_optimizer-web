import { useEffect, useRef } from "react";
import ReactGA from "react-ga4";
import { useLocation } from "react-router-dom";
import { reportWebVitals } from "../reportWebVitals";
import { TRACKING_ID } from "../constants";

/**
 * Custom hook for handling Google Analytics initialization and pageview tracking.
 * @param appVersion The current application version.
 */
export const useAnalytics = (appVersion: string) => {
    const location = useLocation();
    const gaInitialized = useRef(false);
    const initialPageViewSentRef = useRef(false);

    /**
     * Initializes Google Analytics and sets up web vitals reporting.
     * This effect runs only once when the component mounts.
     */
    useEffect(() => {
        if (gaInitialized.current) return;
        ReactGA.initialize(TRACKING_ID, {
            testMode: import.meta.env.DEV,
        });
        ReactGA.set({ app_version: appVersion });
        gaInitialized.current = true;
        reportWebVitals();
    }, [appVersion]);

    /**
     * Sends pageview events to Google Analytics on navigation.
     */
    useEffect(() => {
        if (initialPageViewSentRef.current) {
            ReactGA.send({
                hitType: "pageview",
                page: location.pathname + location.search,
                title: document.title, // Use current document title
                app_version: appVersion,
            });
        } else {
            initialPageViewSentRef.current = true;
        }
    }, [appVersion, location.pathname, location.search]);
};
