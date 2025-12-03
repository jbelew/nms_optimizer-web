import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default {
	plugins: [
		tailwindcss, // Tailwind directives (v4 with tree-shaking)
		autoprefixer, // vendor prefixes
	],
};


