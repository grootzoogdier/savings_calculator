"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Building2, Euro, BarChart3, Users, CheckCircle, Percent, Mail, User, MapPin, Monitor } from "lucide-react"
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface CalculatorData {
  officeSize: string
  monthlyCost: string
  utilization: string
  workModel: string
  companyName: string
  numberOfEmployees: string
  organisationName: string
  currentWorkstations: string
  workstationUtilization: string
  annualCostPerWorkstation: string
}

interface Results {
  annualWaste: number
  monthlyWaste: number
  costCutPercentage: number
  annualCost: number
  calculationMethod: "workstations" | "m2"
}

export default function SavingsCalculator() {
  const [calculationMethod, setCalculationMethod] = useState<"workstations" | "m2">("workstations")

  const [formData, setFormData] = useState<CalculatorData>({
    officeSize: "",
    monthlyCost: "",
    utilization: "",
    workModel: "hybrid", // Set hybrid as default to ensure 90% reduction is applied by default
    companyName: "",
    numberOfEmployees: "",
    organisationName: "",
    currentWorkstations: "",
    workstationUtilization: "",
    annualCostPerWorkstation: "9000",
  })

  const [results, setResults] = useState<Results | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailData, setEmailData] = useState({
    name: "",
    email: "",
    company: "",
    location: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [downloadToken, setDownloadToken] = useState<string | null>(null)
  const [showDownloadSection, setShowDownloadSection] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadComplete, setDownloadComplete] = useState(false)
  const [credentialsSubmitted, setCredentialsSubmitted] = useState(false)

  const calculateDefaultMonthlyCost = (officeSize: string) => {
    const size = Number.parseFloat(officeSize)
    if (size > 0) {
      // €650 per m² per annum ÷ 12 months
      return Math.round((size * 650) / 12).toString()
    }
    return ""
  }

  const handleOfficeSizeChange = (value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, officeSize: value }
      // Only auto-calculate if monthly cost is empty (not manually entered)
      if (!prev.monthlyCost || prev.monthlyCost === calculateDefaultMonthlyCost(prev.officeSize)) {
        newData.monthlyCost = calculateDefaultMonthlyCost(value)
      }
      return newData
    })
  }

  const calculateSavings = () => {
    let annualCost = 0
    let utilization = 0
    let annualWaste = 0

    if (calculationMethod === "workstations") {
      // Workstation-based calculation
      const workstations =
        Number.parseFloat(formData.currentWorkstations) || Number.parseFloat(formData.numberOfEmployees) || 0
      const workstationUtil = Number.parseFloat(formData.workstationUtilization) || 0
      const costPerWorkstation = Number.parseFloat(formData.annualCostPerWorkstation) || 9000

      // Annual cost = workstations × annual cost per workstation
      annualCost = workstations * costPerWorkstation
      utilization = workstationUtil

      // Waste factor
      const wasteFactor = (100 - utilization) / 100
      annualWaste = annualCost * wasteFactor
    } else {
      // M² based calculation (existing logic)
      const monthlyCost = Number.parseFloat(formData.monthlyCost) || 0
      utilization = Number.parseFloat(formData.utilization) || 0

      // Step 1: Annual Cost Calculation
      annualCost = monthlyCost * 12

      // Step 2: Waste Factor Analysis
      const wasteFactor = (100 - utilization) / 100

      // Step 3: Annual Waste Calculation
      annualWaste = annualCost * wasteFactor
    }

    // Step 3a: Working Arrangement Adjustments (same for both methods)
    let workingArrangementMultiplier = 1.0
    if (formData.workModel === "hybrid") {
      workingArrangementMultiplier = 0.9 // 10% reduction for hybrid
    } else if (formData.workModel === "remote") {
      workingArrangementMultiplier = 0.85 // 15% reduction for remote
    }

    annualWaste = annualWaste * workingArrangementMultiplier

    // Step 4: Recoverable Savings (75% recovery rate from PDF)
    const recoverableSavings = annualWaste * 0.75

    // Step 5: Net Annual Savings (assuming minimal flex workspace costs for now)
    const netAnnualSavings = recoverableSavings

    // Step 6: Savings Percentage
    const costCutPercentage = (netAnnualSavings / annualCost) * 100

    const monthlyWaste = annualWaste / 12

    setResults({
      annualWaste,
      monthlyWaste,
      costCutPercentage,
      annualCost,
      calculationMethod,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const hubspotData = {
        fields: [
          { name: "firstname", value: emailData.name.split(" ")[0] },
          { name: "lastname", value: emailData.name.split(" ").slice(1).join(" ") || emailData.name },
          { name: "email", value: emailData.email },
          { name: "company", value: emailData.company },
          { name: "city", value: emailData.location },
          // Add calculator data as custom fields
          { name: "organisation_name", value: formData.organisationName },
          { name: "number_of_employees", value: formData.numberOfEmployees },
          calculationMethod === "m2"
            ? { name: "total_office_size_m2", value: formData.officeSize || "0" }
            : {
                name: "current_workstations",
                value: formData.currentWorkstations || formData.numberOfEmployees || "0",
              },
          {
            name: "workstation_utilization_percent",
            value: formData.workstationUtilization || formData.utilization || "0",
          },
          {
            name: "annual_savings_potential",
            value: results ? Math.round(results.annualWaste * 0.75).toString() : "0",
          },
          { name: "calculation_method", value: calculationMethod },
        ],
      }

      // Submit to HubSpot Forms API
      const hubspotResponse = await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/8723359/623dd468-b19b-4891-9b8b-d54f80ead603`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(hubspotData),
        },
      )

      console.log("[v0] HubSpot submission response:", hubspotResponse.status)

      // Continue with internal API submission regardless of HubSpot result
      const response = await fetch("/api/submit-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailData,
          calculatorData: {
            ...formData,
            annualCostPerWorkstation: formData.annualCostPerWorkstation,
          },
          results,
        }),
      })

      const data = await response.json()

      if (data.success) {
        try {
          const emailCopyResponse = await fetch("/api/send-report", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              emailData: {
                ...emailData,
                // Add admin email here - you can replace with your actual email
                adminEmail: "richard.stoop@procosgroup.com", // Updated admin email
              },
              calculatorData: {
                ...formData,
                annualCostPerWorkstation: formData.annualCostPerWorkstation,
                // Include workstation data in email
                currentWorkstations: formData.currentWorkstations || formData.numberOfEmployees || "0",
                workstationUtilization: formData.workstationUtilization || formData.utilization || "0",
              },
              results,
            }),
          })

          const emailResult = await emailCopyResponse.json()
          console.log("[v0] Admin email copy sent:", emailResult.success)
        } catch (emailError) {
          console.error("[v0] Failed to send admin email copy:", emailError)
          // Don't fail the main process if email copy fails
        }

        setDownloadToken(data.downloadToken)
        setSubmitSuccess(true)
        setShowDownloadSection(true)
        setCredentialsSubmitted(true)

        setTimeout(() => {
          setShowEmailForm(false)
          setSubmitSuccess(false)
          setDownloadComplete(false)
          setEmailData({ name: "", email: "", company: "", location: "" })
        }, 8000)
      } else {
        throw new Error(data.error || "Failed to submit credentials")
      }
    } catch (error) {
      console.error("Error submitting credentials:", error)
      alert("Failed to submit credentials. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!downloadToken || !results) return

    setIsDownloading(true)

    try {
      const response = await fetch("/api/download-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          downloadToken,
          reportData: {
            emailData,
            calculatorData: {
              ...formData,
              annualCostPerWorkstation: formData.annualCostPerWorkstation,
            },
            results,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        const blob = new Blob([data.htmlContent], { type: "text/html" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = data.filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        setDownloadComplete(true)
      } else {
        throw new Error(data.error || "Failed to generate report")
      }
    } catch (error) {
      console.error("Error downloading report:", error)
      alert("Failed to download report. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const getChartData = () => {
    if (!results) return null

    const currentCost = results.annualCost
    const potentialSavings = results.annualWaste * 0.75
    const optimizedCost = currentCost - potentialSavings

    const costComparisonData = [
      {
        category: "Current",
        amount: currentCost,
        fill: "#dc2626", // More consistent red
      },
      {
        category: "Optimized",
        amount: optimizedCost,
        fill: "#16a34a", // More consistent green
      },
    ]

    return { costComparisonData }
  }

  const chartData = getChartData()

  const isFormValid = () => {
    if (calculationMethod === "workstations") {
      return formData.workstationUtilization && (formData.currentWorkstations || formData.numberOfEmployees)
    } else {
      return formData.monthlyCost && formData.utilization
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6 space-y-6">
              {/* Company Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="organisation-name"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Organisation name
                </Label>
                <Input
                  id="organisation-name"
                  type="text"
                  placeholder="Organisation Name"
                  value={formData.organisationName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, organisationName: e.target.value }))}
                  className={`text-base transition-all duration-500 ease-in-out ${
                    credentialsSubmitted ? "bg-blue-50 border-blue-200" : ""
                  }`}
                />
              </div>

              {/* Number of Employees */}
              <div className="space-y-2">
                <Label
                  htmlFor="number-of-employees"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Employees
                </Label>
                <Input
                  id="number-of-employees"
                  type="number"
                  placeholder={formData.numberOfEmployees || "1000"}
                  value={formData.numberOfEmployees}
                  onChange={(e) => setFormData((prev) => ({ ...prev, numberOfEmployees: e.target.value }))}
                  className={`text-base transition-all duration-500 ease-in-out ${
                    credentialsSubmitted ? "bg-blue-50 border-blue-200" : ""
                  }`}
                />
              </div>

              <div className="space-y-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setCalculationMethod("workstations")}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                      calculationMethod === "workstations"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Calculate based on workstations
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalculationMethod("m2")}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                      calculationMethod === "m2"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Calculate based on M²
                  </button>
                </div>

                {calculationMethod === "workstations" ? (
                  <>
                    {/* Current Number of Workstations */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="current-workstations"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Monitor className="w-4 h-4" />
                        Current number of workstations
                      </Label>
                      <Input
                        id="current-workstations"
                        type="number"
                        placeholder={formData.numberOfEmployees || "1000"}
                        value={formData.currentWorkstations}
                        onChange={(e) => setFormData((prev) => ({ ...prev, currentWorkstations: e.target.value }))}
                        className={`text-base transition-all duration-500 ease-in-out ${
                          credentialsSubmitted ? "bg-blue-50 border-blue-200" : ""
                        }`}
                      />
                      <p className="text-xs text-gray-500">Defaults to employee count if not specified</p>
                    </div>

                    {/* Workstation Utilization */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="workstation-utilization"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Workstation utilisation %
                      </Label>
                      <Input
                        id="workstation-utilization"
                        type="number"
                        placeholder="50"
                        min="0"
                        max="100"
                        value={formData.workstationUtilization}
                        onChange={(e) => setFormData((prev) => ({ ...prev, workstationUtilization: e.target.value }))}
                        className={`text-base transition-all duration-500 ease-in-out ${
                          credentialsSubmitted ? "bg-blue-50 border-blue-200" : ""
                        }`}
                      />
                    </div>

                    {/* Total Annual Cost per Workstation */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="annual-cost-per-workstation"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Euro className="w-4 h-4" />
                        Total annual cost per workstation
                      </Label>
                      <Input
                        id="annual-cost-per-workstation"
                        type="number"
                        placeholder="9000"
                        value={formData.annualCostPerWorkstation}
                        onChange={(e) => setFormData((prev) => ({ ...prev, annualCostPerWorkstation: e.target.value }))}
                        className={`text-base transition-all duration-500 ease-in-out ${
                          credentialsSubmitted ? "bg-blue-50 border-blue-200" : ""
                        }`}
                      />
                      <p className="text-xs text-gray-500">Default: €9,000 per workstation annually</p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Office Size */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="office-size"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4" />
                        Total office size (m²)
                      </Label>
                      <Input
                        id="office-size"
                        type="number"
                        placeholder="8000"
                        value={formData.officeSize}
                        onChange={(e) => handleOfficeSizeChange(e.target.value)}
                        className={`text-base transition-all duration-500 ease-in-out ${
                          credentialsSubmitted ? "bg-blue-50 border-blue-200" : ""
                        }`}
                      />
                    </div>

                    {/* Monthly Office Cost */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="monthly-cost"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Euro className="w-4 h-4" />
                        Total monthly office expenditures (€)
                      </Label>
                      <Input
                        id="monthly-cost"
                        type="number"
                        placeholder="275000"
                        value={formData.monthlyCost}
                        onChange={(e) => setFormData((prev) => ({ ...prev, monthlyCost: e.target.value }))}
                        className={`text-base transition-all duration-500 ease-in-out ${
                          credentialsSubmitted ? "bg-blue-50 border-blue-200" : ""
                        }`}
                      />
                      <p className="text-xs text-gray-500">
                        Auto-calculated at €650/m²/year. You can override this value.
                      </p>
                    </div>

                    {/* Average Utilisation */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="utilization"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Average occupancy %
                      </Label>
                      <Input
                        id="utilization"
                        type="number"
                        placeholder="50"
                        min="0"
                        max="100"
                        value={formData.utilization}
                        onChange={(e) => setFormData((prev) => ({ ...prev, utilization: e.target.value }))}
                        className={`text-base transition-all duration-500 ease-in-out ${
                          credentialsSubmitted ? "bg-blue-50 border-blue-200" : ""
                        }`}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Work Model */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Working arrangement
                </Label>
                <Select
                  value={formData.workModel}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, workModel: value }))}
                >
                  <SelectTrigger
                    className={`text-base transition-all duration-500 ease-in-out ${
                      credentialsSubmitted ? "bg-blue-50 border-blue-200" : ""
                    }`}
                  >
                    <SelectValue placeholder="Hybrid" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Calculate Button */}
              <Button
                onClick={calculateSavings}
                className="w-full hover:bg-blue-700 text-white font-medium py-3 text-base bg-[rgba(0,0,83,1)]"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Calculate Savings
              </Button>
            </CardContent>
          </Card>

          {/* Results Display */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              {results ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-100 border border-green-200 rounded-lg p-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-700 mb-2">
                          €
                          {(results.annualWaste * 0.75).toLocaleString("de-DE", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </div>
                        <div className="text-sm text-green-600 font-medium">Potential annual savings</div>
                      </div>
                    </div>

                    <div className="bg-red-100 border border-red-200 rounded-lg p-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 mb-2">
                          €
                          {results.annualWaste.toLocaleString("de-DE", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </div>
                        <div className="text-sm text-red-500 font-medium">Annual waste</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Euro className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">
                            {results.monthlyWaste.toLocaleString("de-DE", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                          </div>
                          <div className="text-sm text-gray-600">Monthly waste</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Percent className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{results.costCutPercentage.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">Cost reduction</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Comparison Chart */}
                  <div className="bg-gray-50 border rounded-lg p-6">
                    <div className="text-lg font-semibold mb-6 text-gray-800">Cost Comparison</div>
                    {chartData?.costComparisonData && (
                      <ChartContainer
                        config={{
                          amount: {
                            label: "Amount",
                          },
                        }}
                        className="h-[200px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData.costComparisonData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                          >
                            <XAxis
                              dataKey="category"
                              fontSize={12}
                              tick={{ fill: "#374151" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                              fontSize={11}
                              tick={{ fill: "#6b7280" }}
                              axisLine={false}
                              tickLine={false}
                              width={50}
                            />
                            <ChartTooltip
                              formatter={(value) => [formatCurrency(value as number), "Annual Cost"]}
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                fontSize: "13px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                            />
                            <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={120}>
                              {chartData.costComparisonData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    )}
                  </div>

                  {/* Enhanced Detailed Report Section */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Want the Complete Analysis?</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Get a comprehensive PDF report with a detailed explanation about our assumptions and
                        calculations.
                      </p>
                    </div>

                    <Button
                      onClick={() => setShowEmailForm(true)}
                      className="w-full hover:bg-blue-700 text-white font-medium py-4 text-base transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] bg-[rgba(0,0,83,1)]"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Get Detailed Report
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Your summary will appear here</h3>
                  <p className="text-sm">
                    Fill in your office details and click "Calculate Savings" to see your potential cost savings.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Form Dialog */}
      <Dialog open={showEmailForm} onOpenChange={setShowEmailForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "#000053" }}>
              <Mail className="w-5 h-5" />
              Get Your Comprehensive Report
            </DialogTitle>
          </DialogHeader>

          {submitSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Credentials Submitted Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your information has been securely stored and will be integrated with our CRM system. You can now
                download your comprehensive savings analysis report.
              </p>

              {showDownloadSection && (
                <div className="space-y-4">
                  <Button
                    onClick={handleDownloadReport}
                    disabled={isDownloading || downloadComplete}
                    className={`w-full font-medium py-3 transition-all duration-200 ${
                      downloadComplete ? "bg-green-600 hover:bg-green-700 text-white" : "text-white"
                    }`}
                    style={{ backgroundColor: downloadComplete ? undefined : "#000053" }}
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating Report...
                      </>
                    ) : downloadComplete ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Report Downloaded Successfully
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Download Your Report
                      </>
                    )}
                  </Button>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Your report includes:</strong>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Executive summary with key findings</li>
                      <li>• Step-by-step calculations</li>
                      <li>• Calculation reasoning</li>
                      <li>• Implementation timeline and next steps</li>
                    </ul>
                  </div>

                  {downloadComplete && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Next Steps:</strong> Review your comprehensive report and consider scheduling a
                        consultation to discuss implementation strategies tailored to your organization.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div
                className="border rounded-lg p-4 mb-4"
                style={{ backgroundColor: "rgba(0, 0, 83, 0.05)", borderColor: "rgba(0, 0, 83, 0.2)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: "#000053" }}
                  >
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#000053" }}>
                      Submit Your Credentials
                    </p>
                    <p className="text-xs" style={{ color: "rgba(0, 0, 83, 0.7)" }}>
                      Secure storage for CRM integration
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 opacity-60">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Download Your Report</p>
                    <p className="text-xs text-gray-600">Comprehensive analysis ready instantly</p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={emailData.name}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={emailData.email}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company
                </Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Your Company Name"
                  value={emailData.company}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, company: e.target.value }))}
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="The Netherlands" // Updated placeholder from "Den Haag" to "The Netherlands"
                  value={emailData.location}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(0, 0, 83, 0.05)" }}>
                <p className="text-sm" style={{ color: "#000053" }}>
                  After submitting your credentials, they will be securely stored. You'll immediately receive access to
                  download your comprehensive report with detailed calculations.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEmailForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 text-white transition-all duration-200"
                  style={{ backgroundColor: "#000053" }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      Submit & Get Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
