import fs from "node:fs";
import path from "node:path";
import React from "react";
import { GearIcon, ResetIcon } from "@radix-ui/react-icons";
import { Button, IconButton } from "@radix-ui/themes";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";

describe("Global SVG Icon Pointer-Event Delegation (#767)", () => {
	it("verifies global CSS rules in src/index.css enforce pointer-events: none on SVG icons in interactive controls", () => {
		const cssPath = path.resolve(__dirname, "../../src/index.css");
		const cssContent = fs.readFileSync(cssPath, "utf-8");

		// Ensure the CSS rules exist in src/index.css
		expect(cssContent).toMatch(/button\s+svg/);
		expect(cssContent).toMatch(/\[role="button"\]\s+svg/);
		expect(cssContent).toMatch(/pointer-events:\s*none/);

		// Verify specific interactive control selectors are covered
		const requiredSelectors = [
			"button svg",
			"button svg *",
			'[role="button"] svg',
			'[role="button"] svg *',
			'[role="menuitem"] svg',
			'[role="menuitem"] svg *',
			".rt-BaseButton svg",
			".rt-BaseButton svg *",
		];

		for (const selector of requiredSelectors) {
			expect(cssContent).toContain(selector);
		}
	});

	it("verifies that clicking an SVG icon child inside a button triggers the button's action handler", () => {
		const handleClick = vi.fn();
		render(
			<button aria-label="Action" onClick={handleClick} type="button">
				<svg data-testid="test-svg" height="16" width="16">
					<path d="M0 0h16v16H0z" data-testid="test-path" />
				</svg>
				<span>Click me</span>
			</button>
		);

		const svg = screen.getByTestId("test-svg");
		const pathElement = screen.getByTestId("test-path");

		// Clicking child SVG element bubbles and triggers button action
		fireEvent.click(svg);
		expect(handleClick).toHaveBeenCalledTimes(1);

		// Clicking child path element bubbles and triggers button action
		fireEvent.click(pathElement);
		expect(handleClick).toHaveBeenCalledTimes(2);
	});

	it("verifies that clicking an SVG icon child inside a [role='button'] triggers the action handler", () => {
		const handleClick = vi.fn();
		render(
			<div
				aria-label="Role Button"
				onClick={handleClick}
				onKeyDown={vi.fn()}
				role="button"
				tabIndex={0}
			>
				<ResetIcon data-testid="reset-icon" />
			</div>
		);

		const svg = screen.getByTestId("reset-icon");
		fireEvent.click(svg);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("verifies that clicking an SVG icon child inside a [role='menuitem'] triggers the action handler", () => {
		const handleClick = vi.fn();
		render(
			<div
				aria-label="Menu Item"
				onClick={handleClick}
				onKeyDown={vi.fn()}
				role="menuitem"
				tabIndex={-1}
			>
				<GearIcon data-testid="gear-icon" />
				<span>Settings</span>
			</div>
		);

		const svg = screen.getByTestId("gear-icon");
		fireEvent.click(svg);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("verifies Radix Button and IconButton with child SVG trigger click handlers", () => {
		const handleButtonClick = vi.fn();
		const handleIconButtonClick = vi.fn();

		render(
			<>
				<Button aria-label="Radix Button" onClick={handleButtonClick}>
					<ResetIcon data-testid="radix-btn-icon" />
					<span>Reset</span>
				</Button>
				<IconButton aria-label="Radix Icon Button" onClick={handleIconButtonClick}>
					<GearIcon data-testid="radix-icon-btn-icon" />
				</IconButton>
			</>
		);

		const btnIcon = screen.getByTestId("radix-btn-icon");
		fireEvent.click(btnIcon);
		expect(handleButtonClick).toHaveBeenCalledTimes(1);

		const iconBtnIcon = screen.getByTestId("radix-icon-btn-icon");
		fireEvent.click(iconBtnIcon);
		expect(handleIconButtonClick).toHaveBeenCalledTimes(1);
	});

	it("verifies disabled buttons do not trigger handlers even when child SVG is clicked", () => {
		const handleClick = vi.fn();
		render(
			<button aria-label="Disabled" disabled onClick={handleClick} type="button">
				<ResetIcon data-testid="disabled-icon" />
			</button>
		);

		const svg = screen.getByTestId("disabled-icon");
		fireEvent.click(svg);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("preserves accessibility attributes and tooltip functionality on icon buttons", () => {
		render(
			<ConditionalTooltip label="Reset the grid layout">
				<button aria-label="Reset Grid" data-testid="accessible-btn" type="button">
					<ResetIcon aria-hidden="true" data-testid="accessible-icon" />
				</button>
			</ConditionalTooltip>
		);

		const button = screen.getByTestId("accessible-btn");
		const icon = screen.getByTestId("accessible-icon");

		expect(button).toHaveAttribute("aria-label", "Reset Grid");
		expect(icon).toHaveAttribute("aria-hidden", "true");
	});

	it("verifies computed styles apply pointer-events: none when stylesheet is injected into DOM", () => {
		const cssPath = path.resolve(__dirname, "../../src/index.css");
		const cssContent = fs.readFileSync(cssPath, "utf-8");

		const styleEl = document.createElement("style");
		styleEl.textContent = cssContent;
		document.head.appendChild(styleEl);

		try {
			const container = document.createElement("div");
			container.innerHTML = `
				<button id="test-btn">
					<svg id="btn-svg"><path id="btn-path" d="M0 0" /></svg>
				</button>
				<div role="button" id="role-btn">
					<svg id="role-svg"><path id="role-path" d="M0 0" /></svg>
				</div>
				<div role="menuitem" id="role-menuitem">
					<svg id="menu-svg"><path id="menu-path" d="M0 0" /></svg>
				</div>
				<a class="rt-BaseButton" id="rt-btn">
					<svg id="rt-svg"><path id="rt-path" d="M0 0" /></svg>
				</a>
			`;
			document.body.appendChild(container);

			const btnSvg = document.getElementById("btn-svg");
			const btnPath = document.getElementById("btn-path");
			const roleSvg = document.getElementById("role-svg");
			const rolePath = document.getElementById("role-path");
			const menuSvg = document.getElementById("menu-svg");
			const menuPath = document.getElementById("menu-path");
			const rtSvg = document.getElementById("rt-svg");
			const rtPath = document.getElementById("rt-path");

			expect(window.getComputedStyle(btnSvg!).pointerEvents).toBe("none");
			expect(window.getComputedStyle(btnPath!).pointerEvents).toBe("none");
			expect(window.getComputedStyle(roleSvg!).pointerEvents).toBe("none");
			expect(window.getComputedStyle(rolePath!).pointerEvents).toBe("none");
			expect(window.getComputedStyle(menuSvg!).pointerEvents).toBe("none");
			expect(window.getComputedStyle(menuPath!).pointerEvents).toBe("none");
			expect(window.getComputedStyle(rtSvg!).pointerEvents).toBe("none");
			expect(window.getComputedStyle(rtPath!).pointerEvents).toBe("none");

			document.body.removeChild(container);
		} finally {
			document.head.removeChild(styleEl);
		}
	});
});
