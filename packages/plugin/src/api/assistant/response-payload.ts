/**
 * Provides a payload associated with a response that includes either the result, or an error.
 */
export type ResponsePayload<T> =
	| {
			/**
			 * Error code used to identify the error.
			 */
			readonly code: number;

			/**
			 * User-friendly error message.
			 */
			readonly message: string;
	  }
	| {
			/**
			 * Result associated with the response.
			 */
			readonly result: T;
	  };
