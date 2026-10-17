import { z } from 'zod';

// Response shapes of the health routes (TRD-API-01). A failed readiness check answers the one error shape with
// `database_unavailable` (decision 0015) instead.

/** `GET /health`: the process is up. */
export const healthResponseSchema = z.strictObject({ status: z.literal('ok') });

/** `GET /health/ready`: the process is up and the database answered. */
export const readyResponseSchema = z.strictObject({ status: z.literal('ready'), database: z.literal('reachable') });

export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type ReadyResponse = z.infer<typeof readyResponseSchema>;
