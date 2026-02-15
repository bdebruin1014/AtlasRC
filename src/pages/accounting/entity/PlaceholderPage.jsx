import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PlaceholderPage() {
  const location = useLocation();
  const { entityId } = useParams();
  const navigate = useNavigate();
  const pageName = location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Page';

  return (
    <div className="p-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Construction className="h-16 w-16 text-emerald-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2 capitalize">{pageName}</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            This feature is being built. Navigate back to the dashboard or use the sidebar.
          </p>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => navigate(`/accounting/entities/${entityId}/dashboard`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
