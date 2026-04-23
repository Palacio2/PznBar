import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { QrCode, LayoutGrid, Coffee, Users, ShieldAlert, Grape } from 'lucide-react'

export function AdminDashboardPage() {
  const { t } = useTranslation()

  const adminModules = [
    {
      title: t('admin_tables', 'Столики та QR'),
      desc: t('admin_tables_desc', 'Генерація кодів, керування посадкою'),
      icon: <QrCode className="h-8 w-8 text-blue-500" />,
      path: '/admin/tables',
      color: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      title: t('admin_categories', 'Категорії'),
      desc: t('admin_categories_desc', 'Створення та сортування меню'),
      icon: <LayoutGrid className="h-8 w-8 text-green-500" />,
      path: '/admin/categories',
      color: 'bg-green-500/10 border-green-500/20'
    },
    {
      title: t('admin_products', 'Продукти'),
      desc: t('admin_products_desc', 'Товари, ціни, налаштування'),
      icon: <Coffee className="h-8 w-8 text-orange-500" />,
      path: '/admin/products',
      color: 'bg-orange-500/10 border-orange-500/20'
    },
    {
      title: t('admin_ingredients', 'Інгредієнти'),
      desc: t('admin_ingredients_desc', 'Тютюн, алкоголь для конструктора'),
      icon: <Grape className="h-8 w-8 text-pink-500" />,
      path: '/admin/ingredients',
      color: 'bg-pink-500/10 border-pink-500/20'
    },
    {
      title: t('admin_staff', 'Персонал'),
      desc: t('admin_staff_desc', 'Ролі, додавання офіціантів'),
      icon: <Users className="h-8 w-8 text-purple-500" />,
      path: '/admin/staff',
      color: 'bg-purple-500/10 border-purple-500/20'
    }
  ]

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border p-4 mb-6">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-destructive" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider">{t('admin_panel', 'Адмін Панель')}</h1>
            <p className="text-xs text-muted-foreground">{t('admin_panel_desc', 'Керування закладом')}</p>
          </div>
        </div>
      </header>

      <main className="px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {adminModules.map((mod) => (
            <Link key={mod.path} to={mod.path}>
              <div className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer flex flex-col items-center text-center gap-4 ${mod.color}`}>
                <div className="p-4 bg-background rounded-full shadow-sm">
                  {mod.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{mod.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{mod.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}