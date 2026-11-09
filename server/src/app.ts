// app.ts
// Creates the Express app: settings first, then all the /api
// routes, then the "not found" and error handlers.
// it does not start listening; server.ts does that

import express from "express";
import { env } from "./config/env";

// STEP 3 Create the Express app
// The Express app: allow the webites to call us (CORS), read JSON bodies, server
// upload photos, put every route under /api, then the 404 and error handlers

const app = express();
app.use(express.json());

export default app;

// Next: Step 4 (Handle unknown URLs and errors) -> searver/src/
// middleware/notfound.ts
