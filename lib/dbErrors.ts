/** Detect DNS/network failures when connecting to MongoDB (bad or placeholder URI). */
export function isMongoConnectionError(e: unknown): boolean {
  const err = e as Error & { code?: string; name?: string };
  const code = err.code;
  const name = err.name ?? "";
  const msg = (err.message ?? "").toLowerCase();
  if (code === "ENOTFOUND" || code === "ECONNREFUSED" || code === "ETIMEDOUT") return true;
  if (name === "MongoServerSelectionError" || name === "MongoNetworkError") return true;
  if (msg.includes("querysrv") || msg.includes("getaddrinfo")) return true;
  return false;
}

export function mongoConnectionUserMessage(): string {
  return (
    "Cannot connect to MongoDB. Use a full Atlas connection string in MONGODB_URI " +
    "(mongodb+srv://user:pass@your-cluster.xxxxx.mongodb.net/dbname?…), not a placeholder host like cluster.mongodb.net."
  );
}
