import { expect } from "@jest/globals";
import { toHaveError } from "./matchers/to-have-error";

expect.extend({
	toHaveError
});
