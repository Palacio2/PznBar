import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ShieldAlert, UserPlus, Shield, ShieldQuestion, Star, AlertCircle, X } from 'lucide-react'
import { useAdminStaff } from '../../hooks/useAdminStaff'
import { useAppStore } from '../../store/useAppStore'
import { UserRole } from '../../types/menu'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../../components/ui/drawer'

export function AdminStaffPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user: currentUser } = useAppStore()
  const { useStaffList, searchUser, updateRole } = useAdminStaff()
  const { data: staffList, isLoading } = useStaffList()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [searchPhone, setSearchPhone] = useState('')

  const [confirmAction, setConfirmAction] = useState<{
    userId: string, 
    newRole: UserRole, 
    targetIdentifier: string 
  } | null>(null)

  const handleSearchClick = () => {
    searchUser.mutate({ email: searchEmail.trim(), phone: searchPhone.trim() })
  }

  const resetSearch = () => {
    setSearchEmail('')
    setSearchPhone('')
    searchUser.reset()
  }

  const canManageTarget = (targetRole: UserRole, targetId: string) => {
    if (!currentUser || currentUser.id === targetId) return false
    if (currentUser.role === 'super_admin') return targetRole !== 'super_admin'
    if (currentUser.role === 'admin') return targetRole === 'user' || targetRole === 'staff'
    return false
  }

  const canAssignRole = (roleToAssign: UserRole) => {
    if (!currentUser) return false
    if (currentUser.role === 'super_admin') return true
    if (currentUser.role === 'admin') return roleToAssign === 'user' || roleToAssign === 'staff'
    return false
  }

  const handleRoleChangeRequest = (userId: string, role: UserRole, identifier: string) => {
    setConfirmAction({ userId, newRole: role, targetIdentifier: identifier })
  }

  const executeRoleChange = () => {
    if (confirmAction) {
      updateRole.mutate({ userId: confirmAction.userId, newRole: confirmAction.newRole })
      setIsDrawerOpen(false)
      resetSearch()
      setConfirmAction(null)
    }
  }

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'super_admin': return 'text-destructive bg-destructive/10'
      case 'admin': return 'text-purple-500 bg-purple-500/10'
      case 'staff': return 'text-orange-500 bg-orange-500/10'
      default: return 'text-muted-foreground bg-secondary'
    }
  }

  const searchResult = searchUser.data

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold uppercase">{t('admin_staff', 'Персонал')}</h1>
        </div>
        <Button size="sm" onClick={() => setIsDrawerOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> {t('find', 'Знайти')}
        </Button>
      </header>

      <main className="p-4 space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">{t('loading', 'Завантаження...')}</p>
        ) : staffList?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">{t('no_staff', 'Немає персоналу')}</p>
        ) : (
          staffList?.map(staff => {
            const identifier = staff.email || staff.phone || t('user', 'Користувач')
            const isMe = currentUser?.id === staff.id
            const canManage = canManageTarget(staff.role, staff.id)

            return (
              <div key={staff.id} className="flex flex-col p-4 bg-card border rounded-2xl shadow-sm gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${getRoleColor(staff.role)}`}>
                      {staff.role === 'super_admin' ? <Star className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-sm truncate">{staff.email || t('without_email', 'Без email')}</h3>
                      <p className="text-xs text-muted-foreground">{staff.phone || t('without_phone', 'Без номеру')}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${getRoleColor(staff.role)}`}>
                    {staff.role}
                  </span>
                </div>

                {isMe ? (
                  <div className="pt-3 border-t border-border/50 text-center">
                    <span className="text-xs font-semibold text-primary">{t('your_profile', 'Це ваш профіль')}</span>
                  </div>
                ) : canManage ? (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/50">
                    <div className="flex gap-1.5 flex-1">
                      <Button 
                        variant={staff.role === 'staff' ? 'secondary' : 'outline'} 
                        size="sm" 
                        className="h-8 text-[11px] px-2 flex-1" 
                        onClick={() => handleRoleChangeRequest(staff.id, 'staff', identifier)}
                      >
                        Staff
                      </Button>
                      <Button 
                        variant={staff.role === 'admin' ? 'secondary' : 'outline'} 
                        size="sm" 
                        className="h-8 text-[11px] px-2 flex-1" 
                        onClick={() => handleRoleChangeRequest(staff.id, 'admin', identifier)}
                      >
                        Admin
                      </Button>
                      {canAssignRole('super_admin') && (
                        <Button 
                          variant={staff.role === 'super_admin' ? 'secondary' : 'outline'} 
                          size="sm" 
                          className="h-8 text-[11px] px-2 flex-1" 
                          onClick={() => handleRoleChangeRequest(staff.id, 'super_admin', identifier)}
                        >
                          S.Admin
                        </Button>
                      )}
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="h-8 text-[11px] px-3 shrink-0 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white" 
                      onClick={() => handleRoleChangeRequest(staff.id, 'user', identifier)}
                    >
                      {t('dismiss', 'Звільнити')}
                    </Button>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-border/50 text-center">
                    <span className="text-xs text-muted-foreground">{t('no_access', 'У вас немає доступу до зміни цієї ролі')}</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </main>

      <Drawer 
        open={isDrawerOpen} 
        onOpenChange={(open) => {
          setIsDrawerOpen(open)
          if (!open) resetSearch()
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t('find_user', 'Знайти користувача')}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            
            <div className="space-y-3">
              <Input 
                type="email"
                placeholder={t('search_email_placeholder', 'Введіть Email користувача')}
                className="h-12"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <Input 
                type="tel"
                placeholder={t('search_phone_placeholder', 'Або введіть телефон (+48...)')}
                className="h-12"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
              <Button 
                className="w-full h-12" 
                onClick={handleSearchClick}
                disabled={(!searchEmail && !searchPhone) || searchUser.isPending}
              >
                {searchUser.isPending ? t('searching', 'Пошук...') : t('search_btn', 'Знайти')}
              </Button>
            </div>

            {searchUser.isSuccess && (
              <div className="pt-4 border-t animate-in fade-in">
                {searchResult ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-xl bg-secondary/20 space-y-1">
                      <p className="font-bold text-sm">{searchResult.email || t('not_specified', 'Не вказано')}</p>
                      <p className="text-sm text-muted-foreground">{searchResult.phone || t('not_specified', 'Не вказано')}</p>
                      <p className="text-xs font-semibold mt-2 text-primary">{t('current_role', 'Поточна роль:')} {searchResult.role.toUpperCase()}</p>
                    </div>
                    
                    {currentUser?.id === searchResult.id ? (
                      <p className="text-sm text-center font-semibold text-primary">{t('your_profile', 'Це ваш профіль')}</p>
                    ) : canManageTarget(searchResult.role, searchResult.id) ? (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">{t('change_role_to', 'Змінити роль на:')}</p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <Button variant="outline" onClick={() => handleRoleChangeRequest(searchResult.id, 'staff', searchResult.email || searchResult.phone || t('user'))} className="gap-2 justify-start h-10">
                            <ShieldQuestion className="h-4 w-4 text-orange-500" />
                            Staff
                          </Button>
                          <Button variant="outline" onClick={() => handleRoleChangeRequest(searchResult.id, 'admin', searchResult.email || searchResult.phone || t('user'))} className="gap-2 justify-start h-10">
                            <Shield className="h-4 w-4 text-purple-500" />
                            Admin
                          </Button>
                          {canAssignRole('super_admin') && (
                            <Button variant="outline" onClick={() => handleRoleChangeRequest(searchResult.id, 'super_admin', searchResult.email || searchResult.phone || t('user'))} className="gap-2 justify-start h-10">
                              <Star className="h-4 w-4 text-destructive" />
                              S.Admin
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-center text-muted-foreground">{t('no_access', 'У вас немає доступу до зміни цієї ролі')}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-center text-destructive py-4">{t('user_not_found', 'Користувача не знайдено')}</p>
                )}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 px-4 pointer-events-auto">
          <div className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setConfirmAction(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
            
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-orange-500" />
            </div>
            
            <h3 className="text-xl font-bold mb-2 text-foreground">
              {t('confirm_action', 'Підтвердження дії')}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {confirmAction.newRole === 'user' ? (
                <>{t('confirm_dismiss', 'Ви дійсно хочете позбавити прав доступу (звільнити) користувача')} <strong>{confirmAction.targetIdentifier}</strong>?</>
              ) : (
                <>{t('confirm_assign', 'Ви дійсно хочете призначити роль')} <span className="uppercase font-bold text-primary">{confirmAction.newRole}</span> {t('to_user', 'користувачу')} <strong>{confirmAction.targetIdentifier}</strong>?</>
              )}
            </p>
            
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setConfirmAction(null)}>
                {t('cancel', 'Скасувати')}
              </Button>
              <Button className="flex-1 h-12 rounded-xl" onClick={executeRoleChange}>
                {t('confirm', 'Підтвердити')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}