import ejs from "ejs";
import markdownit from "markdown-it";

import { EnumStructure, ObjectStructure, SerializationContext, type Structure } from "../ast/index.js";
import { ContentBuilderContext, type RenderableStructure } from "./context.js";

/**
 * Builds a markdown string for the specified structure.
 * @param structure Structure to render.
 * @param ctx Content context.
 * @returns The markdown string that represents the structure.
 */
export function toMarkdown(structure: RenderableStructure, ctx?: ContentBuilderContext): string {
	// Build the content for the structure; this will also capture aliased structures.
	ctx ??= new ContentBuilderContext();
	const structureContent = renderStructure(structure, ctx);

	const structures: {
		/**
		 *
		 */
		alias: string;
		/**
		 *
		 */
		content: string;
	}[] = [];

	// Iterate over the aliased structures, and build their contents.
	for (const ref of ctx.getAliasedStructures()) {
		if (ref.alias === structure.alias) {
			continue;
		}

		structures.push({
			alias: ref.alias!,
			content: renderStructure(ref, ctx),
		});
	}

	// Finally, concat the aliased structures content in order, prefixed with the original structure content.
	return (
		structureContent +
		structures
			.sort(({ alias: a }, { alias: b }) => a.localeCompare(b))
			.map(({ content }) => content)
			.join("\n\n")
	);
}

/**
 * Recursively renders the structure, and the anonymous types it references.
 * @param structure Structure to render.
 * @param ctx Content context.
 * @returns HTML string that details this structure, and it's anonymous child types.
 */
function renderStructure(structure: RenderableStructure, ctx: ContentBuilderContext): string {
	return ctx.usingBreadcrumb(structure.alias, () => {
		if (isEnumOrObject(structure)) {
			return renderEnumOrObject(structure, ctx);
		}

		return structure.types.reduce((content, structure) => {
			// Ignore inline types.
			if (!isEnumOrObject(structure)) {
				return content;
			}

			// Render aliased structures via the context.
			if (structure.isAliased()) {
				ctx.addAliasedStructure(structure);
				return content;
			}

			// Otherwise render the structure.
			return content + renderEnumOrObject(structure, ctx);
		}, "");
	});
}

/**
 * Recursively renders the enum or object structure, and the anonymous types it references.
 * @param structure Structure to render.
 * @param ctx Content context.
 * @returns HTML string that details this structure, and it's anonymous child types.
 */
function renderEnumOrObject(structure: EnumStructure | ObjectStructure, ctx: ContentBuilderContext): string {
	const template = `
<% if (alias) { %>
<%= headingPrefix %> <%= alias %>{#<%= alias.toLowerCase() %>}
<% } %>
<%- description ?? "" %>
<p>
	<strong><%= memberDescriptor %></strong>
</p>
<% for (const member of members) { %>
<ObjectMember name="<%= member.name %>" id="<%= member.id %>" <% if (member.optional) { %>optional<% } %>>
	<ObjectMember.Type><%- member.typeSummary %></ObjectMember.Type>
	<%- member.description %>
	<%- member.typeDetails ?? "" %>
</ObjectMember>
<% } %>`;

	const members = structure.members.map((member) => {
		if (member.isMethod()) {
			throw new Error("Methods are not currently supported");
		}

		const data: MemberData = {
			name: member.name,
			id: ctx.createAnchorId(member.name),
			description: mdToHtml(member.description),
			optional: member.isProperty() ? member.optional : false,
		};

		const serializationCtx = serializationContext((ref) => {
			if (ref.isAliased()) {
				ctx.addAliasedStructure(ref);
			} else {
				ctx.usingBreadcrumb(member.name, () => (data.typeDetails = renderStructure(ref, ctx)));
			}
		});

		data.typeSummary = member.serialize(serializationCtx);
		return data;
	});

	return ejs.render(template, {
		alias: structure.alias,
		description: structure.description,
		headingPrefix: ctx.headingPrefix,
		memberDescriptor: structure.isEnum() ? "Enumeration Members" : "Properties",
		members,
	});
}

/**
 * Serialization context that provides short form types for child elements.
 * @param renderRef Function responsible for rendering a referenced type.
 * @returns The serialization context.
 */
function serializationContext(renderRef: (structure: RenderableStructure) => void): SerializationContext {
	const linkTo = (name: string): string => `<a href="#${name.toLowerCase()}">${name}</a>`;

	return new SerializationContext({
		serialize: (ctx, structure): string => {
			if (structure.isEnum() || structure.isObject() || structure.isUnion()) {
				renderRef(structure);
			}

			if (structure.isObject()) {
				return structure.alias ? linkTo(structure.alias) : "object";
			}

			if (structure.isPrimitive()) {
				return structure.type;
			}

			return structure.serialize(ctx);
		},
		preferAlias: () => false,
		unionSeparator: ", ",
	});
}

/**
 * Determines whether the specified structure is an {@link EnumStructure} or {@link ObjectStructure}.
 * @param structure The structure.
 * @returns `true` when the structure is an {@link EnumStructure} or {@link ObjectStructure}; otherwise `false`.
 */
function isEnumOrObject(structure: Structure): structure is EnumStructure | ObjectStructure {
	return structure.isEnum() || structure.isObject();
}

/**
 * Provides information about a type's member.
 */
type MemberData = {
	/**
	 * Optional description that describes the member.
	 */
	description: string | undefined;

	/**
	 * Unique identifier of the member.
	 */
	id: string;

	/**
	 * Name of the member.
	 */
	name: string;

	/**
	 * Determines whether the member is optional.
	 */
	optional: boolean;

	/**
	 * Type summary, for example "string", "object", etc.
	 */
	typeSummary?: string;

	/**
	 * Details that define the type; only applies to anonymous types, i.e. those without an alias.
	 */
	typeDetails?: string;
};

/**
 * Converts the markdown string to HTML.
 * @param md Markdown input string.
 * @returns HTML representation of the markdown string, safe for MDX files.
 */
const mdToHtml = (function () {
	const md = markdownit({ html: true });
	return function (value: string | undefined): string {
		return value ? escapeMdx(md.render(value)) : "";
	};
})();

/**
 * Escapes MDX characters, such as braces / curly-brackets, and back-quotes.
 * @param value Value to escape.
 * @returns Escaped value, safe for MDX.
 */
function escapeMdx(value: string): string {
	return value.replaceAll(/([{}`])/g, (_, char) => `\\${char}`);
}
