#!/usr/bin/env bun
/**
 * @file Fetches and caches Hello Games' `.MBIN`-extracted localization JSON tables
 * (`AssistantNMS/App`) and resolves Canonical Game Terms across all supported locales.
 *
 * Usage:
 *   bun .agents/skills/nms-localization/scripts/lookup-mbin.mjs --query "Mining Beam"
 *   bun .agents/skills/nms-localization/scripts/lookup-mbin.mjs --audit
 *   bun .agents/skills/nms-localization/scripts/lookup-mbin.mjs --audit --mismatches --lang de
 *   bun .agents/skills/nms-localization/scripts/lookup-mbin.mjs --query "tech78" --langs en,es,fr,de,pt-br,it,ja
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PRIMARY_BASE = "https://raw.githubusercontent.com/AssistantNMS/App/develop/assets/json";
const FALLBACK_BASE = "https://raw.githubusercontent.com/AssistantNMS/App/master/assets/json";
const CACHE_DIR = path.join(os.tmpdir(), "nms-mbin-cache");

/** App locale -> AssistantNMS `.MBIN` directory code. */
const APP_TO_MBIN_LANG = {
	de: "de",
	en: "en",
	es: "es",
	fr: "fr",
	it: "it",
	pt: "pt-br",
};

/** Ordered from highest to lowest lookup priority. */
const MBIN_TABLES = [
	"Technology.lang.json",
	"UpgradeModules.lang.json",
	"TechnologyModule.lang.json",
	"ConstructedTechnology.lang.json",
	"Products.lang.json",
	"Curiosity.lang.json",
	"Others.lang.json",
	"TechTree.lang.json",
];

/** Explicit aliases where `en/translation.json` shortens or paraphrases an `.MBIN` English name. */
const EXPLICIT_EN_ALIASES = {
	"AI Pilot": "Minotaur AI Pilot",
	"Cadmium Starship Trail": "Cadmium Trail",
	"Chromatic Starship Trail": "Chromatic Trail",
	"Defensive Shields": "Deflector Shield",
	"Efficient Waterjets": "Efficient Water Jets",
	"Emeril Starship Trail": "Emeril Trail",
	"Exocraft Boost": "Exocraft Boosters",
	"Exocraft Boost Module": "Exocraft Boosters",
	"Exocraft Boost Upgrade": "Exocraft Boosters Upgrade",
	"Exocraft Summoning": "Exocraft Summoning Unit",
	"Golden Starship Trail": "Golden Trail",
	"Hi-Powered Sonar": "High-Power Sonar",
	"Launch Thruster Upgrade": "Launch Thrusters Upgrade",
	"Luminance Drive": "Luminance Engine",
	"Mineral Processing Unit": "Mineral Processing Rig",
	"Power Resonator": "Radar Power Resonator",
	"Radar Array": "Minotaur Radar Array",
	"Ricochet Module": "Pulse Spitter Ricochet Module",
	"Salvaged Upgrade Components": "Rebuilt Exosuit Module",
	"Shield Upgrade": "Deflector Shield Upgrade",
	"Starship Shields": "Deflector Shield",
	"Stealth Starship Trail": "Stealth Trail",
	"Toxin Suppressor": "Toxic Suppressor",
	"Toxin Suppressor Upgrade": "Toxic Suppressor Upgrade",
};

const EXPLICIT_KEY_ALIASES = {
	"modules.multi-tool.mining-laser": "Mining Beam",
	"modules.multi-tool.mining-upgrade": "Mining Beam Upgrade",
	"platforms.corvette": "Corvette",
	"platforms.exosuit": "Exosuit",
	"platforms.freighter": "Freighter",
	"technologies.exocraft.mining": "Exocraft Mining Laser",
	"technologies.multi-tool.mining-laser": "Mining Beam",
};

