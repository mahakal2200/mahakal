
import "server-only";

import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON environment variable is missing."
    );
  }

  const credentials: unknown = JSON.parse(raw);

  if (
    !credentials ||
    typeof credentials !== "object" ||
    !("project_id" in credentials) ||
    !("client_email" in credentials) ||
    !("private_key" in credentials)
  ) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is not a valid service account JSON."
    );
  }

  const account = credentials as {
    project_id: string;
    client_email: string;
    private_key: string;
  };

  return {
    projectId: account.project_id,
    clientEmail: account.client_email,
    privateKey: account.private_key.replace(/\\n/g, "\n"),
  };
}

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(getServiceAccount()),
      });

export const adminDb = getFirestore(adminApp);
