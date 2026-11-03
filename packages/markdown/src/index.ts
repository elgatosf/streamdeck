export {
	createDocumentationSource,
	generateMarkdown,
	type DocumentationFormat,
	type DocumentationSource,
	type DocumentationSourceOptions,
	type GenerateMarkdownOptions,
} from "./docs/generate-markdown.js";
export type { CodeBlockDiagnostic } from "./type-check/code-block-diagnostic.js";
export { typeCheck, type TypeCheckOptions } from "./type-check/type-check.js";
