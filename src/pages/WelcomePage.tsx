import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RootState } from '@/store/store';
import { setLanguage } from '@/store/slices/settingsSlice';
import { useVoice } from '@/hooks/useVoice';
import { Volume2, Globe } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { speak, isSupported: voiceSupported } = useVoice();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { language } = useSelector((state: RootState) => state.settings);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Voice introduction when component mounts
    if (voiceSupported && language) {
      const timer = setTimeout(() => {
        speak(t('welcome.voiceIntro'));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [voiceSupported, speak, t, language]);

  const handleLanguageSelect = (langCode: string) => {
    dispatch(setLanguage(langCode));
    i18n.changeLanguage(langCode);
    
    // Voice preview
    if (voiceSupported) {
      speak(t('welcome.tapToChoose'));
    }
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-earth flex flex-col items-center justify-center p-4">
      <main className="max-w-md w-full space-y-8 animate-grow-in">
        {/* App Logo/Title */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-voice">
            <Globe className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('welcome.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('welcome.subtitle')}</p>
          </div>
        </div>

        {/* Language Selection */}
        <Card className="p-6 shadow-card">
          <div className="space-y-4">
            <div className="text-center">
              <Volume2 className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">{t('welcome.tapToChoose')}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant="language"
                  size="language"
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`${
                    language === lang.code 
                      ? 'border-primary bg-primary/10 shadow-soft' 
                      : ''
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium">{lang.nativeName}</div>
                    <div className="text-xs text-muted-foreground">{lang.name}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Get Started Button */}
        {language && (
          <div className="text-center animate-grow-in">
            <Button
              onClick={handleGetStarted}
              variant="dashboard"
              size="xl"
              className="w-full"
            >
              {t('welcome.getStarted')}
            </Button>
          </div>
        )}

        {/* Voice Support Indicator */}
        {voiceSupported && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-card px-3 py-2 rounded-full">
              <Volume2 className="w-4 h-4 text-voice-active" />
              Voice assistant enabled
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WelcomePage;