const CLASS_PATTERNS = [
	/^[CSBAX]-Class\s+/i,
	/^Klasse-[CSBAX]-/i,
	/^[CSBAX]-Klasse\s+/i,
	/\s+der\s+[CSBAX]-Klasse$/i,
	/^Mejora\s+de\s+clase\s+[CSBAX]\s+de\s+/i,
	/\s+de\s+clase\s+[CSBAX]$/i,
	/^Amélioration\s+de\s+classe[\s\u00A0]+[CSBAX]\s+pour[\s\u00A0]*:[\s\u00A0]*/i,
	/\s+de\s+classe[\s\u00A0]+[CSBAX]$/i,
	/\s+di\s+classe\s+[CSBAX]$/i,
	/\s+classe[\s\u00A0]+[CSBAX]$/i,
];

/**
 * Normalizes English item strings across British/American spelling and punctuation.
 *
 * @param {string} value - Input string to normalize.
 * @returns {string} Normalized alphanumeric comparison key.
 */
function normalizeEnglish(value) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[’]/g, "'")
		.replace(/[–—]/g, "-")
		.replace(/armour/g, "armor")
		.replace(/ioniser/g, "ionizer")
		.replace(/optimiser/g, "optimizer")
		.replace(/harmoniser/g, "harmonizer")
		.replace(/defence/g, "defense")
		.replace(/infraknife/g, "infra-knife")
		.replace(/bolt caster/g, "boltcaster")
		.replace(/haz-mat/g, "hazmat")
		.replace(/exo-skiff/g, "exo skiff")
		.replace(/igniter/g, "ignitor")
		.replace(/osmotic/g, "osmatic")
		.replace(/gravitino/g, "gravatino")
		.replace(/water-jets/g, "waterjets")
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

/**
 * Expands `%NAME%` placeholders and strips C/B/A/S/X upgrade class wrappers from `Group` labels.
 *
 * @param {string} group - Raw `Group` string from `.MBIN` JSON.
 * @param {string} [itemName] - Localized `Name` field on the same `.MBIN` record.
 * @returns {string} Clean `<Technology> Upgrade` label.
 */
function stripUpgradeClass(group, itemName = "") {
	const expanded = itemName ? group.replaceAll("%NAME%", itemName).trim() : group.trim();

	if (/^Mejora\s+de\s+clase\s+[CSBAX]\s+de\s+/i.test(expanded)) {
		return `Mejora de ${expanded.replace(/^Mejora\s+de\s+clase\s+[CSBAX]\s+de\s+/i, "").trim()}`;
	}

	if (/^Amélioration\s+de\s+classe[\s\u00A0]+[CSBAX]\s+pour[\s\u00A0]*:[\s\u00A0]*/i.test(expanded)) {
		return `Amélioration : ${expanded.replace(/^Amélioration\s+de\s+classe[\s\u00A0]+[CSBAX]\s+pour[\s\u00A0]*:[\s\u00A0]*/i, "").trim()}`;
	}

	for (const pattern of CLASS_PATTERNS) {
		const stripped = expanded.replace(pattern, "").trim();

		if (stripped !== expanded) {
			return stripped;
		}
	}

	return expanded;
}

/**
 * Flattens a nested JSON locale bundle into dot-notation string keys.
 *
 * @param {unknown} node - Parsed JSON value.
 * @param {string} [prefix] - Accumulated dot-path prefix.
 * @returns {Record<string, string>} Flat key-value map.
 */
function flattenJson(node, prefix = "") {
	/** @type {Record<string, string>} */
	const out = {};

	if (Array.isArray(node)) {
		for (let i = 0; i < node.length; i += 1) {
			Object.assign(out, flattenJson(node[i], `${prefix}[${i}]`));
		}
	} else if (node && typeof node === "object") {
		for (const [key, value] of Object.entries(node)) {
			Object.assign(out, flattenJson(value, prefix ? `${prefix}.${key}` : key));
		}
	} else if (node !== undefined && node !== null) {
		out[prefix] = String(node);
	}

	return out;
}

/**
 * Downloads a single `.lang.json` table into `/tmp/nms-mbin-cache` if missing or refreshed.
 *
 * @param {string} mbinLang - AssistantNMS language directory code.
 * @param {string} table - Table filename (e.g., `Technology.lang.json`).
 * @param {boolean} refresh - Force re-download from GitHub.
 * @returns {Promise<Array<Record<string, unknown>>>} Parsed JSON entries.
 */
