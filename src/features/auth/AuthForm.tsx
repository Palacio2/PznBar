import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthForm } from '../../hooks/useAuthForm'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

export function AuthForm() {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  
  const {
    activeTab,
    setActiveTab,
    isLoading,
    globalError,
    validationErrors,
    email,
    setEmail,
    password,
    setPassword,
    phone,
    setPhone,
    handleLogin,
    handleRegister
  } = useAuthForm()

  return (
    <div className="w-full max-w-sm mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('welcome_club')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('auth_desc')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">{t('login')}</TabsTrigger>
          <TabsTrigger value="register">{t('register')}</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <Input
                type="email"
                placeholder={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
              {validationErrors.email && <p className="text-xs text-destructive">{validationErrors.email}</p>}
            </div>
            
            <div className="space-y-1">
              <div className="relative flex items-center w-full">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pr-10 w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {validationErrors.password && <p className="text-xs text-destructive">{validationErrors.password}</p>}
            </div>

            {globalError && <p className="text-sm text-destructive font-medium">{globalError}</p>}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('loading') : t('login_btn')}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <Input
                type="email"
                placeholder={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              {validationErrors.email && <p className="text-xs text-destructive">{validationErrors.email}</p>}
            </div>

            <div className="space-y-1">
              <Input
                type="tel"
                placeholder={t('phone_format')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required
              />
              {validationErrors.phone && <p className="text-xs text-destructive">{validationErrors.phone}</p>}
            </div>

            <div className="space-y-1">
              <div className="relative flex items-center w-full">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pr-10 w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {validationErrors.password && <p className="text-xs text-destructive">{validationErrors.password}</p>}
            </div>

            {globalError && <p className="text-sm text-destructive font-medium">{globalError}</p>}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('loading') : t('register_btn')}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}