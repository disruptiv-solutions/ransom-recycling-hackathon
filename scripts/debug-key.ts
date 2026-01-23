import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
console.log("Key length:", key?.length);
console.log("First 100 chars (escaped):", JSON.stringify(key?.substring(0, 100)));
console.log("Last 50 chars (escaped):", JSON.stringify(key?.substring(key.length - 50)));
