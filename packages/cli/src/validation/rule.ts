import { type ValidationContext } from "./validator";

/**
 * Wraps a validation rule.
 * @param fn Delegate function responsible for applying the validation rule.
 * @returns The validation rule.
 */
export const rule = <TContext>(fn: ValidationRule<TContext>): ValidationRule<TContext> => fn;

/**
 * Validation rule that will be executed as part of a validator.
 */
export type ValidationRule<TContext> = (this: ValidationContext, context: TContext) => Promise<void> | void;
