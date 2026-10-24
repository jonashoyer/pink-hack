import { createDb } from "@backend/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
