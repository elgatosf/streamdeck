/**
 * Provides global setup for Jest, ensuring the timezone is standardized to UTC.
 */
export default function () {
	process.env.TZ = "UTC";
}
