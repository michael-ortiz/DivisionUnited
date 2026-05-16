import { type NextRequest } from "next/server";
import { db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { createHash } from "crypto";

type Side = "left" | "middle" | "right";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const side: Side = body?.side;

  if (!["left", "middle", "right"].includes(side)) {
    return Response.json({ error: "Invalid side" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const voterHash = hashIp(ip);
  const voterRef = db.collection("voters").doc(voterHash);
  const countsRef = db.collection("votes").doc("counts");

  const voterDoc = await voterRef.get();
  if (voterDoc.exists) {
    const counts = (await countsRef.get()).data() ?? {};
    return Response.json(
      {
        error: "already_voted",
        votedFor: voterDoc.data()?.side,
        counts: {
          left: counts.left ?? 0,
          middle: counts.middle ?? 0,
          right: counts.right ?? 0,
        },
      },
      { status: 409 }
    );
  }

  await db.runTransaction(async (tx) => {
    tx.set(voterRef, { side, votedAt: FieldValue.serverTimestamp() });
    tx.set(
      countsRef,
      { [side]: FieldValue.increment(1) },
      { merge: true }
    );
  });

  const updatedCounts = (await countsRef.get()).data() ?? {};
  return Response.json({
    ok: true,
    counts: {
      left: updatedCounts.left ?? 0,
      middle: updatedCounts.middle ?? 0,
      right: updatedCounts.right ?? 0,
    },
  });
}