async function loadMbinTable(mbinLang, table, refresh) {
	const targetDir = path.join(CACHE_DIR, mbinLang);
	const cacheFile = path.join(targetDir, table);

	if (!refresh && fs.existsSync(cacheFile)) {
		return JSON.parse(fs.readFileSync(cacheFile, "utf8"));
	}

	fs.mkdirSync(targetDir, { recursive: true });

	for (const base of [PRIMARY_BASE, FALLBACK_BASE]) {
		const url = `${base}/${mbinLang}/${table}`;
		const response = await fetch(url, { headers: { "User-Agent": "nms-optimizer-l10n" } });

		if (response.ok) {
			const text = await response.text();
			fs.writeFileSync(cacheFile, text, "utf8");

			return JSON.parse(text);
		}
	}

	return [];
}

/**
 * Builds indexed `.MBIN` lookup maps across all requested `.MBIN` language codes.
 *
 * @param {string[]} mbinLangs - Language codes to load (must include `"en"`).
 * @param {boolean} refresh - Force cache refresh.
 * @returns {Promise<{
 *   byRef: Record<string, Record<string, { file: string; group: string; id: string; name: string }>>;
 *   enNameToRefs: Map<string, string[]>;
 *   enUpgradeGroupToRefs: Map<string, string[]>;
 * }>}
 */
async function buildMbinIndex(mbinLangs, refresh) {
	const uniqueLangs = Array.from(new Set(["en", ...mbinLangs]));
	/** @type {Record<string, Record<string, { file: string; group: string; id: string; name: string }>>} */
	const byRef = Object.fromEntries(uniqueLangs.map((lang) => [lang, {}]));
	/** @type {Map<string, string[]>} */
	const enNameToRefs = new Map();
	/** @type {Map<string, string[]>} */
	const enUpgradeGroupToRefs = new Map();

	await Promise.all(
		uniqueLangs.flatMap((lang) =>
			MBIN_TABLES.map(async (table) => {
				const entries = await loadMbinTable(lang, table, refresh);

				for (const entry of entries) {
					const id = String(entry.Id ?? entry.AppId ?? "");
					const name = typeof entry.Name === "string" ? entry.Name : "";
					const group = typeof entry.Group === "string" ? entry.Group : "";

					if (!id || !name) {
						continue;
					}

					const ref = `${table}:${id}`;
					byRef[lang][ref] = { file: table, group, id, name };

					if (lang === "en") {
						const normName = normalizeEnglish(name);
						const existing = enNameToRefs.get(normName) ?? [];
						existing.push(ref);
						enNameToRefs.set(normName, existing);

						const expandedGroup = group.replaceAll("%NAME%", name);
						const classMatch = /^[CSBAX]-Class\s+(.+)$/i.exec(expandedGroup);
						const directUpgradeGroup =
							table === "UpgradeModules.lang.json" && /Upgrade$/i.test(expandedGroup)
								&& !/^(?:Powerful|Significant|Supreme|Banned|Illegal)\s+/i.test(expandedGroup) ?
								expandedGroup
							:	null;
						const upgradeCandidate = classMatch ? classMatch[1] : directUpgradeGroup;

						if (upgradeCandidate) {
							const normGroup = normalizeEnglish(upgradeCandidate);
							const groupRefs = enUpgradeGroupToRefs.get(normGroup) ?? [];
							groupRefs.push(ref);
							enUpgradeGroupToRefs.set(normGroup, groupRefs);
						}
					}
				}
			}),
		),
	);

	const sortRefs = (/** @type {string[]} */ refs) =>
		refs.sort(
			(a, b) =>
				MBIN_TABLES.indexOf(a.split(":")[0]) - MBIN_TABLES.indexOf(b.split(":")[0]),
		);

	for (const refs of enNameToRefs.values()) {
		sortRefs(refs);
	}

	for (const refs of enUpgradeGroupToRefs.values()) {
		sortRefs(refs);
	}

	return { byRef, enNameToRefs, enUpgradeGroupToRefs };
}

