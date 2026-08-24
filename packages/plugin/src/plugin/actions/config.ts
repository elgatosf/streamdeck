/**
 * Configuration shared by action components that must not depend on the plugin settings module.
 */
export const actionConfig = {
	/**
	 * Determines the behavior of when `onDidReceiveSettings` is fired.
	 *
	 * - `false` (default) — `onDidReceiveSettings` is only fired after the settings were updated
	 * within the property inspector.
	 * - `true` — `onDidReceiveSettings` is fired after the settings were updated within the property
	 * inspector, and after calling `action.getSettings()`.
	 *
	 * This option replaces `useExperimentalMessageIdentifiers`, with inverted behavior.
	 */
	useLegacySettingsBehavior: false,
};
