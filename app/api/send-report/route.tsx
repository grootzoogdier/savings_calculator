import { type NextRequest, NextResponse } from "next/server"
import { formatCurrency } from "@/utils/currencyFormatter"
import { generateReportHTML, type PDFReportData } from "@/lib/pdf-generator"

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
  annualCostPerWorkstation?: string
}

interface Results {
  annualWaste: number
  monthlyWaste: number
  costCutPercentage: number
  annualCost: number
  calculationMethod: string
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

    try {
      console.log("[v0] Generating HTML report...")

      // Calculate additional metrics
      const potentialSavings = results.annualWaste * 0.75 // 75% recovery rate
      const reportId = `roi-${Date.now()}`
      const currentDate = new Date().toLocaleDateString("en-GB")

      const reportData: PDFReportData = {
        emailData,
        calculatorData: {
          ...calculatorData,
          numberOfEmployees: calculatorData.numberOfEmployees?.toString() || "",
          organisationName: calculatorData.companyName || emailData.company,
          currentWorkstations:
            calculatorData.currentWorkstations?.toString() || calculatorData.numberOfEmployees?.toString() || "",
          workstationUtilization: calculatorData.workstationUtilization?.toString() || calculatorData.utilization || "",
          annualCostPerWorkstation: calculatorData.annualCostPerWorkstation?.toString() || "9000", // Default value
        },
        results: {
          ...results,
          calculationMethod: results.calculationMethod || "workstations", // Default to workstations for now
        },
      }

      const comprehensiveHtmlReport = generateReportHTML(reportData)

      // Convert HTML to base64 for email attachment
      const htmlBase64 = Buffer.from(comprehensiveHtmlReport).toString("base64")

      console.log("[v0] HTML report generated successfully")

      // Create email content
      const emailSubject = `Your Flexible Workspace ROI Analysis - €${Math.round(potentialSavings).toLocaleString()} Potential Savings`

      const safeParseNumber = (value: string | number): number => {
        if (typeof value === "number") return value
        const parsed = Number.parseFloat(value)
        return isNaN(parsed) ? 0 : parsed
      }

      const safeFormatValue = (value: string | number, suffix = ""): string => {
        if (!value || value === "" || value === "undefined" || value === "0") return "Not specified"
        return `${value}${suffix}`
      }

      const formatFieldValue = (value: string | number, defaultValue?: string, suffix = ""): string => {
        if (!value || value === "" || value === "undefined") {
          return defaultValue ? `${defaultValue} (pre-filled)${suffix}` : `Not specified${suffix}`
        }
        return `${value}${suffix}`
      }

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
        .metric-label { color: #6b7280; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
        .waste-metric { border-left-color: #ef4444; }
        .waste-metric .metric-value { color: #ef4444; }
        .summary { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .input-summary { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .input-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .input-label { font-weight: 500; color: #475569; }
        .input-value { color: #1e293b; }
        .calculation-method { background: #dbeafe; padding: 12px; border-radius: 6px; margin-bottom: 16px; text-align: center; font-weight: 600; color: #1e40af; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Flexible Workspace ROI Analysis</h1>
        <p>Personalized Report for ${emailData.name}, ${emailData.company}</p>
        <p>Date: ${new Date().toLocaleDateString()} | Location: ${emailData.location}</p>
    </div>
    
    <div class="content">
        <h2>Executive Summary</h2>
        <p>Based on your current workspace configuration, <strong>${emailData.company}</strong> can achieve significant cost savings by transitioning to a flexible workspace strategy. Your analysis shows an immediate opportunity to reduce real estate costs by <strong>${results.costCutPercentage.toFixed(1)}%</strong> from your current <strong>${formatCurrency(results.annualCost)}</strong> annual expense.</p>
        
        <div class="input-summary">
            <h3>Your Current Situation</h3>
            <div class="calculation-method">
                Calculations based on: ${results.calculationMethod === "workstations" ? "Workstations" : "Square Meters (M²)"}
            </div>
            
            ${
              results.calculationMethod === "workstations"
                ? `
            <div class="input-row">
                <span class="input-label">Current Workstations:</span>
                <span class="input-value">${formatFieldValue(calculatorData.currentWorkstations, calculatorData.numberOfEmployees)}</span>
            </div>
            <div class="input-row">
                <span class="input-label">Workstation Utilization:</span>
                <span class="input-value">${formatFieldValue(calculatorData.workstationUtilization, "50%", "%")}</span>
            </div>
            <div class="input-row">
                <span class="input-label">Annual Cost per Workstation:</span>
                <span class="input-value">${formatFieldValue(calculatorData.annualCostPerWorkstation, "€9,000")}</span>
            </div>
            `
                : `
            <div class="input-row">
                <span class="input-label">Office Size:</span>
                <span class="input-value">${formatFieldValue(calculatorData.officeSize, "", " m²")}</span>
            </div>
            <div class="input-row">
                <span class="input-label">Monthly Cost:</span>
                <span class="input-value">${safeParseNumber(calculatorData.monthlyCost) > 0 ? formatCurrency(safeParseNumber(calculatorData.monthlyCost)) : "Not specified"}</span>
            </div>
            <div class="input-row">
                <span class="input-label">Average Occupancy:</span>
                <span class="input-value">${formatFieldValue(calculatorData.utilization, "50%", "%")}</span>
            </div>
            `
            }
            
            <div class="input-row">
                <span class="input-label">Work Model:</span>
                <span class="input-value">${calculatorData.workModel === "hybrid" ? "Hybrid" : calculatorData.workModel === "remote" ? "Remote-First" : "Traditional Office"}</span>
            </div>
            ${
              calculatorData.numberOfEmployees && calculatorData.numberOfEmployees !== "0"
                ? `
            <div class="input-row">
                <span class="input-label">Number of Employees:</span>
                <span class="input-value">${calculatorData.numberOfEmployees}</span>
            </div>
            `
                : ""
            }
            ${
              calculatorData.includeOnDemand
                ? `
            <div class="input-row">
                <span class="input-label">On-Demand Access:</span>
                <span class="input-value">Included</span>
            </div>
            `
                : ""
            }
        </div>
        
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
                    <div class="metric-value">${results.calculationMethod === "workstations" ? formatFieldValue(calculatorData.workstationUtilization, "50%", "%") : formatFieldValue(calculatorData.utilization, "50%", "%")}</div>
                    <div class="metric-label">Space Efficiency</div>
                </div>
            </div>
        </div>

        <p><strong>Your comprehensive analysis report is attached</strong> with detailed calculations, methodology, and actionable recommendations tailored to your specific situation.</p>

        <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
            Report ID: ${reportId} | Generated: ${new Date().toISOString()}
        </p>
    </div>
</body>
</html>
      `

      const recipients = ["mail@richardstoop.nl"]

      try {
        console.log("[v0] Attempting to send email via Resend...")

        const apiKey = process.env.RESEND_API_KEY?.trim()

        if (!apiKey || apiKey.length === 0) {
          throw new Error("RESEND_API_KEY environment variable is not set")
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
            from: "onboarding@resend.dev",
            to: recipients,
            subject: emailSubject,
            html: emailContent,
            attachments: [
              {
                filename: `savings-report-${emailData.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.htm`,
                content: htmlBase64,
                type: "text/html", // Proper MIME type for HTML
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

        return NextResponse.json({
          success: true,
          message: "Report sent successfully with HTML attachment",
          reportId: reportId,
          attachments: ["HTML"],
        })
      } catch (emailError) {
        console.error("[v0] Email sending failed:", emailError)
        return NextResponse.json(
          {
            success: false,
            message: "Failed to send email",
            error: emailError instanceof Error ? emailError.message : "Unknown email error",
          },
          { status: 500 },
        )
      }
    } catch (reportError) {
      console.error("[v0] Report generation error:", reportError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to generate report",
          error: reportError instanceof Error ? reportError.message : "Unknown report error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing report request:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send report",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
