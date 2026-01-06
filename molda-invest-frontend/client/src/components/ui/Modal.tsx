import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      size = 'md',
      closeButton = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    if (!isOpen) return null;

    const sizeStyles = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
    };

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            ref={ref}
            className={cn(
              'bg-card text-card-foreground rounded-lg shadow-lg w-full',
              sizeStyles[size],
              className
            )}
            {...props}
          >
            {/* Header */}
            {(title || closeButton) && (
              <div className="flex items-center justify-between p-6 border-b border-border">
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                {closeButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            {/* Content */}
            <div className="p-6">{children}</div>
          </div>
        </div>
      </>
    );
  }
);

Modal.displayName = 'Modal';

export const ModalHeader = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between mb-4', className)}
    {...props}
  />
));

ModalHeader.displayName = 'ModalHeader';

export const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold', className)}
    {...props}
  />
));

ModalTitle.displayName = 'ModalTitle';

export const ModalContent = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));

ModalContent.displayName = 'ModalContent';

export const ModalFooter = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-end gap-3 pt-6 border-t border-border', className)}
    {...props}
  />
));

ModalFooter.displayName = 'ModalFooter';
