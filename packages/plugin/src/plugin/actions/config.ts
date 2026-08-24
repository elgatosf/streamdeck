/**
 * Configuration shared by action components that must not depend on the plugin settings module.
 */
export const actionConfig = {
	/**
	 * Determines the behavior of when `onDidReceiveSettings` and `onDidReceiveGlobalSettings` is fired.
	 *
	 * - `false` (default) — `onDidReceiveSettings` and `onDidReceiveGlobalSettings` are only fired
	 * after the settings were updated within the property inspector.
	 * - `true` — `onDidReceiveSettings` and `onDidReceiveGlobalSettings` are fired after the settings
	 * were updated within the property inspector, and after calling `action.getSettings()`.
	 *
	 * This option replaces `useExperimentalMessageIdentifiers`, with inverted behavior.
	 */
	useLegacySettingsBehavior: false,
};
