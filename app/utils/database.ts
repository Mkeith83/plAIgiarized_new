import supabase from './supabaseClient'

export const getDocuments = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching documents:', error)
    throw error
  }
}

export const getAnalysisResults = async (documentId: string) => {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('document_id', documentId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching analysis:', error)
    throw error
  }
}