/**
 * Parses CLI flags (`--query`, `--audit`, `--mismatches`, `--lang`, `--langs`, `--refresh`, `--json`).
 *
 * @param {string[]} argv - Raw CLI arguments.
 * @returns {{
 *   audit: boolean;
 *   json: boolean;
 *   lang: string | null;
 *   langs: string[];
 *   mismatches: boolean;
 *   query: string | null;
 *   refresh: boolean;
 * }}
 */
function parseArgs(argv) {
	/** @type {string | null} */
	let query = null;
	/** @type {string | null} */
	let lang = null;
	let langs = Object.values(APP_TO_MBIN_LANG);
	let audit = false;
	let mismatches = false;
	let refresh = false;
	let json = false;

	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];

		if (arg === "--query" && argv[i + 1]) {
			query = argv[i + 1];
			i += 1;
		} else if (arg === "--lang" && argv[i + 1]) {
			lang = argv[i + 1];
			i += 1;
		} else if (arg === "--langs" && argv[i + 1]) {
			langs = argv[i + 1]
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);
			i += 1;
		} else if (arg === "--audit") {
			audit = true;
		} else if (arg === "--mismatches") {
			mismatches = true;
		} else if (arg === "--refresh") {
			refresh = true;
		} else if (arg === "--json") {
			json = true;
		}
	}

	if (!query) {
		audit = true;
	}

	return { audit, json, lang, langs, mismatches, query, refresh };
}

const options = parseArgs(process.argv.slice(2));
const { byRef, enNameToRefs, enUpgradeGroupToRefs } = await buildMbinIndex(
	options.langs,
	options.refresh,
);

if (options.query) {
	const rawQuery = options.query.trim();
	const normQuery = normalizeEnglish(rawQuery);
	/** @type {string[]} */
	const matchedRefs = [];

	for (const [ref, record] of Object.entries(byRef.en)) {
		const normName = normalizeEnglish(record.name);
		const strippedGroup = stripUpgradeClass(record.group);
		const normGroup = normalizeEnglish(strippedGroup);

		if (
			ref.toLowerCase().includes(rawQuery.toLowerCase())
			|| record.id.toLowerCase() === rawQuery.toLowerCase()
			|| normName.includes(normQuery)
			|| (normGroup && normGroup.includes(normQuery))
		) {
			matchedRefs.push(ref);
		}
	}

	matchedRefs.sort((a, b) => {
		const aExact = normalizeEnglish(byRef.en[a].name) === normQuery ? 0 : 1;
		const bExact = normalizeEnglish(byRef.en[b].name) === normQuery ? 0 : 1;

		if (aExact !== bExact) {
			return aExact - bExact;
		}

		return MBIN_TABLES.indexOf(a.split(":")[0]) - MBIN_TABLES.indexOf(b.split(":")[0]);
	});

	const results = matchedRefs.slice(0, 25).map((ref) => ({
		enGroup: stripUpgradeClass(byRef.en[ref].group, byRef.en[ref].name),
		enName: byRef.en[ref].name,
		locales: Object.fromEntries(
			options.langs.map((mbinLang) => {
				const rec = byRef[mbinLang]?.[ref];

				return [
					mbinLang,
					rec ?
						{ group: stripUpgradeClass(rec.group, rec.name), name: rec.name }
					:	null,
				];
			}),
		),
		ref,
	}));

	if (options.json) {
		console.log(JSON.stringify(results, null, 2));
	} else if (results.length === 0) {
		console.log(`No .MBIN entries matched "${options.query}".`);
	} else {
		for (const item of results) {
			console.log(`\n[${item.ref}] "${item.enName}" (Group: "${item.enGroup}")`);

			for (const [mbinLang, val] of Object.entries(item.locales)) {
				if (val) {
					console.log(`  ${mbinLang.padEnd(6)} Name="${val.name}" | UpgradeGroup="${val.group}"`);
				}
			}
		}
	}

	process.exit(0);
}

