import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: false,
  },
};

/**
 * Separate MongoClient (from the `mongodb` driver) used by the Auth.js
 * MongoDB adapter. Mongoose uses its own connection in ./mongodb.
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
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
