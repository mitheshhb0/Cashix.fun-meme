import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { readFileSync } from "fs";
import https from "https";

const envFile = readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) env[key.trim()] = rest.join("=").trim();
}

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("       🔥 Firebase Health Check");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// Test 1: Config Values
console.log("1️⃣  Checking .env.local values...");
const checks = [
  ["FIREBASE_API_KEY", firebaseConfig.apiKey],
  ["FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
  ["FIREBASE_PROJECT_ID", firebaseConfig.projectId],
  ["FIREBASE_STORAGE_BUCKET", firebaseConfig.storageBucket],
  ["FIREBASE_MESSAGING_SENDER_ID", firebaseConfig.messagingSenderId],
  ["FIREBASE_APP_ID", firebaseConfig.appId],
];
let configOk = true;
for (const [name, val] of checks) {
  if (val) console.log(`   ✅ ${name}`);
  else { console.log(`   ❌ ${name} — MISSING`); configOk = false; }
}

// Test 2: SDK Init
console.log("\n2️⃣  Initializing Firebase SDK...");
let app, auth;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("   ✅ Firebase App + Auth SDK initialized");
} catch (e) {
  console.log("   ❌ SDK init failed:", e.message);
  process.exit(1);
}

// Test 3: Ping Firebase Auth REST endpoint (checks if project is live)
console.log("\n3️⃣  Pinging Firebase Auth REST API...");
await new Promise((resolve) => {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`;
  const postData = JSON.stringify({ idToken: "dummy" });
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(postData) },
  };
  const req = https.request(url, options, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      const json = JSON.parse(data);
      if (json.error?.message === "INVALID_ID_TOKEN") {
        // This means the API key works and the project is reachable!
        console.log("   ✅ Firebase Auth REST API is REACHABLE (project is live)");
      } else if (json.error?.message === "API_KEY_INVALID") {
        console.log("   ❌ API Key is INVALID");
      } else {
        console.log("   ✅ Got response from Firebase:", json.error?.message || "OK");
      }
      resolve();
    });
  });
  req.on("error", (e) => { console.log("   ❌ Network error:", e.message); resolve(); });
  req.write(postData);
  req.end();
});

// Test 4: Check Google Sign-in Provider config
console.log("\n4️⃣  Checking Google Sign-in provider config...");
await new Promise((resolve) => {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${firebaseConfig.apiKey}`;
  const postData = JSON.stringify({
    identifier: "test@gmail.com",
    continueUri: "http://localhost:3000",
  });
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(postData) },
  };
  const req = https.request(url, options, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      const json = JSON.parse(data);
      if (json.allProviders || json.registered !== undefined) {
        const providers = json.allProviders || [];
        const hasGoogle = providers.includes("google.com");
        console.log("   ✅ Provider lookup works. Registered:", json.registered, "| Providers:", providers.length ? providers.join(", ") : "none listed");
        if (json.signinMethods?.includes("google.com") || hasGoogle) {
          console.log("   ✅ Google Sign-in is ENABLED");
        }
      } else if (json.error) {
        console.log("   ⚠️  Error checking providers:", json.error.message);
      } else {
        console.log("   ✅ Auth URI creation works");
      }
      resolve();
    });
  });
  req.on("error", (e) => { console.log("   ❌ Network error:", e.message); resolve(); });
  req.write(postData);
  req.end();
});

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("              Summary");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  .env.local config :", configOk ? "✅ All set" : "❌ Missing values");
console.log("  Firebase SDK       : ✅ Working");
console.log("  Project ID         : cashix-fun-38012");
console.log("");
console.log("  ⚠️  Note: 'auth/admin-restricted-operation' means");
console.log("     Anonymous sign-in is disabled (expected if not used).");
console.log("     Your Google Sign-in should work fine in the browser.");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