const repoRoot = process.cwd();
const enPath = path.join(repoRoot, "public/assets/locales/en/translation.json");
const flatEn = flattenJson(JSON.parse(fs.readFileSync(enPath, "utf8")));
const targetLocales = Object.entries(APP_TO_MBIN_LANG).filter(
	([appLang]) => appLang !== "en" && (!options.lang || options.lang === appLang),
);
const flatTargets = Object.fromEntries(
	targetLocales.map(([appLang]) => [
		appLang,
		flattenJson(
			JSON.parse(
				fs.readFileSync(
					path.join(repoRoot, `public/assets/locales/${appLang}/translation.json`),
					"utf8",
				),
			),
		),
	]),
);

const gameKeys = Object.keys(flatEn).filter(
	(key) => key.startsWith("technologies.") || key.startsWith("modules."),
);

/** @type {Record<string, unknown>} */
const matched = {};
/** @type {Array<{ en: string; key: string }>} */
const unmatched = [];

for (const key of gameKeys) {
	const enValue = flatEn[key];
	const lookup = EXPLICIT_KEY_ALIASES[key] ?? EXPLICIT_EN_ALIASES[enValue] ?? enValue;
	const normLookup = normalizeEnglish(lookup);

	let refs = enNameToRefs.get(normLookup) ?? [];
	let mode = "name";

	if (refs.length === 0 && normLookup.endsWith("s")) {
		refs = enNameToRefs.get(normLookup.slice(0, -1)) ?? [];
	}

	if (refs.length === 0 && enUpgradeGroupToRefs.has(normLookup)) {
		refs = enUpgradeGroupToRefs.get(normLookup) ?? [];
		mode = "upgrade_group";
	}

	if (refs.length === 0) {
		unmatched.push({ en: enValue, key });
		continue;
	}

	const chosenRef = refs[0];
	/** @type {Record<string, { caseInsensitiveMatch: boolean; current: string; exactMatch: boolean; official: string }>} */
	const perLocale = {};

	for (const [appLang, mbinLang] of targetLocales) {
		const rec = byRef[mbinLang]?.[chosenRef];

		if (!rec) {
			continue;
		}

		const official =
			mode === "upgrade_group" ? stripUpgradeClass(rec.group, rec.name) : rec.name;
		const current = flatTargets[appLang][key] ?? "";

		perLocale[appLang] = {
			caseInsensitiveMatch: current.toLowerCase() === official.toLowerCase(),
			current,
			exactMatch: current === official,
			official,
		};
	}

	matched[key] = { en: enValue, locales: perLocale, mode, ref: chosenRef };
}

if (options.json) {
	console.log(JSON.stringify({ matched, unmatched }, null, 2));
	process.exit(0);
}

console.log(
	`Audited ${gameKeys.length} game keys against cached .MBIN tables (${CACHE_DIR}): ${Object.keys(matched).length} matched, ${unmatched.length} unmatched.`,
);

for (const [appLang, mbinLang] of targetLocales) {
	const entries = Object.entries(matched);
	const exact = entries.filter(([, m]) => m.locales[appLang]?.exactMatch).length;
	const ci = entries.filter(([, m]) => m.locales[appLang]?.caseInsensitiveMatch).length;
	const diffs = entries.filter(([, m]) => m.locales[appLang] && !m.locales[appLang].caseInsensitiveMatch);

	console.log(
		`  ${appLang} (${mbinLang}): exact=${exact}/${entries.length}, case-insensitive=${ci}/${entries.length}, lexical-diffs=${diffs.length}`,
	);

	if (options.mismatches && diffs.length > 0) {
		for (const [key, m] of diffs) {
			const loc = m.locales[appLang];
			console.log(`    - ${key} (${m.ref}): current="${loc.current}" | .MBIN="${loc.official}"`);
		}
	}
}

if (unmatched.length > 0) {
	console.log(`\nUnmatched keys (${unmatched.length} — post-snapshot or generic upgrade aliases):`);

	for (const item of unmatched) {
		console.log(`  - ${item.key}: "${item.en}"`);
	}
}
