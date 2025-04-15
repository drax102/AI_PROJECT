// Helper function to generate a random number within a range
const randomInRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Helper function to generate a random element from an array
const randomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to generate a random name
const generateName = (): string => {
  const firstNames = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", 
    "William", "Elizabeth", "David", "Susan", "Richard", "Jessica", "Joseph", "Sarah",
    "Thomas", "Karen", "Charles", "Nancy", "Christopher", "Lisa", "Daniel", "Margaret"
  ];
  
  const lastNames = [
    "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson",
    "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin"
  ];
  
  return `${randomElement(firstNames)} ${randomElement(lastNames)}`;
};

// Helper function to generate a random email based on name
const generateEmail = (name: string): string => {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "example.com"];
  const nameParts = name.toLowerCase().split(" ");
  const randomNum = Math.floor(Math.random() * 1000);
  return `${nameParts[0]}.${nameParts[1]}${randomNum}@${randomElement(domains)}`;
};

// Generate synthetic borrowers
export const generateSyntheticBorrowers = (count: number): Borrower[] => {
  const borrowers: Borrower[] = [];
  
  const loanPurposes = [
    "education", "business", "home_improvement", "debt_consolidation", 
    "medical", "vehicle", "wedding", "vacation", "other"
  ];
  
  const employmentStatuses = [
    "full_time", "part_time", "self_employed", "unemployed", "retired", "student"
  ];
  
  const housingStatuses = [
    "own", "mortgage", "rent", "living_with_parents", "other"
  ];
  
  const loanTerms = [3, 6, 12, 24, 36, 48, 60];
  
  for (let i = 0; i < count; i++) {
    const name = generateName();
    const creditScore = randomInRange(500, 850);
    const income = randomInRange(20000, 150000);
    const employmentStatus = randomElement(employmentStatuses);
    
    // Adjust loan amount based on income
    const maxLoanAmount = Math.min(income * 0.8, 100000);
    const minLoanAmount = Math.max(1000, income * 0.05);
    const loanAmount = randomInRange(minLoanAmount, maxLoanAmount);
    
    // Adjust debt-to-income ratio based on employment status
    let debtToIncomeRatio;
    if (employmentStatus === "full_time" || employmentStatus === "self_employed") {
      debtToIncomeRatio = randomInRange(10, 40);
    } else if (employmentStatus === "part_time" || employmentStatus === "retired") {
      debtToIncomeRatio = randomInRange(20, 60);
    } else {
      debtToIncomeRatio = randomInRange(30, 80);
    }
    
    borrowers.push({
      id: `b-${Date.now()}-${i}`,
      name,
      email: generateEmail(name),
      loanAmount,
      loanPurpose: randomElement(loanPurposes),
      creditScore,
      income,
      employmentStatus,
      debtToIncomeRatio,
      loanTerm: randomElement(loanTerms),
      housingStatus: randomElement(housingStatuses)
    });
  }
  
  return borrowers;
};

// Generate synthetic lenders
export const generateSyntheticLenders = (count: number): Lender[] => {
  const lenders: Lender[] = [];
  
  const loanPurposes = [
    "education", "business", "home_improvement", "debt_consolidation", 
    "medical", "vehicle", "wedding", "vacation", "other"
  ];
  
  const loanTerms = ["3", "6", "12", "24", "36", "48", "60"];
  
  for (let i = 0; i < count; i++) {
    const name = generateName();
    const minCreditScore = randomInRange(580, 720);
    const interestRate = randomInRange(4, 20) + Math.random();
    const maxRiskTolerance = randomInRange(20, 80);
    
    // Generate random amount to lend
    const amountToLend = randomInRange(10000, 500000);
    
    // Generate random preferred purposes (at least 1, up to 5)
    const numPurposes = randomInRange(1, 5);
    const shuffledPurposes = [...loanPurposes].sort(() => 0.5 - Math.random());
    const preferredPurposes = shuffledPurposes.slice(0, numPurposes);
    
    // Generate random loan terms (at least 1, up to 4)
    const numTerms = randomInRange(1, 4);
    const shuffledTerms = [...loanTerms].sort(() => 0.5 - Math.random());
    const selectedLoanTerms = shuffledTerms.slice(0, numTerms);
    
    lenders.push({
      id: `l-${Date.now()}-${i}`,
      name,
      email: generateEmail(name),
      amountToLend,
      minCreditScore,
      interestRate: parseFloat(interestRate.toFixed(2)),
      maxRiskTolerance,
      preferredPurposes,
      loanTerms: selectedLoanTerms
    });
  }
  
  return lenders;
};

