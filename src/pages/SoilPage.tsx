import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RootState } from '@/store/store';
import { addSoilData, setSoilHealthScore } from '@/store/slices/soilSlice';
import { useVoice } from '@/hooks/useVoice';
import { useOfflineData } from '@/hooks/useOfflineData';
import { 
  ArrowLeft, 
  Plus, 
  Mic, 
  MicOff, 
  Thermometer,
  Droplets,
  Zap,
  TrendingUp,
  Calendar,
  Sprout
} from 'lucide-react';

const SoilPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { soilData, currentSoil, healthScore } = useSelector((state: RootState) => state.soil);
  const { speak, startVoiceRecognition, stopVoiceRecognition, isListening, transcript } = useVoice();
  const { saveOffline } = useOfflineData();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fieldName: '',
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    moisture: '',
    organicMatter: '',
    temperature: '',
  });

  useEffect(() => {
    if (transcript && isListening) {
      // Process voice input for soil data
      // This is a simplified example - in reality, you'd use NLP to extract values
      const lowerTranscript = transcript.toLowerCase();
      
      if (lowerTranscript.includes('ph') || lowerTranscript.includes('acidity')) {
        const phMatch = transcript.match(/(\d+\.?\d*)/);
        if (phMatch) {
          setFormData(prev => ({ ...prev, ph: phMatch[1] }));
        }
      }
    }
  }, [transcript, isListening]);

  const calculateHealthScore = (data: any) => {
    const scores: {
      ph: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
      nutrients: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
      moisture: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
    } = {
      ph: data.ph >= 6.0 && data.ph <= 7.5 ? 'excellent' : 
           data.ph >= 5.5 && data.ph <= 8.0 ? 'good' : 
           data.ph >= 5.0 && data.ph <= 8.5 ? 'moderate' : 'poor',
      nutrients: (data.nitrogen + data.phosphorus + data.potassium) / 3 >= 80 ? 'excellent' :
                (data.nitrogen + data.phosphorus + data.potassium) / 3 >= 60 ? 'good' :
                (data.nitrogen + data.phosphorus + data.potassium) / 3 >= 40 ? 'moderate' : 'poor',
      moisture: data.moisture >= 60 && data.moisture <= 80 ? 'excellent' :
                data.moisture >= 40 && data.moisture <= 90 ? 'good' :
                data.moisture >= 20 && data.moisture <= 95 ? 'moderate' : 'poor',
    };

    const overallScore = Object.values(scores).reduce((acc, score) => {
      const value = score === 'excellent' ? 90 : score === 'good' ? 75 : score === 'moderate' ? 60 : 40;
      return acc + value;
    }, 0) / 3;

    return { ...scores, overall: overallScore };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const soilEntry = {
      id: Date.now().toString(),
      fieldName: formData.fieldName,
      ph: parseFloat(formData.ph),
      nitrogen: parseFloat(formData.nitrogen),
      phosphorus: parseFloat(formData.phosphorus),
      potassium: parseFloat(formData.potassium),
      moisture: parseFloat(formData.moisture),
      organicMatter: parseFloat(formData.organicMatter),
      temperature: parseFloat(formData.temperature),
      lastUpdated: new Date().toISOString(),
    };

    // Calculate health score
    const health = calculateHealthScore(soilEntry);
    
    dispatch(addSoilData(soilEntry));
    dispatch(setSoilHealthScore(health));
    
    // Save offline
    await saveOffline(`soil_${soilEntry.id}`, soilEntry);
    
    // Voice feedback
    speak(t('soil.excellent'));
    
    setShowForm(false);
    setFormData({
      fieldName: '',
      ph: '',
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      moisture: '',
      organicMatter: '',
      temperature: '',
    });
  };

  const getHealthColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'soil-excellent';
      case 'good': return 'soil-good';
      case 'moderate': return 'soil-moderate';
      case 'poor': return 'soil-poor';
      default: return 'soil-critical';
    }
  };

  const getHealthBadgeVariant = (rating: string): "default" | "destructive" | "secondary" => {
    switch (rating) {
      case 'excellent': 
      case 'good': 
        return 'default';
      case 'poor': 
      case 'critical': 
        return 'destructive';
      default: 
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur border-b border-border/20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">{t('soil.title')}</h1>
          </div>

          <Button
            variant="harvest"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('soil.addData')}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-20">
        {/* Current Soil Health */}
        {currentSoil && healthScore && (
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentSoil.fieldName}</span>
                <Badge variant={getHealthBadgeVariant(healthScore.ph)}>
                  {t(`soil.${healthScore.ph}`)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Health Score */}
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {Math.round(healthScore.overall)}%
                </div>
                <div className="text-muted-foreground">{t('soil.overall')}</div>
                <Progress 
                  value={healthScore.overall} 
                  className="h-2"
                />
              </div>

              <Separator />

              {/* Detailed Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <Zap className="w-6 h-6 mx-auto text-primary" />
                  <div className="font-medium">{t('soil.ph')}</div>
                  <div className="text-lg font-bold">{currentSoil.ph}</div>
                  <Badge 
                    variant={getHealthBadgeVariant(healthScore.ph)}
                    className="text-xs"
                  >
                    {t(`soil.${healthScore.ph}`)}
                  </Badge>
                </div>

                <div className="text-center space-y-2">
                  <TrendingUp className="w-6 h-6 mx-auto text-accent" />
                  <div className="font-medium">NPK</div>
                  <div className="text-sm">
                    N: {currentSoil.nitrogen}%<br />
                    P: {currentSoil.phosphorus}%<br />
                    K: {currentSoil.potassium}%
                  </div>
                  <Badge 
                    variant={getHealthBadgeVariant(healthScore.nutrients)}
                    className="text-xs"
                  >
                    {t(`soil.${healthScore.nutrients}`)}
                  </Badge>
                </div>

                <div className="text-center space-y-2">
                  <Droplets className="w-6 h-6 mx-auto text-blue-500" />
                  <div className="font-medium">{t('soil.moisture')}</div>
                  <div className="text-lg font-bold">{currentSoil.moisture}%</div>
                  <Badge 
                    variant={getHealthBadgeVariant(healthScore.moisture)}
                    className="text-xs"
                  >
                    {t(`soil.${healthScore.moisture}`)}
                  </Badge>
                </div>

                <div className="text-center space-y-2">
                  <Thermometer className="w-6 h-6 mx-auto text-orange-500" />
                  <div className="font-medium">{t('soil.temperature')}</div>
                  <div className="text-lg font-bold">{currentSoil.temperature}°C</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(currentSoil.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Soil Data Form */}
        {showForm && (
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t('soil.addData')}
                <Button
                  variant="voice"
                  size="icon"
                  onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </CardTitle>
              {isListening && (
                <p className="text-sm text-muted-foreground">
                  {t('soil.voiceInstructions')}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fieldName">{t('soil.fieldName')}</Label>
                    <Input
                      id="fieldName"
                      value={formData.fieldName}
                      onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
                      className="touch-target"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ph">{t('soil.ph')}</Label>
                    <Input
                      id="ph"
                      type="number"
                      step="0.1"
                      min="0"
                      max="14"
                      value={formData.ph}
                      onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                      className="touch-target"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nitrogen">{t('soil.nitrogen')} (%)</Label>
                    <Input
                      id="nitrogen"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.nitrogen}
                      onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                      className="touch-target"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phosphorus">{t('soil.phosphorus')} (%)</Label>
                    <Input
                      id="phosphorus"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.phosphorus}
                      onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                      className="touch-target"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="potassium">{t('soil.potassium')} (%)</Label>
                    <Input
                      id="potassium"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.potassium}
                      onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                      className="touch-target"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moisture">{t('soil.moisture')} (%)</Label>
                    <Input
                      id="moisture"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.moisture}
                      onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                      className="touch-target"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organicMatter">{t('soil.organicMatter')} (%)</Label>
                    <Input
                      id="organicMatter"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.organicMatter}
                      onChange={(e) => setFormData({ ...formData, organicMatter: e.target.value })}
                      className="touch-target"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">{t('soil.temperature')} (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      className="touch-target"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="dashboard"
                    className="flex-1"
                  >
                    {t('common.save')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Soil History */}
        {soilData.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Soil Test History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {soilData.map((soil) => (
                  <div key={soil.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium">{soil.fieldName}</div>
                      <div className="text-sm text-muted-foreground">
                        pH: {soil.ph} | NPK: {soil.nitrogen}/{soil.phosphorus}/{soil.potassium}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {new Date(soil.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!currentSoil && soilData.length === 0 && (
          <Card className="text-center py-12 shadow-card">
            <CardContent>
              <Sprout className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Soil Data Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by adding your first soil test results to get personalized crop recommendations.
              </p>
              <Button
                variant="dashboard"
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Soil Test
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SoilPage;