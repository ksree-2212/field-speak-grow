interface SoilData {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
  organicMatter: number;
  temperature: number;
}

export interface CropSuggestion {
  id: string;
  name: string;
  localName: {
    en: string;
    hi: string;
    te: string;
    ta: string;
  };
  expectedYield: string;
  expectedProfit: string;
  waterRequirement: 'low' | 'medium' | 'high';
  soilSuitability: number;
  marketDemand: 'low' | 'medium' | 'high';
  sustainabilityRating: number;
  growthPeriod: number;
  bestSeason: string;
  suitabilityScore: number;
  reasons: string[];
}

const cropDatabase: Omit<CropSuggestion, 'suitabilityScore' | 'reasons'>[] = [
  {
    id: 'rice',
    name: 'Rice',
    localName: {
      en: 'Rice',
      hi: 'चावल',
      te: 'వరి',
      ta: 'அரிசி'
    },
    expectedYield: '4-6 tons/hectare',
    expectedProfit: '₹40,000-60,000/acre',
    waterRequirement: 'high',
    soilSuitability: 85,
    marketDemand: 'high',
    sustainabilityRating: 7,
    growthPeriod: 120,
    bestSeason: 'Kharif'
  },
  {
    id: 'wheat',
    name: 'Wheat',
    localName: {
      en: 'Wheat',
      hi: 'गेहूं',
      te: 'గోధుమ',
      ta: 'கோதுமை'
    },
    expectedYield: '3-5 tons/hectare',
    expectedProfit: '₹35,000-50,000/acre',
    waterRequirement: 'medium',
    soilSuitability: 80,
    marketDemand: 'high',
    sustainabilityRating: 8,
    growthPeriod: 110,
    bestSeason: 'Rabi'
  },
  {
    id: 'cotton',
    name: 'Cotton',
    localName: {
      en: 'Cotton',
      hi: 'कपास',
      te: 'పత్తి',
      ta: 'பருத்தி'
    },
    expectedYield: '500-800 kg/hectare',
    expectedProfit: '₹50,000-80,000/acre',
    waterRequirement: 'medium',
    soilSuitability: 75,
    marketDemand: 'medium',
    sustainabilityRating: 6,
    growthPeriod: 180,
    bestSeason: 'Kharif'
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    localName: {
      en: 'Sugarcane',
      hi: 'गन्ना',
      te: 'చెరకు',
      ta: 'கரும்பு'
    },
    expectedYield: '70-100 tons/hectare',
    expectedProfit: '₹80,000-120,000/acre',
    waterRequirement: 'high',
    soilSuitability: 90,
    marketDemand: 'high',
    sustainabilityRating: 7,
    growthPeriod: 365,
    bestSeason: 'Year-round'
  },
  {
    id: 'maize',
    name: 'Maize',
    localName: {
      en: 'Maize',
      hi: 'मक्का',
      te: 'మొక్కజొన్న',
      ta: 'சோளம்'
    },
    expectedYield: '6-8 tons/hectare',
    expectedProfit: '₹30,000-45,000/acre',
    waterRequirement: 'medium',
    soilSuitability: 85,
    marketDemand: 'medium',
    sustainabilityRating: 8,
    growthPeriod: 90,
    bestSeason: 'Both Kharif & Rabi'
  },
  {
    id: 'soybean',
    name: 'Soybean',
    localName: {
      en: 'Soybean',
      hi: 'सोयाबीन',
      te: 'సోయాబీన్',
      ta: 'சோயாபீன்'
    },
    expectedYield: '2-3 tons/hectare',
    expectedProfit: '₹25,000-40,000/acre',
    waterRequirement: 'medium',
    soilSuitability: 80,
    marketDemand: 'high',
    sustainabilityRating: 9,
    growthPeriod: 100,
    bestSeason: 'Kharif'
  },
  {
    id: 'groundnut',
    name: 'Groundnut',
    localName: {
      en: 'Groundnut',
      hi: 'मूंगफली',
      te: 'వేరుశనగ',
      ta: 'நிலக்கடலை'
    },
    expectedYield: '2-3 tons/hectare',
    expectedProfit: '₹35,000-55,000/acre',
    waterRequirement: 'low',
    soilSuitability: 75,
    marketDemand: 'medium',
    sustainabilityRating: 8,
    growthPeriod: 120,
    bestSeason: 'Kharif'
  }
];

