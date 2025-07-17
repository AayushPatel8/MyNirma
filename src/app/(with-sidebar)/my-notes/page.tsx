'use client'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import NotesCard from "@/components/NotesCard"
import { createClient } from "@/utils/supabase/client";
import { useCallback, useEffect, useState } from "react";


function groupNotes(notes: any[]) {
    const grouped: Record<string, Record<string, Record<string, any[]>>> = {};

    for (const note of notes) {
        const { academic_year, semester, subject } = note;

        if (!grouped[academic_year]) grouped[academic_year] = {};
        if (!grouped[academic_year][semester]) grouped[academic_year][semester] = {};
        if (!grouped[academic_year][semester][subject]) grouped[academic_year][semester][subject] = [];

        grouped[academic_year][semester][subject].push(note);
    }

    return grouped;
}





function myNotes() {
    const [notes, setNotes] = useState<any[]>([]);
    const [grouped, setGrouped] = useState<Record<string, Record<string, Record<string, any[]>>>>({});

    const deleteNote = useCallback(async (noteId: string) => {
        console.log('delete called')
        const supabase = createClient();

        const { data, error: gettingFilePathError } = await supabase
            .from('notes')
            .select('file_url')
            .eq('id', noteId)
            .single();

        if (gettingFilePathError) {
            console.error('Error fetching file path:', gettingFilePathError);
            return false;
        }

        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId);

        if (error) {
            console.error('Error deleting note:', error.message);
            return false;
        }

        const { error: likesError } = await supabase
            .from('note_likes')
            .delete()
            .eq('note_id', noteId);

        if (likesError) {
            console.error('Error deleting likes:', likesError);
            return false;
        }
        const fileUrl = data.file_url;
        const relativePath = fileUrl.split('/notes/')[1]; // after bucket name

        const { error: fileDeleteError } = await supabase.storage
            .from('notes') // your bucket name
            .remove([relativePath]); // pass as array

        if (error) {
            console.error('Error deleting file:', fileDeleteError);
            return false;
        }


        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
        setGrouped(groupNotes(notes.filter(note => note.id !== noteId)));

        return true;
    }, []);

    useEffect(() => {
        const loadNote = async () => {
            const supabase = createClient();
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData?.user?.id;

            const { data: notesData, error } = await supabase
                .from("notes")
                .select("*")
                .eq("user_id", userId);

            if (error) {
                console.error("Error fetching notes:", error);
                setNotes([]);
                setGrouped({});
            } else {
                setNotes(notesData || []);
                setGrouped(groupNotes(notesData || []));
            }
        };

        loadNote();
    }, [deleteNote]);

    return (
        <div className="container m-10">
            <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                My Notes
            </h1>
            <Accordion type="single" collapsible className="w-full" defaultValue="1">
                {[1, 2, 3, 4].map((year) => (
                    <AccordionItem key={`year-${year}`} value={String(year)}>
                        <AccordionTrigger>{`${year}st Year`.replace('1st', '1st').replace('2st', '2nd').replace('3st', '3rd').replace('4st', '4th')}</AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-2">
                            <Accordion type="single" collapsible>
                                {[year * 2 - 1, year * 2].map((sem) => (
                                    <AccordionItem key={`sem-${year}-${sem}`} value={`sem-${year}-${sem}`}>
                                        <AccordionTrigger>Semester {sem}</AccordionTrigger>
                                        <AccordionContent className="pl-4">
                                            <Accordion type="single" collapsible>
                                                {Object.keys(grouped[year]?.[sem] || {}).map((subject, index) => (
                                                    <AccordionItem key={subject} value={`sub-${year}-${sem}-${index}`}>
                                                        <AccordionTrigger>{subject}</AccordionTrigger>
                                                        <AccordionContent className="pl-4">
                                                            <ul className="list-disc pl-4 space-y-1">
                                                                {grouped[year][sem][subject].map(note => (
                                                                    <NotesCard
                                                                        key={note.id}
                                                                        id={note.id}
                                                                        title={note.title}
                                                                        description={note.description}
                                                                        uploader_name={note.uploader_name}
                                                                        date={new Date(note.uploaded_at).toDateString()}
                                                                        academicYear={note.academic_year}
                                                                        branch="CSE"
                                                                        subject={note.subject}
                                                                        tags={note.tags}
                                                                        fileLink={note.file_url}
                                                                        deleteNote={deleteNote}
                                                                    />
                                                                ))}
                                                            </ul>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </AccordionContent>
                    </AccordionItem>
                ))}



            </Accordion>
        </div>

    )
}

export default myNotes