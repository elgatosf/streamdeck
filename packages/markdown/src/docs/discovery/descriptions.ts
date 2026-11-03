import type { JSDocableNode } from "ts-morph";

import type { Description } from "../model.js";

/**
 * Reads the description, and allowed tags, from the JSDoc of a node.
 * @param node Documented node.
 * @param tags Names of the tags to include; other tags, e.g. schema-specific tags, are omitted.
 * @returns Description of the node.
 */
export function getDescription(node: Pick<JSDocableNode, "getJsDocs">, tags: ReadonlySet<string>): Description {
	const docs = node.getJsDocs();
	return {
		text: docs
			.map((doc) => doc.getCommentText() ?? "")
			.filter((text) => text.length > 0)
			.join("\n\n"),
		tags: docs
			.flatMap((doc) => doc.getTags())
			.filter((tag) => tags.has(tag.getTagName()))
			.map((tag) => ({ name: tag.getTagName(), text: tag.getCommentText() ?? "" })),
	};
}
