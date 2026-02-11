import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageBackButtonProps {
  label?: string;
  fallbackPath?: string;
}

const PageBackButton: React.FC<PageBackButtonProps> = ({ label = 'Back', fallbackPath }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (fallbackPath) {
      navigate(fallbackPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="gap-1.5 text-muted-foreground hover:text-foreground mb-4 -ml-2"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </Button>
  );
};

export default PageBackButton;
