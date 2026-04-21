import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { supabase } from '../api/supabase'
import { useAppStore } from '../store/useAppStore'

type ValidationErrors = Record<string, string>

export function useAuthForm() {
  const { t } = useTranslation()
  const { referralCodeToApply } = useAppStore()

  const [activeTab, setActiveTab] = useState('login')
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  
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

  return {
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
  }
}