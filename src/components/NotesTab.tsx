'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, SortAsc, Clock, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
// import { RecentNotes } from './RecentNotes';
import { NoteCard } from './NoteCard';
import { AcademicYear, Note, SortOption } from '@/types/Notes';
import { createClient } from '@/utils/supabase/client';

// Mock data for demonstration
const mockNotes: Note[] = [
    {
        id: '1',
        title: 'Data Structures and Algorithms - Trees',
        subject: 'Computer Science',
        academicYear: '2nd Year',
        division: 'A',
        uploaderName: 'John Doe',
        uploadDate: '2024-01-15',
        likes: 25,
        tags: ['algorithms', 'trees', 'binary-tree'],
        description: 'Comprehensive notes on tree data structures and algorithms'
    },
    {
        id: '2',
        title: 'Calculus Integration Techniques',
        subject: 'Mathematics',
        academicYear: '1st Year',
        division: 'B',
        uploaderName: 'Jane Smith',
        uploadDate: '2024-01-20',
        likes: 18,
        tags: ['calculus', 'integration', 'techniques'],
        description: 'Step-by-step guide to various integration methods'
    },
    {
        id: '3',
        title: 'Object-Oriented Programming Concepts',
        subject: 'Computer Science',
        academicYear: '2nd Year',
        division: 'A',
        uploaderName: 'Mike Johnson',
        uploadDate: '2024-01-22',
        likes: 32,
        tags: ['oop', 'programming', 'concepts'],
        description: 'Complete guide to OOP principles and implementation'
    },
    {
        id: '4',
        title: 'Organic Chemistry Reactions',
        subject: 'Chemistry',
        academicYear: '3rd Year',
        division: 'C',
        uploaderName: 'Sarah Wilson',
        uploadDate: '2024-01-25',
        likes: 15,
        tags: ['organic', 'reactions', 'mechanisms'],
        description: 'Detailed notes on organic reaction mechanisms'
    },
    {
        id: '5',
        title: 'Linear Algebra Matrix Operations',
        subject: 'Mathematics',
        academicYear: '2nd Year',
        division: 'B',
        uploaderName: 'David Brown',
        uploadDate: '2024-01-28',
        likes: 22,
        tags: ['linear-algebra', 'matrices', 'operations'],
        description: 'Comprehensive guide to matrix operations and applications'
    }
];

// Mock current user data
const currentUser = {
    academicYear: '2nd Year' as const,
    semester: 'Spring 2024',
    division: 'A'
};

export const NotesTab = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<AcademicYear>('All Years');
    const [sortBy, setSortBy] = useState<SortOption>('recent');
    const [showSameDivision, setShowSameDivision] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('notes')
                .select('*');

            if (error) {
                console.error('Error fetching notes:', error);
            } else {
                setNotes(data || []);
            }
            setLoading(false);
        };

        fetchNotes();
    }, []);


    // Filter and sort notes
    const filteredAndSortedNotes = useMemo(() => {
        let filtered = notes.filter(note => {
            // Search filter
            const matchesSearch = searchQuery === '' ||
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            // Academic year filter
            const matchesYear = selectedYear === 'All Years' || note.academicYear === selectedYear;

            // Division filter
            const matchesDivision = !showSameDivision || note.division === currentUser.division;

            return matchesSearch && matchesYear && matchesDivision;
        });

        // Sort notes
        filtered.sort((a, b) => {
            if (sortBy === 'likes') {
                return b.likes - a.likes;
            } else {
                return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
            }
        });

        return filtered;
    }, [searchQuery, selectedYear, sortBy, showSameDivision]);

    // Group notes by subject
    const notesBySubject = useMemo(() => {
        const grouped: Record<string, Note[]> = {};
        filteredAndSortedNotes.forEach(note => {
            if (!grouped[note.subject]) {
                grouped[note.subject] = [];
            }
            grouped[note.subject].push(note);
        });
        return grouped;
    }, [filteredAndSortedNotes]);
    
    if (loading) {
        return <div className="text-center py-12 text-gray-500">Loading notes...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Academic Notes Archive</h1>
                <p className="text-gray-600">Search, filter, and discover notes from your academic community</p>
            </div>

            {/* Recent Notes Section */}
            {/* <RecentNotes currentUser={currentUser} notes={mockNotes} /> */}

            <Separator className="my-8" />

            {/* Search and Filters */}
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search notes by title, subject, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 text-lg"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>

                    {/* Academic Year Filter */}
                    <Select value={selectedYear} onValueChange={(value: AcademicYear) => setSelectedYear(value)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Academic Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All Years">All Years</SelectItem>
                            <SelectItem value="1st Year">1st Year</SelectItem>
                            <SelectItem value="2nd Year">2nd Year</SelectItem>
                            <SelectItem value="3rd Year">3rd Year</SelectItem>
                            <SelectItem value="4th Year">4th Year</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Division Filter */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="same-division"
                            checked={showSameDivision}
                            onCheckedChange={(checked) => setShowSameDivision(checked as boolean)}
                        />
                        <label htmlFor="same-division" className="text-sm font-medium">
                            Same Division ({currentUser.division})
                        </label>
                    </div>

                    {/* Sort Options */}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm font-medium text-gray-700">Sort by:</span>
                        <Button
                            variant={sortBy === 'recent' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('recent')}
                            className="flex items-center gap-1"
                        >
                            <Clock className="h-3 w-3" />
                            Recent
                        </Button>
                        <Button
                            variant={sortBy === 'likes' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('likes')}
                            className="flex items-center gap-1"
                        >
                            <Heart className="h-3 w-3" />
                            Likes
                        </Button>
                    </div>
                </div>

                {/* Active Filters Display */}
                {(searchQuery || selectedYear !== 'All Years' || showSameDivision) && (
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-gray-500">Active filters:</span>
                        {searchQuery && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                Search: "{searchQuery}"
                                <button onClick={() => setSearchQuery('')} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                                    ×
                                </button>
                            </Badge>
                        )}
                        {selectedYear !== 'All Years' && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {selectedYear}
                                <button onClick={() => setSelectedYear('All Years')} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                                    ×
                                </button>
                            </Badge>
                        )}
                        {showSameDivision && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                Division {currentUser.division}
                                <button onClick={() => setShowSameDivision(false)} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                                    ×
                                </button>
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            {/* Results Summary */}
            <div className="text-sm text-gray-600">
                Found {filteredAndSortedNotes.length} notes across {Object.keys(notesBySubject).length} subjects
            </div>

            {/* Notes Display */}
            {Object.keys(notesBySubject).length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-lg">No notes found matching your criteria</div>
                    <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
                </div>
            ) : (
                <Accordion type="multiple" className="space-y-4">
                    {Object.entries(notesBySubject).map(([subject, notes]) => (
                        <AccordionItem key={subject} value={subject} className="border rounded-lg">
                            <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold">{subject}</h3>
                                        <Badge variant="outline">{notes.length} notes</Badge>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4">
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {notes.map(note => (
                                        <NoteCard key={note.id} note={note} currentUser={currentUser} />
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    );
};
