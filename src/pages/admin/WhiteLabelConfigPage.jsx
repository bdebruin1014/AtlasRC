import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Palette, Image, Type, Mail, RefreshCw, Save, Eye, Upload,
  Smartphone, Monitor, Globe, Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WhiteLabelConfigPage = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');

  const [config, setConfig] = useState({
    // Branding
    companyName: 'Atlas RC',
    tagline: 'Real Estate Development Platform',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    loginBackgroundUrl: '',

    // Colors
    primaryColor: '#2563eb',
    secondaryColor: '#7c3aed',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    headerColor: '#1e3a8a',

    // Typography
    fontFamily: 'Inter',
    headingFont: 'Inter',

    // Email
    emailFromName: 'Atlas RC',
    emailFromAddress: 'noreply@atlasrc.com',
    emailFooterText: '© 2024 Atlas RC. All rights reserved.',
    emailLogoUrl: '',

    // Login Page
    showPoweredBy: true,
    customLoginMessage: '',
    showSignupLink: true,
    showForgotPassword: true,

    // Advanced
    customCss: '',
    customJs: '',
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);

    toast({
      title: 'Settings Saved',
      description: 'White label configuration has been updated',
    });
  };

  const handleReset = () => {
    setConfig({
      companyName: 'Atlas RC',
      tagline: 'Real Estate Development Platform',
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.ico',
      loginBackgroundUrl: '',
      primaryColor: '#2563eb',
      secondaryColor: '#7c3aed',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      headerColor: '#1e3a8a',
      fontFamily: 'Inter',
      headingFont: 'Inter',
      emailFromName: 'Atlas RC',
      emailFromAddress: 'noreply@atlasrc.com',
      emailFooterText: '© 2024 Atlas RC. All rights reserved.',
      emailLogoUrl: '',
      showPoweredBy: true,
      customLoginMessage: '',
      showSignupLink: true,
      showForgotPassword: true,
      customCss: '',
      customJs: '',
    });

    toast({
      title: 'Reset Complete',
      description: 'Settings have been reset to defaults',
    });
  };

  const colorPresets = [
    { name: 'Blue', primary: '#2563eb', secondary: '#7c3aed', accent: '#f59e0b' },
    { name: 'Green', primary: '#059669', secondary: '#0891b2', accent: '#eab308' },
    { name: 'Purple', primary: '#7c3aed', secondary: '#db2777', accent: '#f97316' },
    { name: 'Red', primary: '#dc2626', secondary: '#ea580c', accent: '#facc15' },
    { name: 'Teal', primary: '#0d9488', secondary: '#0284c7', accent: '#a855f7' },
  ];

  const fontOptions = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Poppins',
    'Montserrat',
    'Source Sans Pro',
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>White Label Configuration | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">White Label Configuration</h1>
          <p className="text-gray-600 mt-2">Customize branding, colors, and appearance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Settings Column */}
        <div className="col-span-2">
          <Tabs defaultValue="branding" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="branding">
                <Image className="w-4 h-4 mr-2" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="colors">
                <Palette className="w-4 h-4 mr-2" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Type className="w-4 h-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Branding Tab */}
            <TabsContent value="branding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Basic branding settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={config.companyName}
                        onChange={(e) => setConfig(prev => ({ ...prev, companyName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        value={config.tagline}
                        onChange={(e) => setConfig(prev => ({ ...prev, tagline: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logo & Icons</CardTitle>
                  <CardDescription>Upload your brand assets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Main Logo</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        {config.logoUrl ? (
                          <img src={config.logoUrl} alt="Logo" className="h-12 mx-auto mb-2" />
                        ) : (
                          <Image className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        )}
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">PNG, SVG. Max 500KB.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Favicon</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        {config.faviconUrl ? (
                          <img src={config.faviconUrl} alt="Favicon" className="h-8 mx-auto mb-2" />
                        ) : (
                          <Globe className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        )}
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Favicon
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">ICO, PNG. 32x32 or 64x64.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Login Page Background</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Image className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Background
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG. Recommended: 1920x1080.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Login Page Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customLoginMessage">Custom Login Message</Label>
                    <Textarea
                      id="customLoginMessage"
                      placeholder="Welcome to our platform..."
                      value={config.customLoginMessage}
                      onChange={(e) => setConfig(prev => ({ ...prev, customLoginMessage: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Show &quot;Powered by Atlas RC&quot;</Label>
                      <Switch
                        checked={config.showPoweredBy}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showPoweredBy: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Sign Up Link</Label>
                      <Switch
                        checked={config.showSignupLink}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showSignupLink: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Forgot Password Link</Label>
                      <Switch
                        checked={config.showForgotPassword}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showForgotPassword: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Color Presets</CardTitle>
                  <CardDescription>Quick color scheme selection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        className="p-3 border rounded-lg hover:border-blue-500 transition-colors"
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary,
                          accentColor: preset.accent,
                        }))}
                      >
                        <div className="flex gap-1 mb-2">
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.primary }} />
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.secondary }} />
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.accent }} />
                        </div>
                        <div className="text-xs font-medium">{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Colors</CardTitle>
                  <CardDescription>Fine-tune individual colors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.primaryColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.primaryColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.secondaryColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.secondaryColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.accentColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.accentColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Header Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.headerColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, headerColor: e.target.value }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.headerColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, headerColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.backgroundColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.backgroundColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.textColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.textColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Branding</CardTitle>
                  <CardDescription>Customize system emails</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailFromName">From Name</Label>
                      <Input
                        id="emailFromName"
                        value={config.emailFromName}
                        onChange={(e) => setConfig(prev => ({ ...prev, emailFromName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailFromAddress">From Email</Label>
                      <Input
                        id="emailFromAddress"
                        type="email"
                        value={config.emailFromAddress}
                        onChange={(e) => setConfig(prev => ({ ...prev, emailFromAddress: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailFooterText">Email Footer Text</Label>
                    <Textarea
                      id="emailFooterText"
                      value={config.emailFooterText}
                      onChange={(e) => setConfig(prev => ({ ...prev, emailFooterText: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Logo</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Image className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Email Logo
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">Recommended: 200x50 PNG</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Typography</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Body Font</Label>
                      <select
                        className="w-full h-10 px-3 border rounded-md"
                        value={config.fontFamily}
                        onChange={(e) => setConfig(prev => ({ ...prev, fontFamily: e.target.value }))}
                      >
                        {fontOptions.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Heading Font</Label>
                      <select
                        className="w-full h-10 px-3 border rounded-md"
                        value={config.headingFont}
                        onChange={(e) => setConfig(prev => ({ ...prev, headingFont: e.target.value }))}
                      >
                        {fontOptions.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom CSS</CardTitle>
                  <CardDescription>Add custom CSS styles (advanced users)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="/* Custom CSS */"
                    value={config.customCss}
                    onChange={(e) => setConfig(prev => ({ ...prev, customCss: e.target.value }))}
                    className="font-mono text-sm h-32"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Preview</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`border rounded-lg overflow-hidden ${previewMode === 'mobile' ? 'max-w-[320px] mx-auto' : ''}`}
                style={{ backgroundColor: config.backgroundColor }}
              >
                {/* Preview Header */}
                <div
                  className="p-4 flex items-center gap-3"
                  style={{ backgroundColor: config.headerColor }}
                >
                  <div className="w-8 h-8 bg-white/20 rounded" />
                  <span className="text-white font-medium">{config.companyName}</span>
                </div>

                {/* Preview Content */}
                <div className="p-4 space-y-4">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: config.textColor, fontFamily: config.headingFont }}
                  >
                    Welcome Back
                  </h2>
                  <p style={{ color: config.textColor, fontFamily: config.fontFamily }}>
                    {config.customLoginMessage || 'Sign in to continue to your dashboard.'}
                  </p>

                  <div className="space-y-2">
                    <div className="h-10 bg-gray-100 rounded" />
                    <div className="h-10 bg-gray-100 rounded" />
                  </div>

                  <button
                    className="w-full py-2 rounded text-white font-medium"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    Sign In
                  </button>

                  <div className="flex justify-between text-sm">
                    {config.showForgotPassword && (
                      <span style={{ color: config.primaryColor }}>Forgot password?</span>
                    )}
                    {config.showSignupLink && (
                      <span style={{ color: config.primaryColor }}>Create account</span>
                    )}
                  </div>

                  {config.showPoweredBy && (
                    <div className="text-center text-xs text-gray-400 pt-4">
                      Powered by Atlas RC
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Swatch */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Color Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: config.primaryColor }} />
                  <span className="text-sm">Primary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: config.secondaryColor }} />
                  <span className="text-sm">Secondary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: config.accentColor }} />
                  <span className="text-sm">Accent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border" style={{ backgroundColor: config.headerColor }} />
                  <span className="text-sm">Header</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WhiteLabelConfigPage;
