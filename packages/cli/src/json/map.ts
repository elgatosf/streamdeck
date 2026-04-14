import {
	type ArrayNode,
	type DocumentNode,
	type ElementNode,
	type MemberNode,
	type NullNode,
	type ObjectNode,
	type ValueNode,
} from "@humanwhocodes/momoa";
import { type AnyValidateFunction } from "ajv/dist/types";

import { type JsonLocation, type LocationRef } from "../common/location";

/**
 * JSON object map that provides data parsed from an {@link ObjectNode}, and the locations associated with each node.
 */
export class JsonObjectMap<T> {
	/**
	 * Parsed data.
	 */
	public readonly value: JsonObject<T> = {};

	/**
	 * Collection of AST nodes indexed by their instance path (pointer).
	 */
	private readonly nodes = new Map<string, NodeRef>();

	/**
	 * Initializes a new instance of the {@link JsonObjectMap} class.
	 */
	constructor();
	/**
	 * Initializes a new instance of the {@link JsonObjectMap} class.
	 * @param node Source that contains the data.
	 * @param errors JSON schema errors; used to determine invalid types based on the instance path of an error.
	 */
	constructor(node: ValueNode, errors: AnyValidateFunction<T>["errors"]);
	/**
	 * Initializes a new instance of the {@link JsonObjectMap} class.
	 * @param node Source that contains the data.
	 * @param errors JSON schema errors; used to determine invalid types based on the instance path of an error.
	 */
	constructor(node?: ValueNode, errors?: AnyValidateFunction<T>["errors"]) {
		if (node?.type === "Object") {
			this.value = this.aggregate(node, "", errors) as JsonObject<T>;
		}
	}

	/**
	 * Finds the {@link NodeRef} from its {@link instancePath}.
	 * @param instancePath Instance path.
	 * @returns The node associated with the {@link instancePath}.
	 */
	public find(instancePath: string): NodeRef | undefined {
		return this.nodes.get(instancePath);
	}

	/**
	 * Aggregates the {@param node} to an object containing the property values and their paths.
	 * @param node Node to aggregate.
	 * @param pointer Pointer to the {@param node}.
	 * @param errors Errors associated with the JSON used to parse the {@param node}.
	 * @returns Aggregated object.
	 */
	private aggregate(
		node: ArrayNode | DocumentNode | ElementNode | NullNode | ObjectNode | ValueNode,
		pointer: string,
		errors: AnyValidateFunction<T>["errors"],
	): JsonElement | JsonElement[] | JsonObject {
		const nodeRef: NodeRef = {
			location: {
				...node.loc?.start,
				instancePath: pointer,
				key: getPath(pointer),
			},
		};

		this.nodes.set(pointer, nodeRef);

		// Node is considered an invalid type, so ignore the value.
		if (errors?.find((e) => e.instancePath === pointer && e.keyword === "type")) {
			nodeRef.node = new JsonValueNode(undefined, nodeRef.location);
			return nodeRef.node;
		}

		// Object node, recursively reduce each member.
		if (node.type === "Object") {
			return node.members.reduce(
				(obj: Record<string, JsonElement | JsonElement[] | JsonObject>, member: MemberNode) => {
					obj[member.name.value] = this.aggregate(member.value, `${pointer}/${member.name.value}`, errors);
					return obj;
				},
				{},
			);
		}

		// Array node, recursively reduce each element.
		if (node.type === "Array") {
			return node.elements.map((item, i) => this.aggregate(item.value, `${pointer}/${i}`, errors));
		}

		// Value node.
		if (node.type === "Boolean" || node.type === "Number" || node.type === "String") {
			nodeRef.node = new JsonValueNode(node.value, nodeRef.location);
			return nodeRef.node;
		}

		// Null value node.
		if (node.type === "Null") {
			nodeRef.node = new JsonValueNode(null, nodeRef.location);
			return nodeRef.node;
		}

		throw new Error(
			`Encountered unhandled node type '${node.type}' when mapping abstract-syntax tree node to JSON object`,
		);
	}
}

/**
 * References to a AST node.
 */
type NodeRef = {
	/**
	 * Location of the node.
	 */
	location: JsonLocation;

	/**
	 * Primitive value the node represents; otherwise `undefined`.
	 */
	node?: JsonValueNode<boolean | number | string | null | undefined>;
};

/**
 * JSON object that includes all valid value-types of {@template T}, and defines all invalid value-types as `undefined`.
 */
export type JsonObject<T = unknown> = {
	[K in keyof T]?: JsonElement<T[K]>;
};

/**
 * JSON property within a JSON string, including it's parsed value, and the location it was parsed from.
 */
export type JsonElement<T = unknown> =
	T extends Array<infer E> ? JsonElement<E>[] : T extends object | undefined ? JsonObject<T> : JsonValueNode<T>;

/**
 * Represents a node within a JSON structure.
 */
class JsonValueNode<T> implements LocationRef<JsonLocation> {
	/**
	 * Initializes a new instance of the {@link JsonValueNode} class.
	 * @param value Parsed value.
	 * @param location Location of the element within the JSON it was parsed from.
	 */
	constructor(
		public readonly value: T,
		public readonly location: JsonLocation,
	) {}

	/** @inheritdoc */
	public toString(): string | undefined {
		return this.value?.toString();
	}
}

/**
 * Gets the user-friendly path from the specified {@link pointer}.
 * @param pointer JSON pointer to the error in the source JSON.
 * @returns User-friendly path.
 */
function getPath(pointer: string): string {
	const path = pointer.split("/").reduce((path, segment) => {
		if (segment === undefined || segment === "") {
			return path;
		}

		if (!isNaN(Number(segment))) {
			return `${path}[${segment}]`;
		}

		return `${path}.${segment}`;
	}, "");

	return path.startsWith(".") ? path.slice(1) : path;
}
