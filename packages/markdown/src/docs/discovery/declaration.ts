import type { EnumDeclaration, InterfaceDeclaration, TypeAliasDeclaration } from "ts-morph";

/**
 * Declaration of a type that can be documented.
 */
export type DocumentableDeclaration = EnumDeclaration | InterfaceDeclaration | TypeAliasDeclaration;
