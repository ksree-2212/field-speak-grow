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
      speechSynthesis.onvoiceschanged = () => {
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith(i18n.language === 'hi' ? 'hi' : 
                                i18n.language === 'te' ? 'te' :
                                i18n.language === 'ta' ? 'ta' : 'en')
        );
        if (preferredVoice) {
          dispatch(setCurrentVoice(preferredVoice));
        }
      };
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

      utterance.onerror = () => {
        dispatch(stopSpeaking());
        dispatch(setError('Speech synthesis failed'));
      };

      voice.synthesis.speak(utterance);
    }
  }, [voice.synthesis, voice.currentVoice, voice.volume, voice.rate, voice.pitch, settings.voiceEnabled, dispatch]);

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