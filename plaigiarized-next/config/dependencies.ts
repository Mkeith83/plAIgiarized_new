export interface Dependency {
  name: string;
  version: string;
  required: boolean;
  status: 'active' | 'inactive' | 'error';
}

export const dependencies: Record<string, Dependency> = {
  openai: {
    name: 'OpenAI API',
    version: '4.0.0',
    required: true,
    status: 'active'
  },
  supabase: {
    name: 'Supabase',
    version: '2.0.0',
    required: true,
    status: 'active'
  },
  tesseract: {
    name: 'Tesseract.js',
    version: '4.1.1',
    required: false,
    status: 'active'
  }
};

export function checkDependencies(): boolean {
  return Object.values(dependencies)
    .filter(dep => dep.required)
    .every(dep => dep.status === 'active');
}
