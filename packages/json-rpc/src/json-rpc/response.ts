import { z } from "zod/mini";

import { ErrorResponse } from "./error-response.js";
import { SuccessResponse } from "./success-response.js";

/**
 * Response object sent to a client.
 */
export const Response = z.compile(z.union([SuccessResponse, ErrorResponse]));

/**
 * Response object sent to a client.
 */
export type Response = ErrorResponse | SuccessResponse;
