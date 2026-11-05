import type { TypeDocumentation } from "../model.js";

/**
 * Style of the overview of each type.
 * - `collapsed` references other types by name.
 * - `expanded` inlines referenced object types as nested structures; recursive references remain named.
 */
export type OverviewStyle = "collapsed" | "expanded";

/**
 * Selects the definition shown in the overview of a type. Discovery computes both representations using the type
 * checker, so generators can choose a style without rediscovering types or depending on the compiler. Non-object
 * types use the same definition for both styles.
 * @param type Documented type.
 * @param style Style of the overview.
 * @returns TypeScript definition.
 */
export function formatOverview(type: TypeDocumentation, style: OverviewStyle = "collapsed"): string {
	return style === "expanded" ? type.expandedDefinition : type.definition;
}
