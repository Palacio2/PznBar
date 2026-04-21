import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../api/supabase'
import { Badge } from '../../components/ui/badge'
import { ShieldAlert, Shield, Star, UserMinus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { useAppStore } from '../../store/useAppStore'

export function AdminStaff() {
  const { t } = useTranslation()
  const { user, showAlert } = useAppStore()
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'staff', 'super_admin'])
    
    if (!error && data) {
      const sorted = data.sort((a, b) => {
        const order = { super_admin: 0, admin: 1, staff: 2 }
        return (order[a.role as keyof typeof order] ?? 3) - (order[b.role as keyof typeof order] ?? 3)
      })
      setStaff(sorted)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  const canIEdit = (targetMember: any) => {
    if (!user) return false
    if (targetMember.id === user.id) return false
    if (targetMember.role === 'super_admin') return false
    
    if (user.role === 'super_admin') return true
    if (user.role === 'admin') {
      return targetMember.role === 'staff' || targetMember.role === 'admin'
    }
    return false
  }

  const handleUpdateRole = async (targetUserId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetUserId)

    if (error) showAlert(t('error'), error.message)
    else fetchStaff()
  }

  const handleAddStaff = async () => {
    if (!newEmail.trim()) return

    const { data, error } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', newEmail.trim().toLowerCase())
      .single()

    if (error || !data) {
      showAlert(t('error'), t('user_not_found'))
      return
    }

    if (data.role !== 'user') {
      showAlert(t('attention'), t('user_already_team'))
      return
    }

    await handleUpdateRole(data.id, 'staff')
    setNewEmail('')
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">{t('admin_staff_title')}</h2>
        <div className="flex gap-2">
          <Input 
            placeholder={t('staff_email_placeholder')} 
            value={newEmail} 
            onChange={(e) => setNewEmail(e.target.value)}
            className="bg-card"
          />
          <Button onClick={handleAddStaff}>{t('add')}</Button>
        </div>
      </div>
      
      {loading ? (
        <p className="p-4 text-center text-muted-foreground">{t('loading')}</p>
      ) : (
        <div className="grid gap-3">
          {staff.map((member) => (
            <div key={member.id} className={`bg-card p-4 rounded-2xl border border-border flex items-center justify-between gap-2 overflow-hidden ${member.id === user?.id ? 'ring-1 ring-primary/30' : ''}`}>
              
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <div className={`p-3 rounded-full shrink-0 ${
                  member.role === 'super_admin' ? 'bg-red-500/10' : 
                  member.role === 'admin' ? 'bg-primary/10' : 'bg-green-500/10'
                }`}>
                  {member.role === 'super_admin' ? <ShieldAlert className="h-6 w-6 text-red-500" /> : 
                   member.role === 'admin' ? <Shield className="h-6 w-6 text-primary" /> : <Star className="h-6 w-6 text-green-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate">
                    {member.email} {member.id === user?.id && `(${t('it_is_you')})`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {member.phone ? `${t('phone')}: ${member.phone}` : t('no_phone')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {canIEdit(member) && (
                  <div className="flex items-center gap-1 mr-1">
                    {member.role === 'staff' ? (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleUpdateRole(member.id, 'admin')}>
                        <ArrowUpCircle className="h-4 w-4" />
                      </Button>
                    ) : member.role === 'admin' ? (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500" onClick={() => handleUpdateRole(member.id, 'staff')}>
                        <ArrowDownCircle className="h-4 w-4" />
                      </Button>
                    ) : null}
                    
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => showAlert(t('attention'), t('remove_staff_confirm'), () => handleUpdateRole(member.id, 'user'))}>
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <Badge variant={member.role === 'super_admin' ? 'destructive' : member.role === 'admin' ? 'default' : 'secondary'}>
                  {member.role.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}