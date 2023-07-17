/**
 * Defines the target of a request, i.e. whether the request should update the Stream Deck hardware, Stream Deck software (application), or both, when calling `setImage` and `setState`.
 */
export enum Target {
	/**
	 * Hardware and software should be updated as part of the request.
	 */
	HardwareAndSoftware = 0,

	/**
	 * Hardware only should be updated as part of the request.
	 */
	Hardware = 1,

	/**
	 * Software only should be updated as part of the request.
	 */
	Software = 2
}
