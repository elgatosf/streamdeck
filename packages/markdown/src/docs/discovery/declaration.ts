import type { EnumDeclaration, InterfaceDeclaration, TypeAliasDeclaration } from "ts-morph";

/**
 * Declaration of a type that can be documented. Restricting discovery to the named kinds represented by the model
 * keeps references to values and classes from being presented as documentable types.
 */
export type DocumentableDeclaration = EnumDeclaration | InterfaceDeclaration | TypeAliasDeclaration;
