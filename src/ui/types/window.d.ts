/**
 * Extends the {@link Navigator} to include the experimental {@link https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData NavigatorUAData}.
 */
interface Navigator {
	/**
	 * Information about the browser and operating system of a user, {@link https://developer.mozilla.org/en-US/docs/Web/API/User-Agent_Client_Hints_API learn more}.
	 */
	readonly userAgentData: {
		/**
		 * The platform brand the user-agent is running on.
		 */
		readonly platform: string;
	};
}
