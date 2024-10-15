import { css } from "lit";

const style = document.createElement("style");
style.innerHTML = css`
	:root {
		--sd-background-color: #2d2d2d;
		--sd-color-content-primary: #d8d8d8;
		--sd-color-content-secondary: #969696;
		--sd-font-size: 12px;
		--sd-line-height: calc(var(--sd-font-size) * 1.333);

		background-color: var(--sd-background-color);
		color: var(--sd-color-content-primary);
		font-size: var(--sd-font-size);
		font-family:
			System,
			"Segoe UI",
			Arial,
			Roboto,
			Helvetica sans-serif;
		line-height: var(--sd-line-height);
		text-rendering: optimizeLegibility;
	}

	::-webkit-scrollbar {
		width: 4px;
	}

	::-webkit-scrollbar-track {
		background-color: #262626;
	}

	::-webkit-scrollbar-thumb {
		background-color: #666666;
		border-radius: 2px;
	}
`.cssText;

document.head.appendChild(style);
