'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';

export function useDisciplineTimer() {
  const {
    isTimerActive,
    setTimerActive,
    timerDuration,
    setTimerDuration,
    timerTimeRemaining,
    setTimerTimeRemaining,
    timerTaskId,
    setTimerTaskId,
    getTimerStatus,
    isAbsoluteLockActive
  } = useAppStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar audio
  useEffect(() => {
    // Crear audio context para sonidos
    audioRef.current = new Audio();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Función para reproducir sonidos
  const playSound = useCallback((type: 'start' | 'tick' | 'end' | 'complete') => {
    if (!audioRef.current) return;

    try {
      // Usar Web Audio API para generar sonidos
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      switch (type) {
        case 'start':
          // Sonido de inicio - tono ascendente
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
          oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1); // A5
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
          
        case 'tick':
          // Sonido de tick - suave y corto
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.05);
          break;
          
        case 'end':
          // Sonido de fin - tono descendente con vibración
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
          oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.2); // A4
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
          break;
          
        case 'complete':
          // Sonido de completado - tono de éxito
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.6);
          break;
      }
    } catch (error) {
      console.warn('Error playing sound:', error);
      // Fallback a beep simple si Web Audio API no está disponible
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAADsAABmYWN';
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  }, []);

  // Iniciar temporizador
  const startTimer = useCallback((taskId?: number, duration?: number) => {
    if (duration) {
      setTimerDuration(duration);
    }
    
    const finalDuration = duration || timerDuration;
    setTimerTimeRemaining(finalDuration * 60);
    setTimerActive(true);
    if (taskId) {
      setTimerTaskId(taskId);
    }
    
    playSound('start');
    console.log('🕐 Temporizador iniciado:', finalDuration, 'minutos');
  }, [timerDuration, setTimerDuration, setTimerTimeRemaining, setTimerActive, setTimerTaskId, playSound]);

  // Detener temporizador
  const stopTimer = useCallback(() => {
    setTimerActive(false);
    setTimerTimeRemaining(0);
    setTimerTaskId(null);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    playSound('end');
    console.log('⏹ Temporizador detenido');
  }, [setTimerActive, setTimerTimeRemaining, setTimerTaskId, playSound]);

  // Efecto del temporizador
  useEffect(() => {
    if (isTimerActive && timerTimeRemaining > 0) {
      let lastTickSecond = Math.floor(timerTimeRemaining);
      
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        const newTimeRemaining = Math.max(0, timerTimeRemaining - 1);
        
        setTimerTimeRemaining(newTimeRemaining);
        
        // Reproducir sonido de tick cada segundo (cada 5 segundos para no ser molesto)
        const currentSecond = Math.floor(newTimeRemaining);
        if (currentSecond !== lastTickSecond && currentSecond % 5 === 0) {
          playSound('tick');
          lastTickSecond = currentSecond;
        }
        
        // Cuando el tiempo se acaba
        if (newTimeRemaining <= 0) {
          stopTimer();
          playSound('complete');
          
          // Mostrar notificación
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('¡Tiempo Completado!', {
              body: 'El temporizador ha finalizado. Marca tu tarea como completada.',
              icon: '/icon-192x192.png'
            });
          }
          
          // Vibración si está disponible
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
          
          console.log('🎉 ¡Tiempo completado! Marca la tarea como finalizada.');
        }
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isTimerActive, timerTimeRemaining, timerDuration, stopTimer, playSound]);

  // Auto-iniciar cuando se activa el bloqueo absoluto
  useEffect(() => {
    if (isAbsoluteLockActive && !isTimerActive) {
      // Dar tiempo para que el usuario se prepare (2 segundos)
      const prepareTimer = setTimeout(() => {
        startTimer();
        playSound('start');
      }, 2000);
      
      return () => clearTimeout(prepareTimer);
    }
  }, [isAbsoluteLockActive, isTimerActive, startTimer, playSound]);

  // Solicitar permisos de notificación
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    startTimer,
    stopTimer,
    timerStatus: {
      isActive: isTimerActive,
      duration: timerDuration,
      timeRemaining: timerTimeRemaining,
      taskId: timerTaskId,
      progress: timerDuration > 0 ? ((timerDuration * 60 - timerTimeRemaining) / (timerDuration * 60)) * 100 : 0
    }
  };
}
