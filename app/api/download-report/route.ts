import { type NextRequest, NextResponse } from "next/server"
import { generateReportHTML, type PDFReportData } from "@/lib/pdf-generator"

export async function POST(request: NextRequest) {
  try {
    const { downloadToken, reportData }: { downloadToken: string; reportData: PDFReportData } = await request.json()

    if (!downloadToken || downloadToken.length < 10) {
      return NextResponse.json({ success: false, error: "Invalid download token" }, { status: 401 })
    }

    // Generate the HTML report
    const htmlContent = generateReportHTML(reportData)

    // For now, return HTML that can be converted client-side or opened in new window

    return NextResponse.json({
      success: true,
      htmlContent,
      filename: `savings-report-${reportData.emailData.company.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.html`,
    })
  } catch (error) {
    console.error("[v0] Error generating download:", error)
    return NextResponse.json({ success: false, error: "Failed to generate report" }, { status: 500 })
  }
}
