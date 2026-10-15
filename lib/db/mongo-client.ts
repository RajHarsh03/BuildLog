import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";

/**
 * Separate MongoClient (from the `mongodb` driver) used by the Auth.js
 * MongoDB adapter. Mongoose uses its own connection in ./mongodb.
 *
 * NOTE: we intentionally do NOT pass a `serverApi` option here. Forcing
 * Server API v1 causes the driver to attempt SCRAM-SHA-1 auth, which fails
 * against Atlas users created with SCRAM-SHA-256 (the current default).
 */
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  // Defer the failure until something actually calls the adapter, so the
  // public site can still build/run without a database configured.
  clientPromise = Promise.reject(new Error("MONGODB_URI is not set."));
  // Mark the rejection as handled: `auth.ts` passes this promise to the
  // MongoDB adapter at module load, and an unused rejected promise would
  // otherwise crash `next build` with an UnhandledPromiseRejection.
  clientPromise.catch(() => {});
} else if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
