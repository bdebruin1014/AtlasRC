import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function PlaceholderPage() {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Page';

  return (
    <div className="p-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Construction className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2 capitalize">{pageName}</h2>
          <p className="text-muted-foreground text-center max-w-md">
            This page is under construction. Check back soon for updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
