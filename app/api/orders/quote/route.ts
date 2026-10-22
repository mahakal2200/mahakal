
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getDeliveryCharge(): number {
  const configured = process.env.DELIVERY_FLAT_CHARGE;
  const charge = configured === undefined ? 40 : Number(configured);

  if (!Number.isFinite(charge) || charge < 0 || charge > 10000) {
    throw new Error("INVALID_DELIVERY_CONFIGURATION");
  }

  return Math.round(charge * 100) / 100;
}

export async function GET() {
  try {
    return NextResponse.json({
      deliveryCharge: getDeliveryCharge(),
      pricingMode: "temporary_flat_rate",
      currency: "INR",
      message:
        "Temporary delivery charge. Actual distance-based pricing will be added later.",
    });
  } catch (error) {
    console.error("Delivery quote failed:", error);

    return NextResponse.json(
      { error: "Delivery charges are not configured correctly." },
      { status: 503 }
    );
  }
}
