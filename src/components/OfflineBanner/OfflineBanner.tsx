import React, { useEffect, useState } from "react";
import { Trans } from "react-i18next";

import "./OfflineBanner.scss";

const OfflineBanner: React.FC = () => {
	const [isOffline, setIsOffline] = useState(!navigator.onLine);

	useEffect(() => {
		const handleOffline = () => setIsOffline(true);
		const handleOnline = () => setIsOffline(false);

		window.addEventListener("offline", handleOffline);
		window.addEventListener("online", handleOnline);

		return () => {
			window.removeEventListener("offline", handleOffline);
			window.removeEventListener("online", handleOnline);
		};
	}, []);

	if (!isOffline) {
		return null;
	}

	return (
		<div className="offline w-full p-4 text-center">
			<div className="offline__logo mb-4">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 126.75 126.77">
					<g className="layer">
						<path
							fill="#fff"
							d="m62.02 1.25-1.35 1.21S44.69 16.22 44.69 39.87v24.14h-9.66v9.66H15.72V25.4H6.07v33.79H1.24v53.1h14.48v-7.53l19.31 6.95v15.06h9.65v-11.63l4.83 1.83v9.8h9.65v-6.32l3.19 1.21 1.64.58 1.64-.58 3.19-1.21v6.32h9.65v-9.8l4.83-1.83v11.63h9.65v-15.06l19.31-6.95v7.53h14.49v-53.1h-4.83V25.4h-9.65v48.27H92.96v-9.66H83.3V39.87c0-23.65-15.98-37.41-15.98-37.41l-1.35-1.21h-3.95zM64 13.46c3.52 3.81 9.65 11.68 9.65 26.4V64h-4.83V44.69h-9.65V64h-4.83V39.86c0-14.72 6.18-22.59 9.65-26.4H64zM44.69 73.65h38.62v19.31h9.65v-9.65h19.31v11.15L64 111.98 15.73 94.46V83.31h19.31v9.65h9.65V73.65zm4.83 4.83c0 8.01 6.47 14.48 14.48 14.48 8.01 0 14.48-6.47 14.48-14.48h-9.65c0 2.65-2.17 4.83-4.83 4.83-2.65 0-4.83-2.17-4.83-4.83h-9.65z"
						/>
					</g>
				</svg>
			</div>
			<h1 className="offline__title text-2xl font-semibold tracking-widest">
				<Trans i18nKey="offline.title" defaults="-kzzkt- Offline! -kzzkt-" />
			</h1>
			<span className="text-sm sm:text-base">
				<Trans
					i18nKey="offline.message"
					defaults="An internet connection is required to use this application. Please reconnect to access its features."
				/>
			</span>
		</div>
	);
};

export default OfflineBanner;
