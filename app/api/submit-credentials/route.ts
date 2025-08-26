import { type NextRequest, NextResponse } from "next/server"
import { generateReportHTML, type PDFReportData } from "@/lib/pdf-generator"

export async function POST(request: NextRequest) {
  try {
    const data: PDFReportData = await request.json()

    console.log("[v0] Storing user credentials for CRM integration:", {
      name: data.emailData.name,
      email: data.emailData.email,
      company: data.emailData.company,
      location: data.emailData.location,
      timestamp: new Date().toISOString(),
    })

    // Generate the HTML report
    const htmlContent = generateReportHTML(data)

    const downloadToken = Math.random().toString(36).substr(2, 15)

    // In a real implementation, you would:
    // 1. Store the credentials in HubSpot CRM
    // 2. Store the report HTML/PDF in a secure location
    // 3. Send confirmation email with download link
    // 4. Set up token expiration (e.g., 24 hours)

    return NextResponse.json({
      success: true,
      message: "Credentials submitted successfully",
      downloadToken,
      reportReady: true,
    })
  } catch (error) {
    console.error("[v0] Error processing credentials:", error)
    return NextResponse.json({ success: false, error: "Failed to process submission" }, { status: 500 })
  }
}
