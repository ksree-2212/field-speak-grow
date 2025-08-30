import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store/store';
import {
  setSupported,
  setRecognition,
  setSynthesis,
  startListening,
  stopListening,
  setTranscript,
  startSpeaking,
  stopSpeaking,
  setError,
  setCurrentVoice,
} from '../store/slices/voiceSlice';

export const useVoice = () => {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const voice = useSelector((state: RootState) => state.voice);
  const settings = useSelector((state: RootState) => state.settings);

  // Initialize speech APIs
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

    if (SpeechRecognition && speechSynthesis) {
      dispatch(setSupported(true));
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = i18n.language === 'hi' ? 'hi-IN' : 
                       i18n.language === 'te' ? 'te-IN' :
                       i18n.language === 'ta' ? 'ta-IN' : 'en-US';

      recognition.onstart = () => {
        dispatch(startListening());
      };

      recognition.onend = () => {
        dispatch(stopListening());
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        dispatch(setTranscript(transcript));
      };

      recognition.onerror = (event) => {
        dispatch(setError(event.error));
        dispatch(stopListening());
      };

      dispatch(setRecognition(recognition));
      dispatch(setSynthesis(speechSynthesis));

      // Set default voice for current language
      const setVoiceForLanguage = () => {
        const voices = speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
        
        let preferredVoice = null;
        const currentLang = i18n.language;
        
        // Try to find the best voice for current language
        if (currentLang === 'hi') {
          preferredVoice = voices.find(voice => 
            voice.lang.includes('hi') || voice.lang.includes('Hindi') || voice.name.toLowerCase().includes('hindi')
          );
        } else if (currentLang === 'te') {
          preferredVoice = voices.find(voice => 
            voice.lang.includes('te') || voice.lang.includes('Telugu') || voice.name.toLowerCase().includes('telugu')
          );
        } else if (currentLang === 'ta') {
          preferredVoice = voices.find(voice => 
            voice.lang.includes('ta') || voice.lang.includes('Tamil') || voice.name.toLowerCase().includes('tamil')
          );
        } else {
          preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') || voice.lang.includes('English')
          );
        }
        
        // Fallback to any voice if no language-specific voice found
        if (!preferredVoice && voices.length > 0) {
          preferredVoice = voices[0];
        }
        
        console.log('Selected voice:', preferredVoice?.name, preferredVoice?.lang);
        if (preferredVoice) {
          dispatch(setCurrentVoice(preferredVoice));
        }
      };

      speechSynthesis.onvoiceschanged = setVoiceForLanguage;
      // Call immediately in case voices are already loaded
      if (speechSynthesis.getVoices().length > 0) {
        setVoiceForLanguage();
      }
    } else {
      dispatch(setSupported(false));
    }
  }, [dispatch, i18n.language]);

  const startVoiceRecognition = useCallback(() => {
    if (voice.recognition && !voice.isListening) {
      try {
        voice.recognition.start();
      } catch (error) {
        dispatch(setError('Failed to start voice recognition'));
      }
    }
  }, [voice.recognition, voice.isListening, dispatch]);

  const stopVoiceRecognition = useCallback(() => {
    if (voice.recognition && voice.isListening) {
      voice.recognition.stop();
    }
  }, [voice.recognition, voice.isListening]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (voice.synthesis && settings.voiceEnabled) {
      // Cancel any ongoing speech
      voice.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language based on current i18n language
      const langMap = {
        'hi': 'hi-IN',
        'te': 'te-IN', 
        'ta': 'ta-IN',
        'en': 'en-US'
      };
      utterance.lang = langMap[i18n.language as keyof typeof langMap] || 'en-US';
      
      utterance.voice = voice.currentVoice;
      utterance.volume = voice.volume;
      utterance.rate = voice.rate;
      utterance.pitch = voice.pitch;

      utterance.onstart = () => {
        dispatch(startSpeaking());
      };

      utterance.onend = () => {
        dispatch(stopSpeaking());
        onEnd?.();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        dispatch(stopSpeaking());
        dispatch(setError('Speech synthesis failed'));
      };

      console.log('Speaking text:', text, 'in language:', utterance.lang, 'with voice:', voice.currentVoice?.name);
      voice.synthesis.speak(utterance);
    }
  }, [voice.synthesis, voice.currentVoice, voice.volume, voice.rate, voice.pitch, settings.voiceEnabled, dispatch, i18n.language]);

  const stopSpeakingAction = useCallback(() => {
    if (voice.synthesis) {
      voice.synthesis.cancel();
      dispatch(stopSpeaking());
    }
  }, [voice.synthesis, dispatch]);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      dispatch(setError('Microphone permission denied'));
      return false;
    }
  }, [dispatch]);

  return {
    ...voice,
    startVoiceRecognition,
    stopVoiceRecognition,
    speak,
    stopSpeaking: stopSpeakingAction,
    requestMicrophonePermission,
  };
};