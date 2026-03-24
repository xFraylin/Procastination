import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function TouchButton({ 
  children, 
  className, 
  variant = 'default', 
  size = 'default',
  ...props 
}: TouchButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        // Mínimo 48px para accesibilidad móvil
        'min-h-[48px] min-w-[48px]',
        // Transiciones suaves
        'transition-all duration-200 ease-in-out',
        // Efecto al tocar
        'active:scale-95 active:bg-opacity-80',
        // Espaciado para elementos táctiles
        'touch-manipulation',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
