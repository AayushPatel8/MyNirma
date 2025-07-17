import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Heart } from "lucide-react";
import { Bookmark } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"



interface NotesCardProps {
    title: string;
    uploader_name: string;
    date: string;
    academicYear: string;
    branch: string;
    subject: string;
    description: string;
    tags: [];
    fileLink: string;
    id: string;
    deleteNote?: (noteId: string) => Promise<boolean>;
}

export default function NotesCard({ id, title, description, uploader_name = "Aayush Patel", date = "June 30, 2025", academicYear, branch = 'CSE', subject = 'DSA', tags, fileLink, deleteNote }: NotesCardProps) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        const isNoteLiked = async (noteId: string) => {
            const supabase = createClient();

            const {
                data,
                error,
            } = await supabase
                .from('note_likes')
                .select('note_id')
                .eq('note_id', noteId)
                .limit(1);

            if (error) {
                console.error('Error checking like status:', error);
                return false;
            }
            setLiked(data.length > 0);

            const { count, error: countError } = await supabase
                .from('note_likes')
                .select('*', { count: 'exact', head: true })
                .eq('note_id', noteId);

            if (!countError) setLikeCount(count || 0);


            return data.length > 0; // true if liked
        };

        isNoteLiked(id);
    }, [id])



    const likeNote = async () => {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) return;

        if (liked) {
            // Remove like
            const { error } = await supabase
                .from('note_likes')
                .delete()
                .eq('note_id', id)
                .eq('user_id', userId);

            if (!error) {
                setLiked(false);
                setLikeCount(likeCount - 1);
            }
        } else {
            // Add like
            const { error } = await supabase
                .from('note_likes')
                .insert([{ note_id: id, user_id: userId }]);

            if (!error) {
                setLiked(true);
                setLikeCount(likeCount + 1);
            }
        }
    }

    return (
        <Card className="w-full mx-auto">
            <CardHeader className="relative pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                            Uploaded by {uploader_name} · {date}
                        </CardDescription>
                    </div>

                    {/* 3-dot dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-6 h-6 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-28">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setShowDeleteDialog(true)}
                                className="text-red-500"
                            >
                                Delete
                            </DropdownMenuItem>


                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete <strong>{title}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => {
                                deleteNote?.(id);
                                setShowDeleteDialog(false);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <CardContent className="flex gap-4 pb-2">
                <div className="relative w-32 h-32 flex justify-center items-center bg-gray-100">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/1200px-PDF_file_icon.svg.png"
                        alt="note"
                        className="max-w-[80%] max-h-[80%] object-contain"
                    />

                    {/* Download button overlay */}
                    <a
                        href={fileLink}
                        download
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                            />
                        </svg>
                    </a>
                </div>

                <div className="flex-1 text-sm space-y-1">
                    <p className="text-muted-foreground">
                        Roll No: <strong>22bce236</strong> · Academic Year: <strong>{academicYear === '1' ? '1st Year' : academicYear === '2' ? '2nd Year' : '3rd Year'}</strong> · Branch: <strong>{branch}</strong> · Subject: <strong>{subject}</strong>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full"
                            >
                                {tag[0] === '#' ? tag : '#' + tag}
                            </span>
                        ))}
                    </div>
                    <div className="mt-10">
                        <Button onClick={() => likeNote()} variant="ghost" size="sm">{liked ? <Heart className="w-6 h-6 text-red-500 fill-red-500 stroke-red-500" /> : <Heart className="w-6 h-6" />} {likeCount} Likes</Button>
                        <Button variant="ghost" size="sm"><Bookmark className="w-6 h-6 text-yellow-500 fill-yellow-500 stroke-yellow-500" /> Bookmark</Button>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-1 pb-2 flex justify-end gap-4 text-sm">

            </CardFooter>
        </Card>
    );
}
