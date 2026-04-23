import { useState } from 'react'
import { supabase } from '../api/supabase'

export function useImageUpload(bucketName: string = 'images') {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true)
    setUploadError(null)
    
    try {
      // Генеруємо унікальне ім'я для файлу, щоб не було конфліктів
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `public/${fileName}`

      // Завантажуємо файл у Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      // Отримуємо публічне URL-посилання на завантажену картинку
      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
      return data.publicUrl
      
    } catch (err: any) {
      console.error('Upload Error:', err)
      setUploadError(err.message)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadImage, isUploading, uploadError }
}