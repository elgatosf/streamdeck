import type { MessageGateway } from "../messaging";
import { stringFormatter } from "./format";
import type { Logger } from "./logger";
import type { LogEntry, LogTarget } from "./target";

export const LOGGING_WRITE_ROUTE = "#internal:logger.write";

/**
 * Creates a log target that that sends the log entry to the router.
 * @param router Router to which log entries should be sent to.
 * @returns The log target, attached to the router.
 */
export function createRoutedLogTarget(router: MessageGateway<unknown>): LogTarget {
	const format = stringFormatter({ dataOnly: true });

	return {
		write: (entry: LogEntry): void => {
			router.fetch({
				body: {
					level: entry.level,
					message: format(entry),
					scope: entry.scope
				} satisfies JsonSafeLogEntry,
				path: LOGGING_WRITE_ROUTE,
				unidirectional: true
			});
		}
	};
}

/**
 * Registers a route handler on the router, propagating any log entries to the specified logger for writing.
 * @param router Router to receive inbound log entries on.
 * @param logger Logger responsible for logging log entries.
 */
export function registerCreateLogEntryRoute(router: MessageGateway<unknown>, logger: Logger): void {
	router.route<JsonSafeLogEntry>(LOGGING_WRITE_ROUTE, (req, res) => {
		if (req.body === undefined) {
			return res.fail();
		}

		const { level, message, scope } = req.body;
		if (level === undefined) {
			return res.fail();
		}

		logger.write({ level, data: [message], scope });
		return res.success();
	});
}

/**
 * Defines a JSON safe {@link LogEntry}.
 */
export type JsonSafeLogEntry = Omit<LogEntry, "data"> & {
	/**
	 * The log message.
	 */
	message: string;
};
