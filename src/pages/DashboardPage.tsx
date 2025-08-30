import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RootState } from '@/store/store';
import { useOfflineData } from '@/hooks/useOfflineData';
import { 
  Sprout, 
  TrendingUp, 
  MapPin, 
  MessageCircle, 
  Bot, 
  Home,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { isOnline } = useOfflineData();

  const dashboardTiles = [
    {
      id: 'soil',
      title: t('dashboard.mySoil'),
      icon: Sprout,
      path: '/soil',
      color: 'soil',
      description: 'Check soil health'
    },
    {
      id: 'crops',
      title: t('dashboard.bestCrops'),
      icon: Sprout,
      path: '/crops',
      color: 'primary',
      description: 'Crop recommendations'
    },
    {
      id: 'market',
      title: t('dashboard.marketPrices'),
      icon: TrendingUp,
      path: '/market',
      color: 'accent',
      description: 'Market rates'
    },
    {
      id: 'guidance',
      title: t('dashboard.guidance'),
      icon: MessageCircle,
      path: '/guidance',
      color: 'secondary',
      description: 'Smart tips'
    },
    {
      id: 'ai',
      title: t('dashboard.askAI'),
      icon: Bot,
      path: '/ai',
      color: 'voice',
      description: 'Voice assistant'
    },
    {
      id: 'farm',
      title: t('dashboard.myFarm'),
      icon: Home,
      path: '/farm',
      color: 'primary',
      description: 'Farm overview'
    },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur border-b border-border/20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                {user?.name?.charAt(0) || '👨‍🌾'}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                {t('dashboard.home')}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {user?.location || 'Location not set'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge 
              variant={isOnline ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3" />
                  {t('dashboard.online')}
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  {t('dashboard.offline')}
                </>
              )}
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
            >
              ⚙️
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 pb-20">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-muted-foreground">
            What would you like to do today?
          </p>
        </div>

        {/* Sync Status */}
        {isOnline && (
          <Card className="mb-6 p-4 bg-success/10 border-success/20">
            <div className="flex items-center gap-2 text-success">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{t('dashboard.syncStatus')}</span>
            </div>
          </Card>
        )}

        {/* Dashboard Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {dashboardTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Card 
                key={tile.id}
                className="p-0 overflow-hidden hover:shadow-card transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => navigate(tile.path)}
              >
                <Button
                  variant="dashboard"
                  size="tile"
                  className="w-full h-full border-0 shadow-none bg-gradient-to-br from-card to-card/80 hover:from-primary/5 hover:to-primary/10"
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className={`p-3 rounded-full bg-${tile.color}/10`}>
                      <Icon className={`w-6 h-6 md:w-8 md:h-8 text-${tile.color}`} />
                    </div>
                    <div>
                      <div className="font-medium text-xs md:text-sm">
                        {tile.title}
                      </div>
                      <div className="text-xs text-muted-foreground hidden md:block">
                        {tile.description}
                      </div>
                    </div>
                  </div>
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {user?.farmSize || 0}
            </div>
            <div className="text-sm text-muted-foreground">Acres</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              {user?.primaryCrops?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Crop Types</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              5
            </div>
            <div className="text-sm text-muted-foreground">Active Fields</div>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex justify-around">
            {[
              { icon: '🏠', label: 'Home', path: '/dashboard', active: true },
              { icon: '🌱', label: 'Soil', path: '/soil' },
              { icon: '🤖', label: 'AI', path: '/ai' },
              { icon: '📊', label: 'Market', path: '/market' },
              { icon: '⚙️', label: 'Settings', path: '/settings' },
            ].map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className={`flex flex-col gap-1 h-auto py-2 ${
                  item.active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default DashboardPage;