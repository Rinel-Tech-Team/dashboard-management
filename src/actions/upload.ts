'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';
import { v4 as uuidv4 } from 'uuid';

export async function uploadProofFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'No file provided' };
    }

    // Validate size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'File ini terlalu besar. Maksimal 5MB.' };
    }

    // Only allow specific types (images and PDF)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return { error: 'Format file tidak didukung. Gunakan JPG, PNG, atau PDF.' };
    }

    const supabase = supabaseAdmin;

    // Create unique filename safely without spaces/special chars
    const fileExtension = file.name.split('.').pop() || 'tmp';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `transfers/${uniqueFileName}`;

    // Upload to Supabase 'proofs' bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('proofs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase Storage Error:', uploadError);
      return { error: 'Gagal mengupload file ke Storage.' };
    }

    // Retrieve public URL
    const { data: publicUrlData } = supabase.storage
      .from('proofs')
      .getPublicUrl(filePath);

    return { 
      success: true, 
      url: publicUrlData.publicUrl 
    };
  } catch (error) {
    console.error('Upload Error:', error);
    return { error: 'Terjadi kesalahan sistem saat meng-upload.' };
  }
}
