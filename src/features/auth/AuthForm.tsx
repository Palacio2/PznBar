import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../api/supabase'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

type ValidationErrors = Record<string, string>

export function AuthForm() {
  const { t } = useTranslation()
  const { referralCodeToApply } = useAppStore()
  
  const [activeTab, setActiveTab] = useState('login')
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [showPassword, setShowPassword] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')

  const loginSchema = z.object({
    email: z.string().email(t('err_invalid_email')),
    password: z.string().min(6, t('err_password_short')).max(50, t('err_password_long')),
  })

  const registerSchema = z.object({
    email: z.string().email(t('err_invalid_email')),
    phone: z.string().regex(/^\+?[0-9]{9,15}$/, t('err_invalid_phone')),
    password: z.string().min(6, t('err_password_short')).max(50, t('err_password_long')),
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setGlobalError(null)
    setValidationErrors({})

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const errors: ValidationErrors = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0] !== undefined) {
          errors[String(issue.path[0])] = issue.message
        }
      })
      setValidationErrors(errors)
      setIsLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setGlobalError(error.message)
    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setGlobalError(null)
    setValidationErrors({})

    const result = registerSchema.safeParse({ email, phone, password })
    if (!result.success) {
      const errors: ValidationErrors = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0] !== undefined) {
          errors[String(issue.path[0])] = issue.message
        }
      })
      setValidationErrors(errors)
      setIsLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          phone,
          referred_by_code: referralCodeToApply
        },
      },
    })
    
    if (error) {
      setGlobalError(error.message)
    } else {
      setPassword('')
      setGlobalError(null)
      setActiveTab('login')
    }
    
    setIsLoading(false)
  }

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