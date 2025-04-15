"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface DataGenerationPanelProps {
  onGenerate: (borrowerCount: number, lenderCount: number) => void
  isProcessing: boolean
}

export default function DataGenerationPanel({ onGenerate, isProcessing }: DataGenerationPanelProps) {
  const [borrowerCount, setBorrowerCount] = useState(5)
  const [lenderCount, setLenderCount] = useState(3)

  const handleGenerate = () => {
    onGenerate(borrowerCount, lenderCount)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="borrowerCount">Number of Borrowers</Label>
          <Input
            id="borrowerCount"
            type="number"
            min={1}
            max={20}
            value={borrowerCount}
            onChange={(e) => setBorrowerCount(Number.parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lenderCount">Number of Lenders</Label>
          <Input
            id="lenderCount"
            type="number"
            min={1}
            max={10}
            value={lenderCount}
            onChange={(e) => setLenderCount(Number.parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
        <p className="font-medium text-amber-800">Note:</p>
        <p className="text-amber-700">
          Generating synthetic data will replace all existing borrowers and lenders in the system. This is useful for
          testing the AI matching and recommendation algorithms with diverse profiles.
        </p>
      </div>

      <Button onClick={handleGenerate} className="w-full" disabled={isProcessing}>
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Synthetic Data"
        )}
      </Button>
    </div>
  )
}

