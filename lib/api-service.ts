"use client"

// Simulated API service for fetching financial data
// In a real application, this would connect to actual financial APIs

export async function fetchMarketRates(): Promise<{ [key: string]: number }> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return simulated market rates for different loan terms
  return {
    "3": 5.25,
    "6": 5.75,
    "12": 6.25,
    "24": 6.75,
    "36": 7.25,
    "48": 7.75,
    "60": 8.25,
  }
}

export async function fetchCreditScore(userId: string): Promise<number> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return a simulated credit score between 300 and 850
  return Math.floor(Math.random() * (850 - 300 + 1)) + 300
}

export async function fetchBankVerification(accountNumber: string): Promise<boolean> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Simulate a 90% success rate for bank verification
  return Math.random() < 0.9
}

export async function fetchEconomicIndicators(): Promise<{
  inflation: number
  unemployment: number
  gdpGrowth: number
}> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return simulated economic indicators
  return {
    inflation: Number.parseFloat((2 + Math.random() * 3).toFixed(1)),
    unemployment: Number.parseFloat((3 + Math.random() * 4).toFixed(1)),
    gdpGrowth: Number.parseFloat((1 + Math.random() * 3).toFixed(1)),
  }
}

