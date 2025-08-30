import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Droplets, TrendingUp, Leaf, Calendar, Star } from 'lucide-react';
import { RootState } from '@/store/store';
import { getCropSuggestions } from '@/utils/cropSuggestions';
import { useVoice } from '@/hooks/useVoice';

const CropsPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { speak } = useVoice();
  const soilData = useSelector((state: RootState) => state.soil.soilData);
  
  const currentLang = i18n.language as 'en' | 'hi' | 'te' | 'ta';
  
  // Get crop suggestions based on soil data
  const cropSuggestions = soilData.length > 0 ? getCropSuggestions(soilData[0]) : [];

  const handleCropSpeak = (crop: any) => {
    const text = `${crop.localName[currentLang]}. Expected yield: ${crop.expectedYield}. Expected profit: ${crop.expectedProfit}. Suitability score: ${crop.suitabilityScore} percent. ${crop.reasons.join('. ')}.`;
    speak(text);
  };

  const getWaterIcon = (requirement: string) => {
    switch (requirement) {
      case 'high': return '💧💧💧';
      case 'medium': return '💧💧';
      case 'low': return '💧';
      default: return '💧';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'bg-success/20 text-success border-success/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'low': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-gradient-earth">
      <header className="bg-card/80 backdrop-blur border-b border-border/20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">{t('crops.title')}</h1>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {soilData.length === 0 ? (
          <Card className="text-center py-12">
            <Leaf className="w-16 h-16 mx-auto text-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">No Soil Data Available</h3>
            <p className="text-muted-foreground mb-4">Add soil data to get personalized crop suggestions</p>
            <Button onClick={() => navigate('/soil')}>Add Soil Data</Button>
          </Card>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">🌾 Crop Recommendations</h2>
              <p className="text-muted-foreground">Based on your soil health analysis</p>
            </div>

            <div className="grid gap-4">
              {cropSuggestions.map((crop, index) => (
                <Card key={crop.id} className="p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🌱'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{crop.localName[currentLang]}</h3>
                        <p className="text-sm text-muted-foreground">{crop.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getSuitabilityColor(crop.suitabilityScore)}`}>
                        {crop.suitabilityScore}%
                      </div>
                      <p className="text-xs text-muted-foreground">Suitability</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <TrendingUp className="w-5 h-5 mx-auto mb-1 text-success" />
                      <p className="text-xs text-muted-foreground">Expected Yield</p>
                      <p className="font-medium text-sm">{crop.expectedYield}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg mb-1">💰</div>
                      <p className="text-xs text-muted-foreground">Expected Profit</p>
                      <p className="font-medium text-sm">{crop.expectedProfit}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg mb-1">{getWaterIcon(crop.waterRequirement)}</div>
                      <p className="text-xs text-muted-foreground">Water Need</p>
                      <p className="font-medium text-sm capitalize">{crop.waterRequirement}</p>
                    </div>
                    <div className="text-center">
                      <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <p className="text-xs text-muted-foreground">Growth Period</p>
                      <p className="font-medium text-sm">{crop.growthPeriod} days</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">
                      {crop.bestSeason}
                    </Badge>
                    <Badge className={getDemandColor(crop.marketDemand)}>
                      {crop.marketDemand} demand
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {crop.sustainabilityRating}/10
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Why this crop suits your soil:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {crop.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    onClick={() => handleCropSpeak(crop)} 
                    variant="outline" 
                    className="w-full"
                  >
                    🔊 {t('crops.listenForDetails')}
                  </Button>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CropsPage;