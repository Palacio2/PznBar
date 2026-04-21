import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../api/supabase'
import { Category, Product } from '../types/menu'

export function useAdminMenu() {
  const queryClient = useQueryClient()

  const useAdminProducts = () => useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Product[]
    }
  })

  const createCategory = useMutation({
    mutationFn: async (newCategory: Partial<Category>) => {
      const { error } = await supabase.from('categories').insert([newCategory])
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })

  const updateCategory = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Category> }) => {
      const { error } = await supabase.from('categories').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })

  const createProduct = useMutation({
    mutationFn: async (newProduct: Partial<Product>) => {
      const { error } = await supabase.from('products').insert([newProduct])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })

  const updateProduct = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const { error } = await supabase.from('products').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })

  return {
    useAdminProducts,
    createCategory,
    updateCategory,
    deleteCategory,
    createProduct,
    updateProduct,
    deleteProduct,
  }
}