'use client'
import { useEffect, useState } from "react";
import { Image, Smile, MapPin, Calendar, MoreVertical, MessageCircle, User2, Heart, Trash, Trash2Icon, MessageCircleWarning } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import ReplyTextArea from "./ReplyTextArea";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"

interface DoubtPost {
    id: string;
    author: {
        name: string;
        username: string;
        avatar: string;
    };
    content: string;
    timestamp: string;
    stats: {
        replies: number;
        reposts: number;
        likes: number;
        views: number;
    };
}

export default function StudentDoubtPost() {
    const supabase = createClient();
    const [doubtText, setDoubtText] = useState<string>("");
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<{ academic_year: string; branch: string } | null>(null);
    const maxLength: number = 280;
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [reportDialog, setReportDialog] = useState(false);
    const [deleteContentId, setDeleteContentId] = useState("");
    const [replyDialog, setReplyDialog] = useState(false);
    const [replyToPost, setReplyToPost] = useState<any | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchCurrentUserId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.id) setCurrentUserId(user.id);
        };
        fetchCurrentUserId();
    }, []);

    const likePost = async (doubtId: string) => {
        if (!currentUserId) return;

        const postIndex = posts.findIndex(p => p.id === doubtId);
        if (postIndex === -1) return;

        const post = posts[postIndex];

        if (post.liked) {
            // Unlike
            const { error } = await supabase
                .from('doubt_likes')
                .delete()
                .eq('target_id', doubtId)
                .eq('user_id', currentUserId);
            if (!error) {
                setPosts(prev =>
                    prev.map(p =>
                        p.id === doubtId
                            ? { ...p, liked: false, likeCount: Math.max(0, p.likeCount - 1) }
                            : p
                    )
                );
            }
        } else {
            // Like
            const { error } = await supabase
                .from('doubt_likes')
                .insert([{ target_id: doubtId, user_id: currentUserId, created_at: new Date() }]);
            if (!error) {
                setPosts(prev =>
                    prev.map(p =>
                        p.id === doubtId
                            ? { ...p, liked: true, likeCount: p.likeCount + 1 }
                            : p
                    )
                );
            }
        }
    };

    const [posts, setPosts] = useState<Array<{
        id: string;
        user_id: string;
        content: string;
        created_at: string;
        subject_name: string;
        users?: {
            first_name: string;
            last_name: string;
            profile_pic: string;
            roll_no: string;
        };
        likeCount: number;
        liked: boolean;
        replyCount: number;
    }>>([]);

    function timeAgo(date: string | Date) {
        const now = new Date();
        const postDate = new Date(date);
        const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000); // in seconds

        if (diff < 60) return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    }

    const fetchPosts = async () => {
        const { data: postsData, error } = await supabase
            .from('doubts')
            .select('id, user_id, content, created_at, subject_name')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching doubts:', error);
            return;
        }

        // For each post, fetch the user profile
        const postsWithUserAndLikes = await Promise.all(
            (postsData ?? []).map(async (post: any) => {
                // Fetch user info
                const { data: userData } = await supabase
                    .from('users')
                    .select('first_name, last_name, profile_pic, roll_no')
                    .eq('id', post.user_id)
                    .single();

                // Fetch like count
                const { count: likeCount } = await supabase
                    .from('doubt_likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('target_id', post.id);

                // Fetch reply count
                const { count: replyCount } = await supabase
                    .from('doubt_replies')
                    .select('*', { count: 'exact', head: true })
                    .eq('doubt_id', post.id);

                // Check if current user liked
                let liked = false;
                if (currentUserId) {
                    const { data: likeData } = await supabase
                        .from('doubt_likes')
                        .select('id')
                        .eq('target_id', post.id)
                        .eq('user_id', currentUserId)
                        .single();
                    liked = !!likeData;
                }

                return {
                    ...post,
                    users: userData || undefined,
                    likeCount: likeCount || 0,
                    liked,
                    replyCount: replyCount || 0, // <-- add this
                };
            })
        );

        setPosts(postsWithUserAndLikes);
    };
    useEffect(() => {
        setLoading(true)
        fetchPosts();
        setLoading(false)
    }, [currentUserId]);

    const [userProfilePic, setProfilePic] = useState<string>("");

    useEffect(() => {
        const fetchUserData = async () => {
            // ...your getCurrentUserName logic...
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data, error } = await supabase
                .from('users')
                .select('profile_pic')
                .eq('id', user.id)
                .single();
            if (!error && data) {
                setProfilePic(
                    data.profile_pic ?? null,
                );
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data, error } = await supabase
                .from('users')
                .select('academic_year, branch')
                .eq('id', user.id)
                .single();
            if (!error && data) {
                setUserProfile({
                    academic_year: data.academic_year,
                    branch: data.branch,
                });
            }
        };
        fetchUserProfile();
    }, []);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        if (e.target.value.length <= maxLength) {
            setDoubtText(e.target.value);
        }
    };

    const handleFocus = (): void => {
        setIsExpanded(true);
    };

    const handlePost = async () => {
        if (doubtText.trim()) {
            setLoading(true);
            const user = await supabase.auth.getUser();
            const userId = user.data.user?.id;

            const { error } = await supabase.from('doubts').insert([
                {
                    user_id: userId,
                    content: doubtText.trim(),
                    academic_year: userProfile?.academic_year,
                    branch: userProfile?.branch,
                    is_anonymous: false,
                    created_at: new Date(),
                },
            ]);

            if (error) {
                console.error(error)
            }
            else {
                await fetchPosts();
            }

            setDoubtText("");
            setIsExpanded(false);
            setLoading(false);
        }
    };

    const remainingChars: number = maxLength - doubtText.length;

    const samplePosts: DoubtPost[] = [
        {
            id: "1",
            author: {
                name: "Sarah Chen",
                username: "sarahc_student",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b977?ixlib=rb-1.2.1&auto=format&fit=crop&w=32&h=32&q=80"
            },
            content: "Can someone explain the difference between async/await and promises in JavaScript? I'm getting confused with the syntax and when to use which approach. 🤔",
            timestamp: "2h",
            stats: {
                replies: 12,
                reposts: 3,
                likes: 28,
                views: 156
            }
        },
        {
            id: "2",
            author: {
                name: "Alex Kumar",
                username: "alexkumar_dev",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=32&h=32&q=80"
            },
            content: "Help! My React component keeps re-rendering infinitely. I think it's related to useEffect but I can't figure out the dependency array. Any tips? #ReactJS #debugging",
            timestamp: "4h",
            stats: {
                replies: 8,
                reposts: 1,
                likes: 15,
                views: 89
            }
        }
    ];

    const handleDelete = async (postId: string) => {
        // 1. Delete all replies for this doubt
        await supabase
            .from('doubt_replies')
            .delete()
            .eq('doubt_id', postId);

        // 2. Delete all likes for this doubt
        await supabase
            .from('doubt_likes')
            .delete()
            .eq('target_id', postId);

        // 3. Delete the doubt itself
        const { error: doubtDeleteError } = await supabase
            .from('doubts')
            .delete()
            .eq('id', postId);

        if (doubtDeleteError) {
            console.error("Failed to delete doubt:", doubtDeleteError);
            return;
        }

        // Optionally update UI
        setPosts(prev => prev.filter(post => post.id !== postId));
    };

    const handleReport = async (postId: string) => {
        alert("Report sent for post ID: " + postId);
        // Optionally, insert into a 'reports' table
    };

    if (loading) {
        console.log("loading...")
        return (
            <div className="w-full px-0 sm:px-4 py-8 space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-4 w-full bg-white rounded-xl shadow-sm p-6">
                        {/* Avatar Skeleton */}
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-3">
                            {/* Username and time */}
                            <div className="flex items-center space-x-2">
                                <Skeleton className="h-4 w-32 rounded" />
                                <Skeleton className="h-3 w-16 rounded" />
                            </div>
                            {/* Content lines */}
                            <Skeleton className="h-4 w-full rounded" />
                            <Skeleton className="h-4 w-5/6 rounded" />
                            {/* Action bar */}
                            <div className="flex space-x-6 mt-2">
                                <Skeleton className="h-5 w-10 rounded" />
                                <Skeleton className="h-5 w-10 rounded" />
                                <Skeleton className="h-5 w-10 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-gray-50">
            <div className="w-full bg-white border-b border-gray-200">
                {/* Post composition area */}
                <div className="border-b border-gray-200 sticky top-0 z-10 bg-white w-full">
                    <div className="p-6">
                        <div className="flex space-x-4">
                            {/* Profile picture */}
                            <div className="flex-shrink-0">
                                {userProfilePic === "" ? <User2 className="w-12 h-12" /> :

                                    <img
                                        src={userProfilePic}
                                        alt="Profile Picture"
                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                                    />
                                }
                                {/* <img
                                    src={userProfilePic}
                                    alt="Student Profile"
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                                /> */}
                            </div>

                            {/* Input area */}
                            <div className="flex-1 min-w-0">
                                <div className="relative">
                                    <textarea
                                        value={doubtText}
                                        onChange={handleTextChange}
                                        onFocus={handleFocus}
                                        placeholder="What's your doubt?"
                                        className="w-full bg-transparent text-gray-900 text-xl placeholder-gray-500 border-none outline-none resize-none overflow-hidden"
                                        style={{
                                            minHeight: isExpanded ? "120px" : "56px",
                                            maxHeight: "300px"
                                        }}
                                        rows={isExpanded ? 5 : 2}
                                    />
                                </div>

                                {/* Privacy setting */}
                                {isExpanded && (
                                    <div className="mt-4 mb-6">
                                        <button className="flex items-center text-blue-600 text-sm font-medium hover:bg-blue-50 px-3 py-2 rounded-full transition-colors border border-blue-200">
                                            <span className="w-4 h-4 mr-2">🌍</span>
                                            Everyone can reply
                                        </button>
                                    </div>
                                )}

                                {/* Bottom controls */}
                                {isExpanded && (
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        {/* Action buttons */}
                                        <div className="flex items-center space-x-2">
                                            <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors">
                                                <Image size={20} />
                                            </button>
                                            <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors">
                                                <Smile size={20} />
                                            </button>
                                            <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors">
                                                <Calendar size={20} />
                                            </button>
                                            <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors">
                                                <MapPin size={20} />
                                            </button>
                                            <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors">
                                                <MoreVertical size={20} />
                                            </button>
                                        </div>

                                        {/* Character count and post button */}
                                        <div className="flex items-center space-x-4">
                                            {doubtText.length > 0 && (
                                                <div className="flex items-center space-x-2">
                                                    <div className="relative w-8 h-8">
                                                        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                                                            <circle
                                                                cx="16"
                                                                cy="16"
                                                                r="14"
                                                                fill="none"
                                                                stroke="#e5e7eb"
                                                                strokeWidth="2"
                                                            />
                                                            <circle
                                                                cx="16"
                                                                cy="16"
                                                                r="14"
                                                                fill="none"
                                                                stroke={remainingChars < 20 ? (remainingChars < 0 ? "#ef4444" : "#f59e0b") : "#2563eb"}
                                                                strokeWidth="2"
                                                                strokeDasharray={`${(doubtText.length / maxLength) * 87.96} 87.96`}
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                        {remainingChars < 20 && (
                                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                                                                {remainingChars}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={handlePost}
                                                disabled={!doubtText.trim() || remainingChars < 0 || loading}
                                                className={`px-8 py-2 rounded-full font-bold text-sm transition-all ${doubtText.trim() && remainingChars >= 0
                                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                    }`}
                                            >
                                                Post
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Doubts counter */}
                {/* <div className="border-b border-gray-200">
                    <div className="p-6 flex items-center justify-center">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                            Show 127 doubts
                        </button>
                    </div>
                </div> */}

                {/* Sample doubt posts */}
                <div className="w-full">
                    {posts.map((post, index) => (
                        <div
                            key={post.id}
                            className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${index < posts.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                            onClick={() => router.push(`/doubts/${post.id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="flex space-x-4">
                                <img
                                    src={post.users?.profile_pic || '/default-avatar.png'}
                                    alt={post.users?.first_name + ' ' + post.users?.last_name || 'User'}
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center mb-2">
                                        <span className="font-bold text-gray-900">
                                            {post.users?.first_name + ' ' + post.users?.last_name || 'Anonymous'}
                                        </span>
                                        <span className="text-gray-500 ml-2">@{post.users?.roll_no || 'no-roll'}</span>
                                        <span className="text-gray-500 mx-2">·</span>
                                        <span className="text-gray-500">{timeAgo(post.created_at)}</span>
                                        <div className="ml-auto">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-1 rounded-full hover:bg-gray-200">
                                                        <MoreVertical className="w-5 h-5 text-gray-500" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {currentUserId === post.user_id ? (

                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteContentId(post.id);
                                                            setDeleteDialog(true);

                                                        }
                                                        }>
                                                            <Trash2Icon color="red" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleReport(post.id)}>
                                                            <MessageCircleWarning color="red" />
                                                            Report
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    <p className="text-gray-900 mb-4 leading-relaxed">
                                        {post.content}
                                    </p>
                                    <div className="flex items-center space-x-8 text-gray-500">
                                        <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors group">
                                            <div onClick={(e) => { e.stopPropagation(); console.log(post); setReplyToPost(post); setReplyDialog(true); }} className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                                                <MessageCircle size={16} />
                                            </div>
                                            <span className="text-sm">{post.replyCount}</span> {/* Replace with actual reply count */}
                                        </button>
                                        <button className="flex items-center space-x-2 hover:text-red-500 transition-colors group" onClick={(e) => { e.stopPropagation(); likePost(post.id) }}>
                                            {post.liked ? <Heart className="w-6 h-6 text-red-500 fill-red-500 stroke-red-500" /> : <Heart className="w-6 h-6" />}
                                            <span className="text-sm">{post.likeCount}</span> {/* Replace with actual like count */}
                                        </button>
                                    </div>
                                </div>
                            </div>


                        </div>
                    ))}
                    <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    post.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteContentId("")}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-red-600 text-white hover:bg-red-700"
                                    onClick={() => {
                                        handleDelete?.(deleteContentId)
                                        setDeleteContentId("");
                                        setDeleteDialog(false);
                                    }}
                                >Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Dialog open={replyDialog} onOpenChange={setReplyDialog}>
                        <DialogTitle className="visibility: hidden">Hello</DialogTitle>
                        <DialogTrigger asChild>
                            {/* <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:text-blue-500">
                                    <MessageCircle className="h-5 w-5" />
                                    <span>Reply</span>
                                </Button> */}
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl p-0 gap-0">

                            {/* Dialog Header */}
                            <ReplyTextArea
                                userProfilePic={userProfilePic || '/default-avatar.png'}
                                post={replyToPost}
                                setOpen={setReplyDialog}
                                refreshPosts={fetchPosts}
                            />
                        </DialogContent>
                    </Dialog>


                </div>
            </div>
        </div>
        // <div className="w-full px-0 sm:px-4 py-8 space-y-6">
        //     {[...Array(3)].map((_, i) => (
        //         <div key={i} className="flex space-x-4 w-full bg-white rounded-xl shadow-sm p-6">
        //             {/* Avatar Skeleton */}
        //             <Skeleton className="w-12 h-12 rounded-full" />
        //             <div className="flex-1 space-y-3">
        //                 {/* Username and time */}
        //                 <div className="flex items-center space-x-2">
        //                     <Skeleton className="h-4 w-32 rounded" />
        //                     <Skeleton className="h-3 w-16 rounded" />
        //                 </div>
        //                 {/* Content lines */}
        //                 <Skeleton className="h-4 w-full rounded" />
        //                 <Skeleton className="h-4 w-5/6 rounded" />
        //                 {/* Action bar */}
        //                 <div className="flex space-x-6 mt-2">
        //                     <Skeleton className="h-5 w-10 rounded" />
        //                     <Skeleton className="h-5 w-10 rounded" />
        //                     <Skeleton className="h-5 w-10 rounded" />
        //                 </div>
        //             </div>
        //         </div>
        //     ))}
        // </div>
    );
}