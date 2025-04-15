"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database } from "lucide-react"
import BorrowerForm from "@/components/borrower-form"
import LenderForm from "@/components/lender-form"
import MatchesDashboard from "@/components/matches-dashboard"
import RiskAssessmentDashboard from "@/components/risk-assessment-dashboard"
import DataGenerationPanel from "@/components/data-generation-panel"
import type { Borrower, Lender, Match, LoanRecommendation } from "@/lib/types"
import { generateSyntheticBorrowers, generateSyntheticLenders } from "@/lib/synthetic-data-generator"
import { assessRisk } from "@/lib/risk-assessment-model"
import { matchBorrowersWithLenders } from "@/lib/matching-algorithm"
import { generateLoanRecommendations } from "@/lib/loan-recommendation"
import { fetchMarketRates } from "@/lib/api-service"

export default function Home() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [lenders, setLenders] = useState<Lender[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [recommendations, setRecommendations] = useState<LoanRecommendation[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [marketRates, setMarketRates] = useState<{ [key: string]: number }>({})
  const [showDataPanel, setShowDataPanel] = useState(false)

  // Fetch market rates on initial load
  useEffect(() => {
    const getMarketRates = async () => {
      const rates = await fetchMarketRates()
      setMarketRates(rates)
    }
    getMarketRates()
  }, [])

  // Load sample data on initial render
  useEffect(() => {
    const loadSampleData = async () => {
      const sampleBorrowers = generateSyntheticBorrowers(3)
      const sampleLenders = generateSyntheticLenders(2)

      // Assess risk for each borrower
      const borrowersWithRisk = await Promise.all(
        sampleBorrowers.map(async (borrower) => {
          const riskAssessment = await assessRisk(borrower)
          return { ...borrower, riskScore: riskAssessment.riskScore }
        }),
      )

      setBorrowers(borrowersWithRisk)
      setLenders(sampleLenders)

      // Generate initial matches
      const initialMatches = await matchBorrowersWithLenders(borrowersWithRisk, sampleLenders)
      setMatches(initialMatches)

      // Generate loan recommendations
      const initialRecommendations = await generateLoanRecommendations(borrowersWithRisk, sampleLenders, marketRates)
      setRecommendations(initialRecommendations)
    }

    loadSampleData()
  }, [])

  const addBorrower = async (borrower: Borrower) => {
    setIsProcessing(true)

    // Assess risk for the new borrower
    const riskAssessment = await assessRisk(borrower)
    const borrowerWithRisk = {
      ...borrower,
      id: Date.now().toString(),
      riskScore: riskAssessment.riskScore,
    }

    const newBorrowers = [...borrowers, borrowerWithRisk]
    setBorrowers(newBorrowers)

    // Update matches and recommendations if there are lenders
    if (lenders.length > 0) {
      const newMatches = await matchBorrowersWithLenders(newBorrowers, lenders)
      setMatches(newMatches)

      const newRecommendations = await generateLoanRecommendations(newBorrowers, lenders, marketRates)
      setRecommendations(newRecommendations)
    }

    setIsProcessing(false)
  }

  const addLender = async (lender: Lender) => {
    setIsProcessing(true)

    const newLenders = [...lenders, { ...lender, id: Date.now().toString() }]
    setLenders(newLenders)

    // Update matches and recommendations if there are borrowers
    if (borrowers.length > 0) {
      const newMatches = await matchBorrowersWithLenders(borrowers, newLenders)
      setMatches(newMatches)

      const newRecommendations = await generateLoanRecommendations(borrowers, newLenders, marketRates)
      setRecommendations(newRecommendations)
    }

    setIsProcessing(false)
  }

  const handleRefreshData = async () => {
    setIsProcessing(true)

    // Regenerate matches and recommendations
    const newMatches = await matchBorrowersWithLenders(borrowers, lenders)
    setMatches(newMatches)

    // Fetch latest market rates
    const rates = await fetchMarketRates()
    setMarketRates(rates)

    const newRecommendations = await generateLoanRecommendations(borrowers, lenders, rates)
    setRecommendations(newRecommendations)

    setIsProcessing(false)
  }

  const handleGenerateSyntheticData = async (borrowerCount: number, lenderCount: number) => {
    setIsProcessing(true)

    const syntheticBorrowers = generateSyntheticBorrowers(borrowerCount)
    const syntheticLenders = generateSyntheticLenders(lenderCount)

    // Assess risk for each synthetic borrower
    const borrowersWithRisk = await Promise.all(
      syntheticBorrowers.map(async (borrower) => {
        const riskAssessment = await assessRisk(borrower)
        return { ...borrower, riskScore: riskAssessment.riskScore }
      }),
    )

    setBorrowers(borrowersWithRisk)
    setLenders(syntheticLenders)

    // Generate matches and recommendations
    const newMatches = await matchBorrowersWithLenders(borrowersWithRisk, syntheticLenders)
    setMatches(newMatches)

    const newRecommendations = await generateLoanRecommendations(borrowersWithRisk, syntheticLenders, marketRates)
    setRecommendations(newRecommendations)

    setIsProcessing(false)
    setShowDataPanel(false)
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI-Driven P2P Lending Advisor</h1>
          <p className="text-muted-foreground">Match borrowers with lenders using AI risk assessment</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDataPanel(!showDataPanel)} className="flex items-center">
            <Database className="mr-2 h-4 w-4" />
            {showDataPanel ? "Hide Data Panel" : "Generate Data"}
          </Button>

          <Button
            onClick={handleRefreshData}
            disabled={isProcessing || borrowers.length === 0 || lenders.length === 0}
            className="flex items-center"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
            Refresh Analysis
          </Button>
        </div>
      </div>

      {showDataPanel && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generate Synthetic Data</CardTitle>
            <CardDescription>Create synthetic borrowers and lenders to test the system</CardDescription>
          </CardHeader>
          <CardContent>
            <DataGenerationPanel onGenerate={handleGenerateSyntheticData} isProcessing={isProcessing} />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="borrowers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="borrowers">Borrowers</TabsTrigger>
          <TabsTrigger value="lenders">Lenders</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="borrowers">
          <Card>
            <CardHeader>
              <CardTitle>Borrower Registration</CardTitle>
              <CardDescription>Fill out this form to request a loan</CardDescription>
            </CardHeader>
            <CardContent>
              <BorrowerForm onSubmit={addBorrower} isProcessing={isProcessing} />
            </CardContent>
          </Card>

          {borrowers.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Registered Borrowers</CardTitle>
                <CardDescription>{borrowers.length} borrowers in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {borrowers.map((borrower) => (
                    <Card key={borrower.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{borrower.name}</CardTitle>
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              borrower.riskScore < 30
                                ? "bg-green-100 text-green-800"
                                : borrower.riskScore < 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            Risk: {borrower.riskScore}%
                          </div>
                        </div>
                        <CardDescription>{borrower.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm space-y-1">
                          <p>
                            <strong>Amount:</strong> ${borrower.loanAmount.toLocaleString()}
                          </p>
                          <p>
                            <strong>Purpose:</strong> {borrower.loanPurpose}
                          </p>
                          <p>
                            <strong>Credit Score:</strong> {borrower.creditScore}
                          </p>
                          <p>
                            <strong>Income:</strong> ${borrower.income.toLocaleString()}/year
                          </p>
                          <p>
                            <strong>Employment:</strong> {borrower.employmentStatus}
                          </p>
                          <p>
                            <strong>Debt-to-Income:</strong> {borrower.debtToIncomeRatio}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="lenders">
          <Card>
            <CardHeader>
              <CardTitle>Lender Registration</CardTitle>
              <CardDescription>Fill out this form to offer loans</CardDescription>
            </CardHeader>
            <CardContent>
              <LenderForm onSubmit={addLender} isProcessing={isProcessing} marketRates={marketRates} />
            </CardContent>
          </Card>

          {lenders.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Registered Lenders</CardTitle>
                <CardDescription>{lenders.length} lenders in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {lenders.map((lender) => (
                    <Card key={lender.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{lender.name}</CardTitle>
                        <CardDescription>{lender.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm space-y-1">
                          <p>
                            <strong>Amount to Lend:</strong> ${lender.amountToLend.toLocaleString()}
                          </p>
                          <p>
                            <strong>Min Credit Score:</strong> {lender.minCreditScore}
                          </p>
                          <p>
                            <strong>Interest Rate:</strong> {lender.interestRate}%
                          </p>
                          <p>
                            <strong>Max Risk Tolerance:</strong> {lender.maxRiskTolerance}%
                          </p>
                          <p>
                            <strong>Loan Terms:</strong> {lender.loanTerms.join(", ")} months
                          </p>
                          <p>
                            <strong>Preferred Purposes:</strong> {lender.preferredPurposes.join(", ")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="risk">
          <RiskAssessmentDashboard borrowers={borrowers} recommendations={recommendations} marketRates={marketRates} />
        </TabsContent>

        <TabsContent value="matches">
          <MatchesDashboard
            matches={matches}
            recommendations={recommendations}
            isLoading={isProcessing}
            borrowers={borrowers}
            lenders={lenders}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}

