import { db } from "@/lib/db";
import { sendInquiryEmail } from "@/lib/resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      message,
      intent,
      propertyId,
      budgetMin,
      budgetMax,
      timeline,
    } = body;

    // Save lead to database
    const lead = await db.lead.create({
      data: {
        name,
        email,
        phone: phone || null,
        message: message || null,
        intent: intent || null,
        propertyId: propertyId || null,
        budgetMin: budgetMin || null,
        budgetMax: budgetMax || null,
        timeline: timeline || null,
      },
    });

    // Get property title if propertyId exists
    let propertyTitle;
    if (propertyId) {
      const property = await db.property.findUnique({
        where: { id: propertyId },
        select: { title: true },
      });
      propertyTitle = property?.title;
    }

    // Send email notification
    await sendInquiryEmail({
      name,
      email,
      phone,
      message,
      intent,
      propertyTitle,
      budgetMin,
      budgetMax,
      timeline,
    });

    return NextResponse.json({ success: true, id: lead.id });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 },
    );
  }
}
