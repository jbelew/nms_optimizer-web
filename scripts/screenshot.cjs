const puppeteer = require("puppeteer");

console.log("Screenshot script started.");

(async () => {
	console.log("Attempting to launch browser...");
	const browser = await puppeteer.launch({ headless: "new", dumpio: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
	const page = await browser.newPage();

	try {
		// GitHub Actions may run on localhost:4173 by default for vite preview
		await page.setViewport({ width: 1280, height: 880 });

		// Set localStorage for the target origin before any of its scripts run
		await page.evaluateOnNewDocument(() => {
			localStorage.setItem(
				"gridState",
				JSON.stringify({
					state: {

    "grid": {
        "cells": [
            [
                {
                    "active": true,
                    "adjacency": "none",
                    "adjacency_bonus": 0,
                    "bonus": 0,
                    "image": "starship/pilot.webp",
                    "label": "Pilot Interface",
                    "module": "PI",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "pilot",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.07,
                    "bonus": 0.04,
                    "image": "starship/q-resonator.webp",
                    "label": "Q-Resonator",
                    "module": "QR",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "infra",
                    "total": 0.0428,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "lesser",
                    "adjacency_bonus": -0.02,
                    "bonus": 1,
                    "image": "starship/luminance.webp",
                    "label": "Luminance Drive",
                    "module": "PE",
                    "sc_eligible": true,
                    "supercharged": true,
                    "tech": "pulse",
                    "total": 1.225,
                    "type": "core",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.16,
                    "bonus": 1.1,
                    "image": "starship/photonix.webp",
                    "label": "Photonix Core",
                    "module": "PC",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "pulse",
                    "total": 1.276,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.12,
                    "bonus": 0,
                    "image": "starship/instability.webp",
                    "label": "Instability Drive",
                    "module": "ID",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "pulse",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "lesser",
                    "adjacency_bonus": 0.0002,
                    "bonus": 0.01,
                    "image": "starship/anti-gravity.webp",
                    "label": "Anti-Gravity Well",
                    "module": "LT",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "launch",
                    "total": 0.0102,
                    "type": "core",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.1,
                    "bonus": 0,
                    "image": "starship/efficient.webp",
                    "label": "Efficient Thrusters",
                    "module": "EF",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "launch",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "none",
                    "adjacency_bonus": 0,
                    "bonus": 0,
                    "image": "starship/aquajets.webp",
                    "label": "Aqua-Jets",
                    "module": "AJ",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "aqua",
                    "total": 0,
                    "type": "core",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "none",
                    "adjacency_bonus": 0,
                    "bonus": 0,
                    "image": "starship/apollo.webp",
                    "label": "Apollo Figurine",
                    "module": "AP",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "bobble",
                    "total": 0,
                    "type": "core",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "none",
                    "adjacency_bonus": 0,
                    "bonus": 0,
                    "image": "starship/atlas.webp",
                    "label": "Atlas Figurine",
                    "module": "AT",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "bobble",
                    "total": 0,
                    "type": "core",
                    "value": 0
                }
            ],
            [
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.13,
                    "bonus": 0.4,
                    "image": "starship/infra-upgrade.webp",
                    "label": "Infraknife Accelerator Upgrade Theta",
                    "module": "Xa",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "infra",
                    "total": 0.452,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.18,
                    "bonus": 1,
                    "image": "starship/infra.webp",
                    "label": "Infraknife Accelerator",
                    "module": "IK",
                    "sc_eligible": true,
                    "supercharged": true,
                    "tech": "infra",
                    "total": 1.475,
                    "type": "core",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.1,
                    "bonus": 0,
                    "image": "starship/sublight.webp",
                    "label": "Sub-Light Amplifier",
                    "module": "SL",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "pulse",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.24,
                    "bonus": 1.14,
                    "image": "starship/pulse-upgrade.webp",
                    "label": "Pulse Engine Upgrade Theta",
                    "module": "Xa",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "pulse",
                    "total": 1.4136,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.18,
                    "bonus": 1.13,
                    "image": "starship/pulse-upgrade.webp",
                    "label": "Pulse Engine Upgrade Tau",
                    "module": "Xb",
                    "sc_eligible": true,
                    "supercharged": true,
                    "tech": "pulse",
                    "total": 1.6667,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.16,
                    "bonus": 0.29,
                    "image": "starship/launch-upgrade.webp",
                    "label": "Launch Thruster Upgrade Tau",
                    "module": "Xb",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "launch",
                    "total": 0.3364,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.18,
                    "bonus": 0.3,
                    "image": "starship/launch-upgrade.webp",
                    "label": "Launch Thruster Upgrade Theta",
                    "module": "Xa",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "launch",
                    "total": 0.354,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.12,
                    "bonus": 0.4,
                    "image": "starship/phase-upgrade.webp",
                    "label": "Phase Beam Upgrade Theta",
                    "module": "Xa",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "phase",
                    "total": 0.448,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.1,
                    "bonus": 0.38,
                    "image": "starship/phase-upgrade.webp",
                    "label": "Phase Beam Upgrade Sigma",
                    "module": "Xc",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "phase",
                    "total": 0.418,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "none",
                    "adjacency_bonus": 0,
                    "bonus": 0,
                    "image": "starship/nada.webp",
                    "label": "Nada Figurine",
                    "module": "NA",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "bobble",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                }
            ],
            [
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.12,
                    "bonus": 0.38,
                    "image": "starship/infra-upgrade.webp",
                    "label": "Infraknife Accelerator Upgrade Sigma",
                    "module": "Xc",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "infra",
                    "total": 0.4256,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.13,
                    "bonus": 0.39,
                    "image": "starship/infra-upgrade.webp",
                    "label": "Infraknife Accelerator Upgrade Tau",
                    "module": "Xb",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "infra",
                    "total": 0.4407,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.07,
                    "bonus": 0,
                    "image": "starship/emeril-trail.webp",
                    "label": "Emeril Starship Trail",
                    "module": "ET",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "trails",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.12,
                    "bonus": 1.12,
                    "image": "starship/pulse-upgrade.webp",
                    "label": "Pulse Engine Upgrade Sigma",
                    "module": "Xc",
                    "sc_eligible": true,
                    "supercharged": true,
                    "tech": "pulse",
                    "total": 1.568,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.12,
                    "bonus": 1.07,
                    "image": "starship/flight-assist.webp",
                    "label": "Flight Assist Override",
                    "module": "FA",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "pulse",
                    "total": 1.1984,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.12,
                    "bonus": 0,
                    "image": "starship/recharger.webp",
                    "label": "Launch Atuo-Charger",
                    "module": "RC",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "launch",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.12,
                    "bonus": 0.28,
                    "image": "starship/launch-upgrade.webp",
                    "label": "Launch Thruster Upgrade Sigma",
                    "module": "Xc",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "launch",
                    "total": 0.3136,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.1,
                    "bonus": 0.39,
                    "image": "starship/phase-upgrade.webp",
                    "label": "Phase Beam Upgrade Tau",
                    "module": "Xb",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "phase",
                    "total": 0.429,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "lesser",
                    "adjacency_bonus": 0.0302,
                    "bonus": 1,
                    "image": "starship/phase-beam.webp",
                    "label": "Phase Beam",
                    "module": "PB",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "phase",
                    "total": 1.0302,
                    "type": "core",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "none",
                    "adjacency_bonus": 0,
                    "bonus": 0,
                    "image": "starship/null.webp",
                    "label": "-null- Figurine",
                    "module": "NB",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "bobble",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                }
            ],
            [
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.06,
                    "bonus": 1,
                    "image": "starship/rocket.webp",
                    "label": "Rocket Launger",
                    "module": "RL",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "rocket",
                    "total": 1.06,
                    "type": "core",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.13,
                    "bonus": 0,
                    "image": "starship/cadmium-trail.webp",
                    "label": "Cadmium Starship Trail",
                    "module": "CT",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "trails",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.24,
                    "bonus": 0.06,
                    "image": "starship/polo.webp",
                    "label": "Polo Figurine",
                    "module": "PB",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "trails",
                    "total": 0.3,
                    "type": "core",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.13,
                    "bonus": 0,
                    "image": "starship/stealth-trail.webp",
                    "label": "Stealth Starship Trail",
                    "module": "ST",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "trails",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "lesser",
                    "adjacency_bonus": 0.07,
                    "bonus": 0,
                    "image": "starship/atlantid.webp",
                    "label": "Atlantid Drive",
                    "module": "AD",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "hyper",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "lesser",
                    "adjacency_bonus": 0.0601,
                    "bonus": 0.01,
                    "image": "starship/crimson.webp",
                    "label": "Crimson Core",
                    "module": "HD",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "hyper",
                    "total": 0.0701,
                    "type": "core",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "lesser",
                    "adjacency_bonus": 0.0401,
                    "bonus": 0,
                    "image": "starship/cadmium.webp",
                    "label": "Cadmium Drive",
                    "module": "CD",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "hyper",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "lesser",
                    "adjacency_bonus": 0.0001,
                    "bonus": 0.01,
                    "image": "starship/aeron.webp",
                    "label": "Aeron Shields",
                    "module": "DS",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "shield",
                    "total": 0.0101,
                    "type": "core",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "lesser",
                    "adjacency_bonus": 0.04,
                    "bonus": 0.07,
                    "image": "starship/fourier.webp",
                    "label": "Fourier De-Limiter",
                    "module": "FD",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "phase",
                    "total": 0.0728,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "none",
                    "adjacency_bonus": 0,
                    "bonus": 0,
                    "image": "starship/cargo.webp",
                    "label": "Cargo Scan Deflector",
                    "module": "CD",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "cargo_scanner",
                    "total": 0,
                    "type": "core",
                    "value": 0
                }
            ],
            [
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.07,
                    "bonus": 0.056,
                    "image": "starship/tubes.webp",
                    "label": "Large Rocket Tubes",
                    "module": "LR",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "rocket",
                    "total": 0.0599,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.18,
                    "bonus": 0,
                    "image": "starship/chromatic-trail.webp",
                    "label": "Chromatic Starship Trail",
                    "module": "RT",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "trails",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.25,
                    "bonus": 0.05,
                    "image": "starship/artemis.webp",
                    "label": "Artemis Figurine",
                    "module": "AB",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "trails",
                    "total": 0.0625,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.18,
                    "bonus": 0,
                    "image": "starship/golden-trail.webp",
                    "label": "Golden Starship Trail",
                    "module": "GT",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "trails",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "lesser",
                    "adjacency_bonus": 0.0601,
                    "bonus": 0,
                    "image": "starship/emeril.webp",
                    "label": "Emeril Drive",
                    "module": "ED",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "hyper",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.19,
                    "bonus": 0.32,
                    "image": "starship/hyper-upgrade.webp",
                    "label": "Crimson Core Upgrade Theta",
                    "module": "Xa",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "hyper",
                    "total": 0.3808,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.15,
                    "bonus": 0.31,
                    "image": "starship/hyper-upgrade.webp",
                    "label": "Crimson Core Upgrade Tau",
                    "module": "Xb",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "hyper",
                    "total": 0.3565,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.16,
                    "bonus": 0.3,
                    "image": "starship/shield-upgrade.webp",
                    "label": "Shield Upgrade Theta",
                    "module": "Xa",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "shield",
                    "total": 0.348,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.12,
                    "bonus": 0.07,
                    "image": "starship/ablative.webp",
                    "label": "Ablative Armor",
                    "module": "AA",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "shield",
                    "total": 0.0784,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "none",
                    "adjacency_bonus": 0,
                    "bonus": 0,
                    "image": "starship/conflict.webp",
                    "label": "Conflict Scanner",
                    "module": "CS",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "conflict_scanner",
                    "total": 0,
                    "type": "core",
                    "value": 0
                }
            ],
            [
                {
                    "active": true,
                    "adjacency": "none",
                    "adjacency_bonus": 0,
                    "bonus": 0,
                    "image": "starship/teleport.webp",
                    "label": "Teleport Receiver",
                    "module": "TP",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "teleporter",
                    "total": 0,
                    "type": "core",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.12,
                    "bonus": 0,
                    "image": "starship/temporal-trail.webp",
                    "label": "Temporal Starship Trail",
                    "module": "TT",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "trails",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.18,
                    "bonus": 0.05,
                    "image": "starship/squid.webp",
                    "label": "Tentacled Figurine",
                    "module": "SB",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "trails",
                    "total": 0.059,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.12,
                    "bonus": 0,
                    "image": "starship/sputtering-trail.webp",
                    "label": "Sputtering Starship Trail",
                    "module": "SP",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "trails",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "lesser",
                    "adjacency_bonus": 0.0301,
                    "bonus": 0,
                    "image": "starship/indium.webp",
                    "label": "Indium Drive",
                    "module": "ID",
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "hyper",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.15,
                    "bonus": 0.3,
                    "image": "starship/hyper-upgrade.webp",
                    "label": "Crimson Core Upgrade Sigma",
                    "module": "Xc",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "hyper",
                    "total": 0.345,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.12,
                    "bonus": 0,
                    "image": "starship/emergency.webp",
                    "label": "Emergency Warp Unit",
                    "module": "EW",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "hyper",
                    "total": 0,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.12,
                    "bonus": 0.29,
                    "image": "starship/shield-upgrade.webp",
                    "label": "Shield Upgrade Tau",
                    "module": "Xb",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "shield",
                    "total": 0.3248,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "greater",
                    "adjacency_bonus": 0.12,
                    "bonus": 0.28,
                    "image": "starship/shield-upgrade.webp",
                    "label": "Shield Upgrade Sigma",
                    "module": "Xc",
                    "sc_eligible": true,
                    "supercharged": false,
                    "tech": "shield",
                    "total": 0.3136,
                    "type": "bonus",
                    "value": 0
                },
                {
                    "active": true,
                    "adjacency": "none",
                    "adjacency_bonus": 0,
                    "bonus": 0,
                    "image": "starship/economy.webp",
                    "label": "Economy Scanner",
                    "module": "ES",
                    "module_position": [
                        9,
                        5
                    ],
                    "sc_eligible": false,
                    "supercharged": false,
                    "tech": "economy_scanner",
                    "total": 0,
                    "type": "core",
                    "value": 0
                }
            ]
        ],
        "height": 6,
        "width": 10
    },
    "isSharedGrid": false,
    "gridFixed": false,
    "superchargedFixed": false,
    "initialGridDefinition": {
        "grid": [
            [
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                }
            ],
            [
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                }
            ],
            [
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                }
            ],
            [
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                }
            ],
            [
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                }
            ],
            [
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                },
                {
                    "active": true
                }
            ]
        ],
        "gridFixed": false,
        "superchargedFixed": false
    },
    "selectedPlatform": "sentinel"

					},
					version: 0,
				})
			);
			localStorage.setItem("selectedPlatform", "sentinel");
		});

		await page.goto("http://localhost:4173", { waitUntil: "networkidle0" });
		await page.screenshot({ path: "public/assets/img/screenshots/screenshot.png", fullPage: true });
		console.log("Taking standard screenshot ...");
		await page.screenshot({
			path: "public/assets/img/screenshots/screenshot_desktop.png",
			fullPage: true,
		});

		await page.setViewport({ width: 375, height: 667 });
		await page.goto("http://localhost:4173", { waitUntil: "networkidle0" });
		// Inject CSS to hide scrollbars for the mobile screenshot
		await page.addStyleTag({ content: `
			body::-webkit-scrollbar {
				display: none;
			}
			html::-webkit-scrollbar {
				display: none;
			}
		` });
		console.log("Taking mobile screenshot ...");
		await page.screenshot({
			path: "public/assets/img/screenshots/screenshot_mobile.png",
			fullPage: false,
		});

		await page.setViewport({ width: 800, height: 1280 });
		await page.goto("http://localhost:4173", { waitUntil: "networkidle0" });
		// Inject CSS to hide scrollbars for the tablet screenshot
		await page.addStyleTag({ content: `
			body::-webkit-scrollbar {
				display: none;
			}
			html::-webkit-scrollbar {
				display: none;
			}
		` });
		console.log("Taking tablet screenshot ...");
		await page.screenshot({
			path: "public/assets/img/screenshots/screenshot_tablet.png",
			fullPage: false,
		});
	} catch (error) {
		console.error("Screenshot script failed:", error);
	} finally {
		await browser.close();
	}
})();
