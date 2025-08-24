## Readme - M3

* Gruppe:	[2]
* Team-Nr.:	210
* Projektthema: DailyKind

### Implementierung

Framework:	[React Native Android]

API-Version:	[Android API-Level 30-31]

GerÃ¤t(e), auf dem(denen) getestet wurde:
[Pixel 5, Pixel 6]

Externe Libraries und Frameworks:
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-navigation/bottom-tabs": "^7.3.13",
    "@react-navigation/native": "^7.1.9",
    "@react-navigation/native-stack": "^7.3.13",
    "expo": "~53.0.9",
    "expo-status-bar": "~2.2.3",
    "react": "19.0.0",
    "react-native": "0.79.2",
    "react-native-calendars": "^1.1312.0",
    "react-native-safe-area-context": "5.4.0".
    For the api folder:
    "@vercel/kv": "^3.0.0",
    "openai": "^4.98.0"

Dauer der Entwicklung:
[96 Stunden]

Weitere Anmerkungen:

we’ve already deployed everything in /api as serverless functions on Vercel using the command vercel --prod.

These endpoints live on Vercel’s edge network, completely separate from the React Native build, nothing here is bundled into the APK or IPA.

Our OpenAI API key is never hard-coded; it’s kept securely in Vercel environment variables so it’s never exposed to the client.

Any time we need to tweak prompts or logic, we just run vercel --prod and the new code goes live instantly with zero downtime.

The API uses Vercel KV (a Redis-backed key-value store) to persist the 50-item master lists, daily slices and the global history set.

All keys have built-in TTLs so old data expires automatically, and we never need a separate database server.

Because Vercel KV lives alongside our serverless functions, the React Native app never talks directly to the database, everything stays hidden behind the HTTPS endpoints.