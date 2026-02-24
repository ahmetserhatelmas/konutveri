'use client';

import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

interface ReportPrintButtonProps {
  className?: string;
}

export function ReportPrintButton({ className }: ReportPrintButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button onClick={handlePrint} className={className} size="sm">
      <FileDown className="w-4 h-4 mr-2" />
      PDF indir
    </Button>
  );
}
