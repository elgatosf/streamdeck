import { html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { SlottedDataListController } from "../controllers/slotted-data-list-controller";

/**
 * Element that offers persisting a value, selected from a drop-down.
 */
@customElement("sd-select")
export class SDSelectElement extends LitElement {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
	];

	/**
	 * Controller responsible for monitoring the slotted options.
	 */
	#dataListController: SlottedDataListController;

	/**
	 * Initializes a new instance of the {@link @SDSelectElement} class.
	 */
	constructor() {
		super();
		this.#dataListController = new SlottedDataListController(this);
	}

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<select>
				${this.#dataListController.dataList.map(
					(opt) => html`<option>${opt.label}</option>`,
					(grp, children) => html`<optgroup label=${ifDefined(grp.label)}>${children}</optgroup>`,
				)}
			</select>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting a value, selected from a drop-down.
		 */
		"sd-select": SDSelectElement;
	}
}
