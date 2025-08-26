import { type NextRequest, NextResponse } from "next/server"

interface EmailData {
  name: string
  email: string
  company: string
  location: string
}

interface CalculatorData {
  officeSize: string
  monthlyCost: string
  utilization: string
  workModel: string
  companyName: string
  includeOnDemand: boolean
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
    const body: RequestBody = await request.json()
    const { emailData, calculatorData, results } = body

    // Generate PDF first
    const pdfResponse = await fetch(`${request.nextUrl.origin}/api/generate-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const pdfData = await pdfResponse.json()

    if (!pdfData.success) {
      throw new Error("Failed to generate PDF")
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
            <p>Your comprehensive ROI analysis is attached as a PDF document. This detailed report includes:</p>
            <ul>
                <li>Executive summary with key findings</li>
                <li>Detailed calculation methodology</li>
                <li>Implementation strategies and next steps</li>
                <li>Market analysis for ${emailData.location}</li>
                <li>Employee experience benefits</li>
            </ul>
        </div>

        <h2>Executive Summary</h2>
        <p>By transitioning to a flexible workspace strategy, <strong>${emailData.company}</strong> can immediately reduce real estate costs by <strong>${results.costCutPercentage.toFixed(1)}%</strong>, optimizing a <strong>${formatCurrency(results.annualCost)}</strong> annual expense with minimal disruption.</p>
        
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
                    <div class="metric-value">${calculatorData.utilization}% → 85%</div>
                    <div class="metric-label">Space Efficiency</div>
                </div>
            </div>
        </div>

        <h3>Your Current Situation</h3>
        <div class="metric">
            <div class="metric-value">${calculatorData.officeSize} m²</div>
            <div class="metric-label">Office Space</div>
        </div>
        <div class="metric">
            <div class="metric-value">${formatCurrency(Number(calculatorData.monthlyCost))}</div>
            <div class="metric-label">Monthly Cost</div>
        </div>
        <div class="metric">
            <div class="metric-value">${calculatorData.utilization}%</div>
            <div class="metric-label">Current Utilization</div>
        </div>

        <h3>Financial Impact</h3>
        <div class="metric waste-metric">
            <div class="metric-value">${formatCurrency(results.annualWaste)}</div>
            <div class="metric-label">Annual waste on unused space</div>
        </div>
        <div class="metric">
            <div class="metric-value">${formatCurrency(results.monthlyWaste)}</div>
            <div class="metric-label">Cash burned per month on empty desks</div>
        </div>
        <div class="metric">
            <div class="metric-value">${results.costCutPercentage.toFixed(1)}%</div>
            <div class="metric-label">Potential cost reduction</div>
        </div>

        <h3>Next Steps</h3>
        <p>Ready to explore your flexible workspace options in ${emailData.location}? Our team can help you:</p>
        <ul>
            <li>Identify suitable flexible workspace locations</li>
            <li>Plan a phased transition strategy</li>
            <li>Calculate detailed implementation costs</li>
            <li>Design a pilot program for your team</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
            <a href="#" class="cta">Schedule a Strategy Consultation</a>
        </div>

        <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
            This analysis is based on current market data and industry benchmarks. Results may vary based on specific implementation details and market conditions.<br>
            Report ID: ${pdfData.reportId}
        </p>
    </div>
</body>
</html>
    `

    // In a real implementation, you would send this email using a service like:
    // - Resend
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // And attach the generated PDF

    // For now, we'll simulate the email sending
    console.log("Email would be sent to:", emailData.email)
    console.log("Subject:", emailSubject)
    console.log("PDF filename:", pdfData.filename)
    console.log("Content length:", emailContent.length)

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
    return NextResponse.json({ success: false, message: "Failed to send report" }, { status: 500 })
  }
}
