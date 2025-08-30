import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginSuccess } from '@/store/slices/authSlice';
import { Phone, Shield, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    farmSize: '',
    location: '',
    primaryCrops: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate OTP sending
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}`,
      });
    }, 1500);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      if (otp === '123456') { // Demo OTP
        setStep('profile');
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please check your verification code",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate profile creation
    setTimeout(() => {
      const user = {
        id: Date.now().toString(),
        phone: phoneNumber,
        name: profile.name,
        location: profile.location,
        farmSize: parseFloat(profile.farmSize) || 0,
        primaryCrops: profile.primaryCrops.split(',').map(crop => crop.trim()),
      };
      
      dispatch(loginSuccess(user));
      setIsLoading(false);
      
      toast({
        title: "Welcome to Smart Agriculture!",
        description: "Your profile has been created successfully",
      });
      
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-earth flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => step === 'phone' ? navigate('/') : setStep(step === 'otp' ? 'phone' : 'otp')}
          className="self-start"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>

        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-4">
              {step === 'phone' && <Phone className="w-8 h-8 text-primary-foreground" />}
              {step === 'otp' && <Shield className="w-8 h-8 text-primary-foreground" />}
              {step === 'profile' && <div className="text-primary-foreground font-bold text-xl">👨‍🌾</div>}
            </div>
            <CardTitle>
              {step === 'phone' && t('auth.login')}
              {step === 'otp' && t('auth.enterOTP')}
              {step === 'profile' && t('auth.createProfile')}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('auth.phoneNumber')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="touch-target text-center text-lg"
                    autoFocus
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="dashboard"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? t('common.loading') : t('common.next')}
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">{t('auth.enterOTP')}</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="touch-target text-center text-xl tracking-widest"
                    maxLength={6}
                    autoFocus
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Demo OTP: 123456
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="dashboard"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? t('common.loading') : t('auth.verify')}
                </Button>
              </form>
            )}

            {step === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('auth.name')}</Label>
                  <Input
                    id="name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="touch-target"
                    autoFocus
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farmSize">{t('auth.farmSize')}</Label>
                  <Input
                    id="farmSize"
                    type="number"
                    step="0.1"
                    value={profile.farmSize}
                    onChange={(e) => setProfile({ ...profile, farmSize: e.target.value })}
                    className="touch-target"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">{t('auth.location')}</Label>
                  <Input
                    id="location"
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="touch-target"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crops">{t('auth.primaryCrops')}</Label>
                  <Input
                    id="crops"
                    type="text"
                    placeholder="Rice, Wheat, Cotton"
                    value={profile.primaryCrops}
                    onChange={(e) => setProfile({ ...profile, primaryCrops: e.target.value })}
                    className="touch-target"
                  />
                </div>

                <Button
                  type="submit"
                  variant="dashboard"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? t('common.loading') : t('auth.save')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;