'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

interface KeyboardShortcutsProps {
  onStartFirstTask: () => void;
  onCompleteActiveTask: () => void;
}

export function KeyboardShortcuts({ onStartFirstTask, onCompleteActiveTask }: KeyboardShortcutsProps) {
  const { 
    setCurrentView, 
    isFocusMode, 
    activeTask,
    tasks,
    isLockdownMode,
    isForceMode,
  } = useAppStore();
  
  const pendingTasks = tasks.filter(t => t.completed === 0);
  const allCompleted = tasks.length > 0 && pendingTasks.length === 0;
  const isNavigationLocked = (isLockdownMode || isForceMode) && !allCompleted;
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      
      // Ctrl/Cmd + key shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            // Start first pending task
            e.preventDefault();
            if (pendingTasks.length > 0 && !isFocusMode) {
              onStartFirstTask();
            }
            break;
          case 'f':
            // Toggle focus mode view
            e.preventDefault();
            if (!isFocusMode && (!isNavigationLocked || pendingTasks.length > 0)) {
              setCurrentView('focus');
            }
            break;
          case 'enter':
            // Complete active task
            e.preventDefault();
            if (isFocusMode && activeTask) {
              onCompleteActiveTask();
            }
            break;
        }
      }
      
      // Number shortcuts for navigation (when not in focus mode)
      if (!isFocusMode && !isNavigationLocked && !e.ctrlKey && !e.metaKey) {
        switch (e.key) {
          case '1':
            setCurrentView('dashboard');
            break;
          case '2':
            setCurrentView('tasks');
            break;
          case '3':
            setCurrentView('focus');
            break;
          case '4':
            setCurrentView('stats');
            break;
          case '5':
            setCurrentView('content');
            break;
          case '6':
            setCurrentView('review');
            break;
        }
      }
      
      // Escape to abort focus mode (but only with confirmation)
      if (e.key === 'Escape' && isFocusMode) {
        // This is handled in the focus view component
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setCurrentView, 
    isFocusMode, 
    activeTask, 
    pendingTasks, 
    isNavigationLocked,
    onStartFirstTask,
    onCompleteActiveTask,
  ]);
  
  return null;
}
