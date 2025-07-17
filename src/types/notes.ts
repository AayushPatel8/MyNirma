export interface Note {
  id: string;
  title: string;
  subject: string;
  academicYear: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  division: string;
  uploaderName: string;
  uploadDate: string;
  likes: number;
  tags: string[];
  fileUrl?: string;
  description?: string;
}

export type SortOption = 'recent' | 'likes';
export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'All Years';
