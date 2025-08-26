export interface PDFReportData {
  emailData: {
    name: string
    email: string
    company: string
    location: string
  }
  calculatorData: {
    officeSize: string
    monthlyCost: string
    utilization: string
    workModel: string
    companyName: string
    numberOfEmployees: string
    organisationName: string
    currentWorkstations: string
    workstationUtilization: string
    annualCostPerWorkstation?: string
  }
  results: {
    annualWaste: number
    monthlyWaste: number
    costCutPercentage: number
    annualCost: number
    calculationMethod: "workstations" | "m2"
  }
}

export function generateReportHTML(data: PDFReportData): string {
  const { emailData, calculatorData, results } = data
  const reportId = Math.random().toString(36).substr(2, 9)
  const currentDate = new Date().toLocaleDateString("en-GB")

  // Calculate additional metrics
  const potentialSavings = results.annualWaste * 0.75
  const optimizedCost = results.annualCost - potentialSavings
  const spaceEfficiencyGain =
    results.calculationMethod === "workstations"
      ? `${calculatorData.workstationUtilization}% → 85%`
      : `${calculatorData.utilization}% → 85%`

  const workstationCost = calculatorData.annualCostPerWorkstation
    ? Number(calculatorData.annualCostPerWorkstation)
    : 9000
  const workstationCostDisplay = workstationCost.toLocaleString()

  const isWorkstationBased = results.calculationMethod === "workstations"
  const workstationCount = calculatorData.currentWorkstations || calculatorData.numberOfEmployees || "Not specified"
  const utilizationRate = isWorkstationBased ? calculatorData.workstationUtilization : calculatorData.utilization

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workspace Savings Analysis - ${emailData.company}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #333; 
            background: #f8fafc;
        }
        .container { max-width: 800px; margin: 0 auto; background: white; }
        .header { 
            background: #000053;
            color: white; 
            padding: 40px 30px; 
            text-align: center;
            position: relative; /* Adding relative positioning to header for logo placement */
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; font-weight: 600; }
        .header p { font-size: 16px; opacity: 0.9; }
        .executive-summary { 
            padding: 30px; 
            background: #f1f5f9; 
            border-left: 4px solid #000053;
        }
        .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
            gap: 20px; 
            margin: 20px 0;
        }
        .metric-card { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric-value { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 5px;
        }
        .metric-label { 
            font-size: 14px; 
            color: #64748b;
        }
        .savings { color: #16a34a; }
        .waste { color: #dc2626; }
        .section { padding: 30px; border-bottom: 1px solid #e2e8f0; }
        .section h2 { 
            font-size: 22px; 
            margin-bottom: 20px; 
            color: #1e293b;
            border-bottom: 2px solid #000053;
            padding-bottom: 10px;
        }
        .calculation-step { 
            background: #f8fafc; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 6px;
            border-left: 3px solid #000053;
        }
        .formula { 
            font-family: 'Courier New', monospace; 
            background: #e2e8f0; 
            padding: 8px; 
            border-radius: 4px;
            margin: 5px 0;
        }
        .client-info { 
            background: #f1f5f9; 
            padding: 20px; 
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer { 
            background: #1e293b; 
            color: white; 
            padding: 20px 30px; 
            text-align: center;
            font-size: 14px;
        }
        .benefits-list { 
            list-style: none; 
            padding: 0;
        }
        .benefits-list li { 
            padding: 8px 0; 
            padding-left: 25px;
            position: relative;
        }
        .benefits-list li:before { 
            content: "✓"; 
            position: absolute; 
            left: 0; 
            color: #16a34a; 
            font-weight: bold;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Workspace Savings Analysis</h1>
            <p>Executive Summary</p>
            <!-- Adding Facile logo to top right corner of header -->
            <div style="position: absolute; top: 20px; right: 30px; width: 60px; height: 60px;">
                <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Facile_icon1024.jpg-r2mR0ZNJHjeOuuPzfNWP0a49W2DmbF.png" alt="Facile Logo" style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
        </div>

        <div class="executive-summary">
            <p>By implementing Facile, you can fully transition to a flexible workspace strategy, and in time reduce real estate costs by <strong>${results.costCutPercentage.toFixed(1)}%</strong>, optimising a <strong>€${(results.annualCost / 1000000).toFixed(1)}M</strong> annual expense with minimal disruption. The proposed hybrid model leverages workspace dynamically to drive significant operational efficiency and cost savings.</p>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value waste">€${(results.annualWaste / 1000000).toFixed(1)}M</div>
                    <div class="metric-label">Annual Waste</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value savings">€${(potentialSavings / 1000000).toFixed(1)}M</div>
                    <div class="metric-label">Potential Savings</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${spaceEfficiencyGain}</div>
                    <div class="metric-label">${isWorkstationBased ? "Workstation" : "Space"} Efficiency</div>
                </div>
            </div>
        </div>

        <div class="client-info">
            <h3>Personalized Report for ${emailData.company}</h3>
            <p><strong>Prepared for:</strong> ${emailData.name}, ${emailData.company}</p>
            <p><strong>Date:</strong> ${currentDate} | <strong>Location:</strong> ${emailData.location} | <strong>Report ID:</strong> ${reportId}</p>
            <p><strong>Calculation Method:</strong> ${isWorkstationBased ? "Workstation-based Analysis" : "Office Space (M²) Analysis"}</p>
        </div>

        <div class="section">
            <h2>Your Current Situation</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4>${isWorkstationBased ? "Workstation Portfolio" : "Office Portfolio"}</h4>
                    <ul style="list-style: none; padding: 10px 0;">
                        <li><strong>Team Size:</strong> ${calculatorData.numberOfEmployees || "Not specified"}</li>
                        ${
                          isWorkstationBased
                            ? `
                        <li><strong>Current Workstations:</strong> ${workstationCount}</li>
                        <li><strong>Workstation Cost:</strong> €${workstationCostDisplay} per workstation annually</li>
                        <li><strong>Annual Cost:</strong> €${results.annualCost.toLocaleString()}</li>
                        <li><strong>Workstation Utilization:</strong> ${calculatorData.workstationUtilization}%</li>
                        `
                            : `
                        <li><strong>Office Space:</strong> ${calculatorData.officeSize} m²</li>
                        <li><strong>Monthly Cost:</strong> €${Number(calculatorData.monthlyCost).toLocaleString()}</li>
                        <li><strong>Annual Cost:</strong> €${results.annualCost.toLocaleString()}</li>
                        <li><strong>Space Utilization:</strong> ${calculatorData.utilization}%</li>
                        `
                        }
                    </ul>
                </div>
                <div>
                    <h4>Context</h4>
                    <p>Modern workplace environments foster collaboration, drive productivity, and strengthen talent attraction. By implementing a scalable infrastructure that maximises the dynamic use of office space, organisations can optimise their space and hybrid work models — enabling them to adapt quickly while significantly reducing fixed overhead costs.</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Calculation breakdown</h2>
            
            <div style="background: #e0f2fe; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #000053;">
                <h4 style="color: #000053; margin-bottom: 10px;">Calculation Method: ${isWorkstationBased ? "Workstation-Based Analysis" : "Office Space (M²) Analysis"}</h4>
                <p>${
                  isWorkstationBased
                    ? `This analysis calculates savings based on workstation costs and utilization rates, using ${calculatorData.annualCostPerWorkstation ? "your specified" : "an industry-standard"} annual cost of €${workstationCostDisplay} per workstation.`
                    : "This analysis calculates savings based on office space costs and occupancy rates, using your monthly office expenditures and space utilization data."
                }</p>
            </div>
            
            <div class="calculation-step">
                <h4>Step 1: Annual Cost Calculation</h4>
                ${
                  isWorkstationBased
                    ? `
                <div class="formula">Annual Cost = Number of Workstations × €${workstationCostDisplay}</div>
                <div class="formula">${workstationCount} workstations × €${workstationCostDisplay} = €${results.annualCost.toLocaleString()}</div>
                <p>Total annual workstation cost based on ${calculatorData.annualCostPerWorkstation ? "your specified cost of" : "industry-standard"} €${workstationCostDisplay} per workstation</p>
                `
                    : `
                <div class="formula">Annual Cost = Monthly Cost × 12</div>
                <div class="formula">€${Number(calculatorData.monthlyCost).toLocaleString()} × 12 = €${results.annualCost.toLocaleString()}</div>
                <p>Total annual office cost based on current monthly spending</p>
                `
                }
            </div>

            <div class="calculation-step">
                <h4>Step 2: Waste Factor Analysis</h4>
                <div class="formula">Waste Factor = 100% - ${isWorkstationBased ? "Workstation Utilization" : "Space Utilization"}%</div>
                <div class="formula">100% - ${utilizationRate}% = ${100 - Number(utilizationRate)}%</div>
                <p>Percentage of ${isWorkstationBased ? "workstations" : "office space"} that remains unused</p>
            </div>

            <div class="calculation-step">
                <h4>Step 3: Annual Waste Calculation</h4>
                <div class="formula">Annual Waste = Annual Cost × Waste Factor</div>
                <div class="formula">€${results.annualCost.toLocaleString()} × ${100 - Number(utilizationRate)}% = €${(results.annualCost * ((100 - Number(utilizationRate)) / 100)).toLocaleString()}</div>
                <p>Total annual cost attributed to unused ${isWorkstationBased ? "workstations" : "office space"}</p>
            </div>

            ${
              calculatorData.workModel === "hybrid" || calculatorData.workModel === "remote"
                ? `
            <div class="calculation-step">
                <h4>Step 4: Working Arrangement Adjustment</h4>
                <div class="formula">Adjusted Waste = Annual Waste × Working Arrangement Multiplier</div>
                <div class="formula">€${(results.annualCost * ((100 - Number(utilizationRate)) / 100)).toLocaleString()} × ${calculatorData.workModel === "hybrid" ? "0.90" : "0.85"} = €${results.annualWaste.toLocaleString()}</div>
                <p><strong>Working Arrangement Multiplier: ${calculatorData.workModel === "hybrid" ? "0.90" : "0.85"}</strong> - Applied to reflect the ${calculatorData.workModel === "hybrid" ? "10%" : "15%"} reduction in waste due to ${calculatorData.workModel} working patterns</p>
                <div style="background: #e0f2fe; padding: 10px; border-radius: 4px; margin-top: 10px; font-size: 14px;">
                    <strong>Impact:</strong> This adjustment reduces the baseline waste calculation from €${(results.annualCost * ((100 - Number(utilizationRate)) / 100)).toLocaleString()} to €${results.annualWaste.toLocaleString()}, reflecting the more efficient space utilisation typical of ${calculatorData.workModel} work models.
                </div>
            </div>
            `
                : ""
            }

            <div class="calculation-step">
                <h4>Step ${calculatorData.workModel === "hybrid" || calculatorData.workModel === "remote" ? "5" : "4"}: Recoverable Savings</h4>
                <div class="formula">Recoverable Savings = ${calculatorData.workModel === "hybrid" || calculatorData.workModel === "remote" ? "Adjusted Waste" : "Annual Waste"} × 75%</div>
                <div class="formula">€${results.annualWaste.toLocaleString()} × 75% = €${potentialSavings.toLocaleString()}</div>
                <p>Realistic savings achievable through flexible workspace optimization</p>
            </div>

            <div class="calculation-step">
                <h4>Step ${calculatorData.workModel === "hybrid" || calculatorData.workModel === "remote" ? "6" : "5"}: Savings Percentage</h4>
                <div class="formula">Savings Percent = Annual Savings ÷ Annual Cost × 100</div>
                <div class="formula">€${potentialSavings.toLocaleString()} ÷ €${results.annualCost.toLocaleString()} × 100 = ${results.costCutPercentage.toFixed(1)}%</div>
                <p>Percentage of total ${isWorkstationBased ? "workstation" : "office"} costs saved annually</p>
            </div>

            ${
              calculatorData.workModel === "hybrid" || calculatorData.workModel === "remote"
                ? `
            <div class="calculation-step">
                <h4>Step 7: Financial Impact Summary</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div>
                        <h4>Cost Comparison</h4>
                        <ul style="list-style: none;">
                            <li><strong>Current Annual:</strong> €${results.annualCost.toLocaleString()}</li>
                            <li><strong>With Flex Solution:</strong> €${optimizedCost.toLocaleString()}</li>
                            <li><strong>Annual Savings:</strong> <span class="savings">€${potentialSavings.toLocaleString()}</span></li>
                            <li><strong>Savings Percentage:</strong> <span class="savings">${results.costCutPercentage.toFixed(1)}%</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Key Benefits</h4>
                        <ul class="benefits-list">
                            <li>${results.costCutPercentage.toFixed(1)}% immediate cost reduction</li>
                            <li>Enhanced workforce flexibility</li>
                            <li>Reduced real estate fixed costs</li>
                            <li>Improved employee productivity and satisfaction</li>
                            <li>Scalable workplace infrastructure</li>
                        </ul>
                    </div>
                </div>
            </div>
            `
                : `
            <div class="calculation-step">
                <h4>Step 4: Financial Impact Summary</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div>
                        <h4>Cost Comparison</h4>
                        <ul style="list-style: none;">
                            <li><strong>Current Annual:</strong> €${results.annualCost.toLocaleString()}</li>
                            <li><strong>With Flex Solution:</strong> €${optimizedCost.toLocaleString()}</li>
                            <li><strong>Annual Savings:</strong> <span class="savings">€${potentialSavings.toLocaleString()}</span></li>
                            <li><strong>Savings Percentage:</strong> <span class="savings">${results.costCutPercentage.toFixed(1)}%</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Key Benefits</h4>
                        <ul class="benefits-list">
                            <li>${results.costCutPercentage.toFixed(1)}% immediate cost reduction</li>
                            <li>Enhanced workforce flexibility</li>
                            <li>Reduced real estate fixed costs</li>
                            <li>Improved employee productivity and satisfaction</li>
                            <li>Scalable workplace infrastructure</li>
                        </ul>
                    </div>
                </div>
            </div>
            `
            }
        </div>

        <div class="section">
            <h2>Calculation Assumptions & Methodology</h2>
            
            ${
              isWorkstationBased
                ? `
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #1e40af; margin-bottom: 15px;">Workstation-Based Calculation Methodology</h4>
                <p>This analysis uses a <strong>workstation-centric approach</strong> with ${calculatorData.annualCostPerWorkstation ? "your specified" : "an industry-standard"} annual cost of <strong>€${workstationCostDisplay} per workstation</strong>. This figure represents the comprehensive cost of providing a fully-equipped workspace including:</p>
                <ul style="margin: 15px 0 15px 20px; line-height: 1.8;">
                    <li><strong>Physical Infrastructure:</strong> Desk, chair, storage, and workspace setup</li>
                    <li><strong>Technology & Equipment:</strong> IT hardware, software licenses, and connectivity</li>
                    <li><strong>Facilities Overhead:</strong> Proportional share of utilities, cleaning, security, and maintenance</li>
                    <li><strong>Space Allocation:</strong> Individual workspace plus shared areas (meeting rooms, common areas, etc.)</li>
                </ul>
                <p>The default workstation count is set to match your employee count (1:1 ratio) unless specifically overridden, reflecting standard office planning practices.</p>
            </div>
            `
                : `
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #1e40af; margin-bottom: 15px;">Office Space (M²) Calculation Methodology</h4>
                <p>This analysis uses a <strong>space-centric approach</strong> based on your actual monthly office expenditures and space utilization rates. This method provides precise cost analysis based on:</p>
                <ul style="margin: 15px 0 15px 20px; line-height: 1.8;">
                    <li><strong>Actual Costs:</strong> Your reported monthly office expenditures</li>
                    <li><strong>Space Efficiency:</strong> Current occupancy rates and space utilization patterns</li>
                    <li><strong>Comprehensive Overhead:</strong> All facilities costs including rent, utilities, maintenance, and services</li>
                    <li><strong>Real Estate Metrics:</strong> Cost per square meter and space optimization opportunities</li>
                </ul>
                <p>This approach provides detailed insights into space efficiency and real estate cost optimization opportunities.</p>
            </div>
            `
            }
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #000053;">
                <h4 style="color: #000053; margin-bottom: 15px;">75% Recovery Rate Rationale</h4>
                <p>The 75% recovery rate represents the <strong>realistic percentage of identified waste that can actually be recaptured</strong> through flexible workspace optimization. This conservative industry benchmark accounts for real-world implementation constraints and is based on extensive case studies from leading workspace providers.</p>
            </div>

            <div class="calculation-step">
                <h4>Key Assumptions & Contributing Factors</h4>
                <div style="margin: 15px 0;">
                    <h5 style="color: #dc2626; margin-bottom: 10px;">Operational Constraints (25% Loss Factors):</h5>
                    <ul style="margin-left: 20px; line-height: 1.8;">
                        <li><strong>Lease Obligations:</strong> Existing long-term office leases that cannot be immediately terminated</li>
                        <li><strong>Utility Contracts:</strong> Fixed infrastructure costs that continue during transition periods</li>
                        <li><strong>Operational Commitments:</strong> Essential services and maintenance contracts that remain necessary</li>
                        <li><strong>Transition Costs:</strong> One-time expenses for workspace setup, employee onboarding, and change management</li>
                    </ul>
                </div>
                
                <div style="margin: 15px 0;">
                    <h5 style="color: #1e40af; margin-bottom: 10px;">Implementation Realities:</h5>
                    <ul style="margin-left: 20px; line-height: 1.8;">
                        <li><strong>Gradual Rollout:</strong> Most organisations implement flexible workspace strategies in phases rather than overnight</li>
                        <li><strong>Employee Adaptation:</strong> Time needed for teams to adjust to new working patterns and optimise space usage</li>
                        <li><strong>Regulatory Requirements:</strong> Some industries require minimum physical office presence or specific workspace configurations</li>
                        <li><strong>Market Conditions:</strong> Local availability and pricing of flexible workspace options in ${emailData.location}</li>
                    </ul>
                </div>
            </div>

            <div class="calculation-step">
                <h4>Industry Validation & Supporting Data</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                    <div>
                        <h5 style="color: #16a34a; margin-bottom: 10px;">Conservative Approach Benefits:</h5>
                        <ul style="margin-left: 20px; line-height: 1.8;">
                            <li>Credible projections that stakeholders trust</li>
                            <li>Risk mitigation for unforeseen challenges</li>
                            <li>Achievable targets with realistic ROI timelines</li>
                            <li>Buffer for market fluctuations and implementation delays</li>
                        </ul>
                    </div>
                    <div>
                        <h5 style="color: #1e40af; margin-bottom: 10px;">Market Benchmarks:</h5>
                        <ul style="margin-left: 20px; line-height: 1.8;">
                            <li>Industry case studies show 70-80% typical recovery rates</li>
                            <li>Leading flexible workspace providers validate this range</li>
                            <li>Accounts for varying market conditions across locations</li>
                            <li>Reflects real-world implementation experiences</li>
                        </ul>
                    </div>
                </div>
                
                <div style="background: #e0f2fe; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #000053;">
                    <p><strong>Methodology Note:</strong> This 75% recovery rate ensures the savings calculator provides reliable, actionable insights rather than theoretical maximums that might not be achievable in practice. The approach prioritizes credible business planning over optimistic projections.</p>
                </div>
            </div>
        </div>

        ${
          calculatorData.workModel === "hybrid" || calculatorData.workModel === "remote"
            ? `
        <div class="section">
            <h2>Working Arrangement Impact Analysis</h2>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #000053;">
                <h4 style="color: #000053; margin-bottom: 15px;">Working Arrangement: ${calculatorData.workModel.charAt(0).toUpperCase() + calculatorData.workModel.slice(1)}</h4>
                <p><strong>Applied Multiplier:</strong> ${calculatorData.workModel === "hybrid" ? "0.90" : "0.85"}</p>
                
                <div style="margin-top: 20px;">
                    <h5 style="margin-bottom: 15px; color: #1e293b;">Rationale for ${calculatorData.workModel.charAt(0).toUpperCase() + calculatorData.workModel.slice(1)} Adjustment:</h5>
                    ${
                      calculatorData.workModel === "hybrid"
                        ? `
                    <p style="line-height: 1.6; margin-bottom: 15px;">When working with a realistic work year*, and assuming the use of a solid desk reservation system with well-distributed office attendance, it is reasonable to raise the structural occupancy ceiling to approximately 90% — provided that:</p>
                    <ul style="margin-left: 20px; line-height: 1.6; margin-bottom: 15px;">
                        <li>The organisation operates in a hybrid model (i.e., no one is present every day)</li>
                        <li>Attendance is actively managed (soft nudging or policy-driven)</li>
                        <li>Peak Occupancy is reduced by distributing office attendance across the work week</li>
                        <li>Utilisation is monitored (e.g., via sensors or reservation data)</li>
                    </ul>
                    <p style="line-height: 1.6; font-size: 14px; color: #64748b; font-style: italic;">*A full-time employee is typically only present around 212 days per year due to national holidays, statutory annual leave and sick leave; it is justifiable to work with a target occupancy rate of up to 90% in hybrid environments. We have based our assumptions on the EU average for national holidays, 25 days of annual leave, and a sickness absence rate of 5.5%.</p>
                    `
                        : `
                    <ul style="margin-left: 20px; line-height: 1.6;">
                        <li><strong>Minimal Office Dependency:</strong> Primary work location is remote with occasional office visits</li>
                        <li><strong>Collaborative Space Focus:</strong> Office space primarily used for meetings and team collaboration</li>
                        <li><strong>Reduced Individual Workstations:</strong> Emphasis on shared and flexible meeting spaces</li>
                        <li><strong>Event-Based Usage:</strong> Office utilization concentrated around specific business needs</li>
                    </ul>
                    `
                    }
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 6px;">
                    <p style="line-height: 1.6; color: #475569;"><strong>Impact on Analysis:</strong> This working arrangement adjustment ensures the savings calculation accurately reflects your organisation's actual workspace needs and utilisation patterns, providing realistic projections for ${calculatorData.workModel} work models.</p>
                </div>
            </div>
        </div>
        `
            : ""
        }

        <div class="section">
            <h2>Next Steps & Implementation</h2>
            <p>Ready to explore your options? We recommend starting with a strategic consultation to understand the implementation process, discuss specific locations and needs, and plan a pilot program tailored to ${emailData.company}'s requirements.</p>
            
            <div style="margin-top: 20px; padding: 20px; background: #f1f5f9; border-radius: 8px;">
                <h4>Recommended Timeline</h4>
                <ul>
                    <li><strong>Week 1-2:</strong> Strategic consultation and needs assessment</li>
                    <li><strong>Week 3-4:</strong> Organisational evaluation and location scouting</li>
                    <li><strong>Week 5-8:</strong> Program implementation</li>
                    <li><strong>Month 3+:</strong> Full rollout and optimisation</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>This analysis is based on current market data and industry benchmarks. Results may vary.</p>
            <p>Report generated by Savings Calculator | Generated: ${currentDate}</p>
        </div>
    </div>
</body>
</html>`
}
