'use client';

import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Button } from './Button';
import { Warning2 } from 'iconsax-reactjs';
import { useLocale } from 'next-intl';

interface PopoverConfirmProps {
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  trigger: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function PopoverConfirm({
  onConfirm,
  onCancel,
  title = 'Confirm Delete',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  trigger,
  align = 'end',
  side = 'right',
}: PopoverConfirmProps) {
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const showLoading = isLoading || isConfirming;
 const locale = useLocale();
  const isRtl = locale === "ar"
  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    onCancel?.();
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <div className="inline-flex cursor-pointer" onClick={(e) => e.stopPropagation()}>
          {trigger}
        </div>
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content
          align={align}
          side={side}
          sideOffset={8}
          className="z-[9999] w-80 bg-background border rounded-lg shadow-xl p-4 animate-in fade-in-0 zoom-in-95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          onCloseAutoFocus={(e) => e.preventDefault()}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Warning2 className="h-4 w-4 text-red-500" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{title}</h4>
              <p className="text-xs text-muted-foreground mb-4">{description}</p>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={showLoading}
                >
                  {cancelText}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleConfirm}
                  disabled={showLoading}
                >
                  {showLoading ? (
                    <span className="flex items-center gap-1">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {confirmText}
                    </span>
                  ) : (
                    confirmText
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <Popover.Arrow className="fill-border" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}