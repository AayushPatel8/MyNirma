"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Image, GiftIcon as Gif, BarChart3, Smile, Calendar, MapPin } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

const supabase = createClient();

interface PostUser {
    profile_pic: string;
    first_name: string;
    last_name: string;
    roll_no: string;
    // add other user properties if needed
}

interface Post {
    users: PostUser;
    created_at: Date;
    content: string;
    id:string;
    user_id: string;
    // add other post properties if needed
}

interface ReplyTextAreaProps {
    userProfilePic: string;
    post: Post;
    setOpen: (open:boolean)=>void;
    refreshPosts?: ()=> void;
}

export default function ReplyTextArea({ userProfilePic, post, setOpen, refreshPosts }: ReplyTextAreaProps) {
    const [replyText, setReplyText] = useState("")
    const [loading,setLoading] = useState(false);
    


    function timeAgo(date: string | Date) {
        const now = new Date();
        const postDate = new Date(date);
        const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000); // in seconds

        if (diff < 60) return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    }

    const postReply = async () => {
        setLoading(true);
        const user = await supabase.auth.getUser();
        const userId = user.data.user?.id;
        

        const { error } = await supabase.from('doubt_replies').insert([
            {
                user_id: userId,
                content: replyText.trim(),
                parent_reply_id: null,
                is_anonymous: false,
                created_at: new Date(),
                is_by_senior: false,
                doubt_id: post.id,
            },
        ]);
        setLoading(false);
        setOpen(false);
        if (refreshPosts) refreshPosts();
    }

    return (
        <>
            {/* <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Button variant="ghost" size="sm" className="p-2"
                    onClick={() => console.log(post)

                    }>
                    <X className="h-5 w-5" />
                </Button>
                <span className="text-blue-500 font-medium">Drafts</span>
            </div> */}

            {/* Original Tweet in Dialog */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex space-x-3">
                    <Avatar className="h-12 w-12">
                        {/* <AvatarImage src="/placeholder.svg?height=48&width=48" />
                        <AvatarFallback>EM</AvatarFallback> */}
                        <img src={post.users.profile_pic} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-black">{post.users.first_name + ' ' + post.users.last_name}</span>
                            {/* <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div> */}
                            {/* <div className="w-4 h-4 bg-black rounded flex items-center justify-center">
                                <X className="w-2.5 h-2.5 text-white" />
                            </div> */}
                            <span className="text-gray-500">@{post.users.roll_no}</span>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500">{timeAgo(post.created_at)}</span>
                        </div>
                        <div className="mt-2">
                            <p className="text-black text-lg">{post.content}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-3 ml-15 text-gray-500">
                    Replying to <span className="text-blue-500">@{post.users.roll_no}</span>
                </div>
            </div>

            {/* Reply Composition */}
            <div className="p-4">
                <div className="flex space-x-3">
                    <Avatar className="h-12 w-12">
                        {/* <AvatarImage src="/placeholder.svg?height=48&width=48" />
                        <AvatarFallback>EM</AvatarFallback> */}
                        <img src={userProfilePic} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    </Avatar>
                    <div className="flex-1">
                        <Textarea
                            placeholder="Post your reply"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-[120px] border-none resize-none text-xl placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4 ml-15">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="p-2 text-blue-500 hover:bg-blue-50">
                            <Image className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2 text-blue-500 hover:bg-blue-50">
                            <Gif className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2 text-blue-500 hover:bg-blue-50">
                            <BarChart3 className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2 text-blue-500 hover:bg-blue-50">
                            <Smile className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2 text-blue-500 hover:bg-blue-50">
                            <Calendar className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2 text-blue-500 hover:bg-blue-50">
                            <MapPin className="h-5 w-5" />
                        </Button>
                    </div>

                    <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium"
                        disabled={!replyText.trim() || loading}
                        onClick={postReply}
                    >
                        Reply
                    </Button>
                </div>
            </div>
        </>
    )
}
