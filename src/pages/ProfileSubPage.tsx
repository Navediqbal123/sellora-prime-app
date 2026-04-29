import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  emptyText?: string;
}

const ProfileSubPage: React.FC<Props> = ({ title, description, emptyText = 'Nothing to show yet.' }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        </div>
        {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
        <div className="card-premium p-8 text-center">
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSubPage;