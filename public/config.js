// ===== Delish Creative OS — site configuration (safe to publish; contains no secrets) =====
window.DELISH_CONFIG = {
  appName: "Delish Creative OS",
  // Firebase console → Project settings → Your apps → Web app → firebaseConfig
  firebase: {
    apiKey: "REPLACE",
    authDomain: "REPLACE.firebaseapp.com",
    projectId: "REPLACE",
    storageBucket: "REPLACE.firebasestorage.app",
    messagingSenderId: "REPLACE",
    appId: "REPLACE"
  },
  ownerEmails: ["digitalmarketing01@delishfoods.co.th"], // must match firestore.rules / storage.rules / functions
  allowedDomains: ["delishfoods.co.th"],
  signInMethods: ["google", "microsoft"],                 // remove one if the company only uses one
  microsoftTenant: "",                                    // Azure tenant ID (optional, restricts to company tenant)
  functionsRegion: "asia-southeast1",
  aiEnabled: false,       // true only after ANTHROPIC_API_KEY secret + functions deploy (Blaze plan, paid usage)
  storageEnabled: false,  // true only after Cloud Storage is enabled (Blaze plan)
  searchConsole: true     // Google sign-in also asks read-only Search Console access
};