export function calculateSoilHealth(soilData: SoilData): number {
  const optimalRanges = {
    ph: { min: 6.0, max: 7.5, weight: 0.2 },
    nitrogen: { min: 200, max: 400, weight: 0.15 },
    phosphorus: { min: 20, max: 50, weight: 0.15 },
    potassium: { min: 150, max: 300, weight: 0.15 },
    moisture: { min: 40, max: 70, weight: 0.2 },
    organicMatter: { min: 2, max: 5, weight: 0.15 }
  };

  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(optimalRanges).forEach(([key, range]) => {
    const value = soilData[key as keyof SoilData];
    let score = 0;
    
    if (value >= range.min && value <= range.max) {
      score = 100;
    } else if (value < range.min) {
      score = Math.max(0, (value / range.min) * 100);
    } else {
      score = Math.max(0, 100 - ((value - range.max) / range.max) * 50);
    }
    
    totalScore += score * range.weight;
    totalWeight += range.weight;
  });

  return Math.round(totalScore / totalWeight);
}

export function getCropSuggestions(soilData: SoilData): CropSuggestion[] {
  const soilHealth = calculateSoilHealth(soilData);
  
  return cropDatabase.map(crop => {
    let suitabilityScore = 0;
    const reasons: string[] = [];

    // ph suitability
    if (soilData.ph >= 6.0 && soilData.ph <= 7.5) {
      suitabilityScore += 20;
      reasons.push('Optimal soil pH');
    } else if (soilData.ph >= 5.5 && soilData.ph <= 8.0) {
      suitabilityScore += 10;
      reasons.push('Acceptable soil pH');
    }

    // Nitrogen levels
    if (soilData.nitrogen >= 200) {
      suitabilityScore += 15;
      reasons.push('Good nitrogen levels');
    } else if (soilData.nitrogen >= 100) {
      suitabilityScore += 8;
      reasons.push('Moderate nitrogen');
    }

    // Phosphorus levels
    if (soilData.phosphorus >= 20) {
      suitabilityScore += 15;
      reasons.push('Adequate phosphorus');
    } else if (soilData.phosphorus >= 10) {
      suitabilityScore += 8;
      reasons.push('Low phosphorus - may need fertilizer');
    }

    // Potassium levels
    if (soilData.potassium >= 150) {
      suitabilityScore += 15;
      reasons.push('Good potassium levels');
    } else if (soilData.potassium >= 75) {
      suitabilityScore += 8;
      reasons.push('Moderate potassium');
    }

    // Moisture content
    if (crop.waterRequirement === 'high' && soilData.moisture >= 60) {
      suitabilityScore += 20;
      reasons.push('High moisture suits water-loving crop');
    } else if (crop.waterRequirement === 'medium' && soilData.moisture >= 40 && soilData.moisture <= 70) {
      suitabilityScore += 20;
      reasons.push('Balanced moisture levels');
    } else if (crop.waterRequirement === 'low' && soilData.moisture <= 50) {
      suitabilityScore += 20;
      reasons.push('Low water requirement matches soil moisture');
    } else {
      suitabilityScore += 5;
      reasons.push('Moisture management needed');
    }

    // Organic matter
    if (soilData.organicMatter >= 2) {
      suitabilityScore += 15;
      reasons.push('Rich organic matter');
    } else {
      suitabilityScore += 5;
      reasons.push('Low organic matter - add compost');
    }

    // Cap the score at 100
    suitabilityScore = Math.min(100, suitabilityScore);

    return {
      ...crop,
      suitabilityScore,
      reasons
    };
  }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}