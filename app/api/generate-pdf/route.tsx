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
    const roiTimeline = "2 months"
    const spaceEfficiencyImprovement = `${calculatorData.utilization}% → 85%`
    const reportId = `roi-${Date.now()}`
    const currentDate = new Date().toLocaleDateString("en-GB")

    // Create HTML content for the report
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Flexible Workspace ROI Analysis</title>
    <style>
        @media print {
            @page {
                margin: 40px;
                size: A4;
            }
        }
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
            border-radius: 8px;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header .subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin: 5px 0;
        }
        .executive-summary {
            background: #f8fafc;
            padding: 25px;
            border-left: 4px solid #1e40af;
            margin-bottom: 30px;
            border-radius: 4px;
        }
        .executive-summary h2 {
            color: #1e40af;
            margin-top: 0;
            font-size: 22px;
        }
        .key-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            margin: 25px 0;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }
        .metric-value.waste {
            color: #ef4444;
        }
        .metric-value.savings {
            color: #10b981;
        }
        .metric-label {
            color: #6b7280;
            font-size: 14px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h3 {
            color: #1e40af;
            font-size: 18px;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
        }
        .current-situation {
            background: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .calculation-step {
            background: #f3f4f6;
            padding: 15px;
            margin: 10px 0;
            border-radius: 6px;
            border-left: 3px solid #6b7280;
        }
        .calculation-step .formula {
            font-family: 'Courier New', monospace;
            background: #e5e7eb;
            padding: 8px;
            border-radius: 4px;
            margin: 5px 0;
        }
        .benefits-list {
            list-style: none;
            padding: 0;
        }
        .benefits-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .benefits-list li:before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
            margin-right: 10px;
        }
        .next-steps {
            background: #ecfdf5;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #10b981;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
        @media print {
            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Flexible Workspace ROI Analysis</h1>
        <div class="subtitle">Executive Summary</div>
        <div class="subtitle">Personalized Report for: ${emailData.name}, ${emailData.company}</div>
        <div class="subtitle">Date: ${currentDate} | Location: ${emailData.location} | Report ID: ${reportId}</div>
    </div>

    <div class="executive-summary">
        <h2>Executive Summary</h2>
        <p>By transitioning to a flexible workspace strategy, <strong>${emailData.company}</strong> can immediately reduce real estate costs by <strong>${results.costCutPercentage.toFixed(1)}%</strong>, optimizing a <strong>${formatCurrency(results.annualCost)}</strong> annual expense with minimal disruption. The proposed ${calculatorData.workModel.toLowerCase()} model leverages ${emailData.location}'s competitive flex workspace market to drive significant operational efficiency and cost savings.</p>
        
        <div class="key-metrics">
            <div class="metric-card">
                <div class="metric-value waste">${formatCurrency(results.annualWaste)}</div>
                <div class="metric-label">Annual Waste</div>
            </div>
            <div class="metric-card">
                <div class="metric-value savings">${formatCurrency(potentialSavings)}</div>
                <div class="metric-label">Potential Savings</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${roiTimeline}</div>
                <div class="metric-label">ROI Timeline</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${spaceEfficiencyImprovement}</div>
                <div class="metric-label">Space Efficiency</div>
            </div>
        </div>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <h3>Your Current Situation</h3>
        <div class="current-situation">
            <h4>Office Portfolio</h4>
            <p><strong>Office Space:</strong> ${calculatorData.officeSize} m²</p>
            <p><strong>Monthly Cost:</strong> ${formatCurrency(Number(calculatorData.monthlyCost))}</p>
            <p><strong>Annual Cost:</strong> ${formatCurrency(results.annualCost)}</p>
            <p><strong>Utilization:</strong> ${calculatorData.utilization}%</p>
            <p><strong>Work Model:</strong> ${calculatorData.workModel}</p>
        </div>
        
        <p><strong>Industry Context:</strong> Flexible workspaces provide scalable infrastructure that supports hybrid work models, enabling rapid organizational adaptation, reducing fixed overhead, and supporting talent attraction through modern workplace environments.</p>
    </div>

    <div class="section">
        <h3>ROI Calculation Breakdown</h3>
        
        <h4>Key Calculation Assumptions</h4>
        <ul>
            <li><strong>Recovery Rate:</strong> 75% of office costs can be recovered through flexible workspace optimization - this is the industry standard based on typical lease obligations, utility contracts, and operational commitments.</li>
            <li><strong>City-Specific Pricing:</strong> Flexible desk costs €400/month in ${emailData.location} vs. the €300 baseline rate.</li>
            <li><strong>Space Efficiency Gain:</strong> Traditional offices average ${calculatorData.utilization}% utilization, while flexible workspaces achieve 85% through optimized booking systems and varied work patterns.</li>
        </ul>

        <h4>Detailed Calculation Steps</h4>
        
        <div class="calculation-step">
            <strong>Step 1: Annual Cost Calculation</strong>
            <div class="formula">AnnualCost = MonthlyCost × 12</div>
            <div class="formula">${formatCurrency(Number(calculatorData.monthlyCost))} × 12 = ${formatCurrency(results.annualCost)}</div>
            <p>Explanation: Total annual office cost based on current monthly spending</p>
        </div>

        <div class="calculation-step">
            <strong>Step 2: Waste Factor Analysis</strong>
            <div class="formula">WasteFactor = 100% - Utilization%</div>
            <div class="formula">100% - ${calculatorData.utilization}% = ${100 - Number(calculatorData.utilization)}%</div>
            <p>Explanation: Percentage of office space that remains unused</p>
        </div>

        <div class="calculation-step">
            <strong>Step 3: Annual Waste Calculation</strong>
            <div class="formula">AnnualWaste = AnnualCost × WasteFactor</div>
            <div class="formula">${formatCurrency(results.annualCost)} × ${100 - Number(calculatorData.utilization)}% = ${formatCurrency(results.annualWaste)}</div>
            <p>Explanation: Total annual cost attributed to unused office space</p>
        </div>

        <div class="calculation-step">
            <strong>Step 4: Recoverable Savings</strong>
            <div class="formula">RecoverableSavings = AnnualWaste × 0.75</div>
            <div class="formula">${formatCurrency(results.annualWaste)} × 75% = ${formatCurrency(potentialSavings)}</div>
            <p>Explanation: Realistic savings achievable through flexible workspace optimization</p>
        </div>

        <div class="calculation-step">
            <strong>Step 5: Savings Percentage</strong>
            <div class="formula">SavingsPercent = (RecoverableSavings ÷ AnnualCost) × 100</div>
            <div class="formula">${formatCurrency(potentialSavings)} ÷ ${formatCurrency(results.annualCost)} × 100 = ${results.costCutPercentage.toFixed(1)}%</div>
            <p>Explanation: Percentage of total office costs saved annually</p>
        </div>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <h3>The Flexible Workspace Solution</h3>
        <p>Leverage ${emailData.location}'s competitive €400/month flex desk rates and optimized utilization benchmarks to design a right-sized workspace portfolio that maximizes cost efficiency and employee experience.</p>
        
        <h4>Recommended Strategy</h4>
        <p>For ${emailData.company}, a phased flexible workspace implementation can strategically reduce physical footprint while maintaining collaboration zones and eliminating underutilized space.</p>
    </div>

    <div class="section">
        <h3>Financial Impact Summary</h3>
        <div class="key-metrics">
            <div class="metric-card">
                <div class="metric-value">${formatCurrency(results.annualCost)}</div>
                <div class="metric-label">Current Annual Cost</div>
            </div>
            <div class="metric-card">
                <div class="metric-value savings">${formatCurrency(results.annualCost - potentialSavings)}</div>
                <div class="metric-label">With Flex Solution</div>
            </div>
            <div class="metric-card">
                <div class="metric-value savings">${formatCurrency(potentialSavings)}</div>
                <div class="metric-label">Annual Savings</div>
            </div>
            <div class="metric-card">
                <div class="metric-value savings">${results.costCutPercentage.toFixed(1)}%</div>
                <div class="metric-label">Savings Percentage</div>
            </div>
        </div>

        <h4>Key Benefits</h4>
        <ul class="benefits-list">
            <li>${results.costCutPercentage.toFixed(1)}% immediate cost reduction</li>
            <li>Enhanced workforce flexibility</li>
            <li>Reduced real estate fixed costs</li>
            <li>Improved employee productivity and satisfaction</li>
            <li>Scalable workplace infrastructure</li>
        </ul>
    </div>

    <div class="section">
        <h3>Employee Experience Benefits</h3>
        <ul class="benefits-list">
            <li>72% report increased productivity with hybrid models (Gartner, 2021)</li>
            <li>71% see improved ability to attract and retain talent (PwC Future of Work, 2022)</li>
            <li>Enhanced work-life balance and reduced commute stress (McKinsey Global Institute, 2021)</li>
            <li>Access to premium locations and professional amenities (JLL Workplace Insights, 2023)</li>
            <li>Networking opportunities in collaborative environments (Cushman Wakefield, 2022)</li>
        </ul>
    </div>

    <div class="next-steps">
        <h3>Next Steps & Implementation</h3>
        <h4>Ready to Explore Your Options?</h4>
        
        <p><strong>Option 1: Strategic Consultation</strong></p>
        <ul>
            <li>Understand the implementation process</li>
            <li>Discuss specific locations & needs</li>
            <li>Get leadership questions answered</li>
            <li>Plan a pilot program</li>
        </ul>

        <p><strong>Option 2: Get Office Proposals</strong></p>
        <ul>
            <li>Curated spaces in ${emailData.location}</li>
            <li>Team-size based pricing</li>
            <li>Photos & amenity details</li>
            <li>Availability + booking terms</li>
        </ul>
    </div>

    <div class="footer">
        <p><strong>Appendix – Detailed Calculations & Methodology</strong></p>
        <p>This analysis is based on current market data and industry benchmarks for ${emailData.location}. Results may vary based on specific implementation details and market conditions.</p>
        <p>Report generated by Flexible Workspace ROI Calculator | Report ID: ${reportId} | Generated: ${currentDate}</p>
    </div>
</body>
</html>
    `

    const base64Content = Buffer.from(htmlContent).toString("base64")

    return NextResponse.json({
      success: true,
      base64: base64Content,
      reportId,
      filename: `savings-report-${emailData.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.html`,
      message: "HTML report generated successfully",
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate report",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
