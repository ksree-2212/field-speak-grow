import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, MessageCircle } from 'lucide-react';

const GuidancePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-earth">
      <header className="bg-card/80 backdrop-blur border-b border-border/20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">{t('guidance.title')}</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4">
        <Card className="text-center py-12">
          <MessageCircle className="w-16 h-16 mx-auto text-primary mb-4" />
          <h3 className="text-lg font-medium">Smart Guidance Coming Soon</h3>
        </Card>
      </main>
    </div>
  );
};

export default GuidancePage;