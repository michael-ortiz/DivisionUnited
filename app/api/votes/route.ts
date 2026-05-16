import { db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  const doc = await db.collection("votes").doc("counts").get();
  const data = doc.data() ?? { left: 0, middle: 0, right: 0 };
  return Response.json({
    left: data.left ?? 0,
    middle: data.middle ?? 0,
    right: data.right ?? 0,
  });
}

// Initialize the counts document if it doesn't exist
export async function PUT() {
  await db
    .collection("votes")
    .doc("counts")
    .set({ left: 0, middle: 0, right: 0 }, { merge: false });
  return Response.json({ ok: true });
}
