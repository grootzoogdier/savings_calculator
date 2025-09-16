import { type NextRequest, NextResponse } from "next/server"

interface EmailData {
  name: string
  email: string
  company: string
  location: string
  adminEmail?: string
}

interface CalculatorData {
  officeSize: string
  monthlyCost: string
  utilization: string
  workModel: string
  companyName: string
  includeOnDemand: boolean
  currentWorkstations?: number
  numberOfEmployees?: number
  workstationUtilization?: number
}

interface Results {
  annualWaste: number
  monthlyWaste: number
  costCutPercentage: number
  annualCost: number
}

interface RequestBody {
  emailData: EmailData
  calculatorData: CalculatorData
  results: Results
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API route called, attempting to parse request body...")

    let body: RequestBody
    try {
      body = await request.json()
      console.log("[v0] Successfully parsed JSON body")
    } catch (parseError) {
      console.error("[v0] JSON parsing failed:", parseError)
      console.error("[v0] Request headers:", Object.fromEntries(request.headers.entries()))
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON in request body",
          error: parseError instanceof Error ? parseError.message : "Unknown parsing error",
        },
        { status: 400 },
      )
    }

    const { emailData, calculatorData, results } = body

    if (!emailData || !calculatorData || !results) {
      console.error("[v0] Missing required fields in request body")
      return NextResponse.json(
        { success: false, message: "Missing required fields: emailData, calculatorData, or results" },
        { status: 400 },
      )
    }

    console.log("[v0] Request body validated successfully")

    // Generate PDF first
    let pdfData
    try {
      console.log("[v0] Calling PDF generation API...")
      const pdfResponse = await fetch(`${request.nextUrl.origin}/api/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      console.log("[v0] PDF API response status:", pdfResponse.status)

      if (!pdfResponse.ok) {
        const errorText = await pdfResponse.text()
        console.error("[v0] PDF generation failed:", pdfResponse.status, pdfResponse.statusText)
        console.error("[v0] PDF error response:", errorText)
        throw new Error(`PDF generation failed: ${pdfResponse.status} - ${errorText}`)
      }

      const responseText = await pdfResponse.text()
      console.log("[v0] PDF response text length:", responseText.length)
      console.log("[v0] PDF response preview:", responseText.substring(0, 200))

      try {
        pdfData = JSON.parse(responseText)
        console.log("[v0] Successfully parsed PDF response")
      } catch (pdfParseError) {
        console.error("[v0] Failed to parse PDF response as JSON:", pdfParseError)
        console.error("[v0] Raw PDF response:", responseText)
        throw new Error("PDF API returned invalid JSON response")
      }

      if (!pdfData.success) {
        throw new Error(`PDF generation failed: ${pdfData.message || "Unknown error"}`)
      }
    } catch (pdfError) {
      console.error("[v0] PDF generation error:", pdfError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to generate PDF report",
          error: pdfError instanceof Error ? pdfError.message : "Unknown PDF error",
        },
        { status: 500 },
      )
    }

    // Format currency for display
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    }

    // Calculate additional metrics
    const potentialSavings = results.annualWaste * 0.75 // 75% recovery rate

    // Create email content
    const emailSubject = `Your Flexible Workspace ROI Analysis - ${formatCurrency(potentialSavings)} Potential Savings`

    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Flexible Workspace ROI Analysis</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .metric { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1e40af; }
        .metric-label { color: #6b7280; font-size: 14px; }
        .waste-metric { border-left-color: #ef4444; }
        .waste-metric .metric-value { color: #ef4444; }
        .summary { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .cta { background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .pdf-notice { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .workstation-data { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Flexible Workspace ROI Analysis</h1>
        <p>Personalized Report for ${emailData.name}, ${emailData.company}</p>
        <p>Date: ${new Date().toLocaleDateString()} | Location: ${emailData.location}</p>
    </div>
    
    <div class="content">
        <div class="pdf-notice">
            <h3>📄 Complete PDF Report Attached</h3>
            <p>Your comprehensive ROI analysis is attached as a PDF document. This detailed report includes all relevant data and calculations.</p>
        </div>

        <div class="workstation-data">
            <h3>📊 Workstation Analysis</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <div class="metric-value">${calculatorData.currentWorkstations || calculatorData.numberOfEmployees || "N/A"}</div>
                    <div class="metric-label">Current Workstations</div>
                </div>
                <div>
                    <div class="metric-value">${calculatorData.workstationUtilization || calculatorData.utilization || "N/A"}%</div>
                    <div class="metric-label">Workstation Utilization</div>
                </div>
            </div>
        </div>

        <h2>Executive Summary</h2>
        <p>By transitioning to a flexible workspace strategy, <strong>${emailData.company}</strong> can immediately reduce real estate costs by <strong>${results.costCutPercentage.toFixed(1)}%</strong>, optimizing a <strong>${formatCurrency(results.annualCost)}</strong> annual expense.</p>
        
        <div class="summary">
            <h3>Key Findings</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <div class="metric-value">${formatCurrency(results.annualWaste)}</div>
                    <div class="metric-label">Annual Waste</div>
                </div>
                <div>
                    <div class="metric-value">${formatCurrency(potentialSavings)}</div>
                    <div class="metric-label">Potential Savings</div>
                </div>
                <div>
                    <div class="metric-value">2 months</div>
                    <div class="metric-label">ROI Timeline</div>
                </div>
                <div>
                    <div class="metric-value">${calculatorData.workstationUtilization || calculatorData.utilization}% → 85%</div>
                    <div class="metric-label">Space Efficiency</div>
                </div>
            </div>
        </div>

        <h3>Financial Impact</h3>
        <div class="metric waste-metric">
            <div class="metric-value">${formatCurrency(results.annualWaste)}</div>
            <div class="metric-label">Annual waste on unused space</div>
        </div>
        <div class="metric">
            <div class="metric-value">${formatCurrency(results.monthlyWaste)}</div>
            <div class="metric-label">Monthly waste</div>
        </div>
        <div class="metric">
            <div class="metric-value">${results.costCutPercentage.toFixed(1)}%</div>
            <div class="metric-label">Potential cost reduction</div>
        </div>

        <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
            Report ID: ${pdfData.reportId} | Generated: ${new Date().toISOString()}
        </p>
    </div>
</body>
</html>
    `

    const recipients = [emailData.email]
    recipients.push("mail@richardstoop.nl")

    try {
      console.log("[v0] Attempting to send email via Resend...")
      console.log("[v0] Recipients:", recipients)

      const apiKey = process.env.RESEND_API_KEY?.trim()
      const allEnvVars = Object.keys(process.env)
      const resendVars = allEnvVars.filter((key) => key.includes("RESEND"))

      console.log("[v0] All environment variables count:", allEnvVars.length)
      console.log("[v0] RESEND-related variables:", resendVars)
      console.log("[v0] Raw RESEND_API_KEY value:", JSON.stringify(process.env.RESEND_API_KEY))
      console.log("[v0] Trimmed API key length:", apiKey ? apiKey.length : 0)
      console.log("[v0] API key starts with 're_':", apiKey ? apiKey.startsWith("re_") : false)

      if (!apiKey || apiKey.length === 0) {
        const errorMsg = `RESEND_API_KEY environment variable is empty or not set properly. 
        Raw value: ${JSON.stringify(process.env.RESEND_API_KEY)}
        Available RESEND vars: ${resendVars.join(", ") || "none"}
        
        This is likely a Vercel environment variable configuration issue. 
        Please check that the API key value is properly saved in Vercel settings.`

        console.error("[v0] Environment variable error:", errorMsg)
        throw new Error(errorMsg)
      }

      if (!apiKey.startsWith("re_")) {
        throw new Error("Invalid Resend API key format. API key should start with 're_'")
      }

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev", // Use this for testing, change to reports@procosgroup.com after domain verification
          to: recipients,
          subject: emailSubject,
          html: emailContent,
          attachments: [
            {
              filename: pdfData.filename,
              content: pdfData.base64,
            },
          ],
        }),
      })

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json()
        console.error("[v0] Resend API error response:", errorData)
        throw new Error(`Resend API error: ${errorData.message || resendResponse.status}`)
      }

      const emailResult = await resendResponse.json()
      console.log("[v0] Email successfully sent via Resend:", emailResult.id)
      console.log("[v0] Recipients:", recipients.join(", "))
      console.log("[v0] Subject:", emailSubject)
    } catch (emailError) {
      console.error("[v0] Email sending failed:", emailError)
      if (emailError instanceof Error) {
        console.error("[v0] Error details:", emailError.message)
      }
      // Don't fail the entire request if email fails
      return NextResponse.json({
        success: true,
        message: "Report generated successfully, but email delivery failed",
        reportId: pdfData.reportId,
        pdfFilename: pdfData.filename,
        emailError: emailError instanceof Error ? emailError.message : "Unknown email error",
      })
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json({
      success: true,
      message: "Report sent successfully with PDF attachment",
      reportId: pdfData.reportId,
      pdfFilename: pdfData.filename,
    })
  } catch (error) {
    console.error("Error processing report request:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send report",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
