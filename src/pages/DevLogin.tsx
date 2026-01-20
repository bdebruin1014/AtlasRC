import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function DevLogin() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Development Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Skip auth for testing
          </p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Enter App (Dev Mode)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
