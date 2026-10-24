import { createAuth } from "@backend/auth";
import { createDb } from "@backend/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
