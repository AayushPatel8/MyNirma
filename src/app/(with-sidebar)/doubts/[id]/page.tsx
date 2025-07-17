"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MessageCircle, Repeat2, Heart, Bookmark, Share, MoreHorizontal, BarChart3 } from "lucide-react"
import { redirect } from "next/navigation"
import { useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton";
import ReplyTextArea from "@/components/ReplyTextArea"

const supabase = createClient();

export default function PostPage() {
  const [replyText, setReplyText] = useState("")
  type PostDetails = { user_id: any; content: any; created_at: any } | null;
  type ParentDetails = { first_name: string; last_name: string; profile_pic: string, roll_no: string } | null;
  type CurrentUserDetails = { id: string; profile_pic: string } | null
  const [postDetails, setPostDetails] = useState<PostDetails>(null);
  const [parentUser, setParentUser] = useState<ParentDetails>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUserDetails>(null);
  const [replyDialog, setReplyDialog] = useState(false);
  const [replyToPost, setReplyToPost] = useState<any | null>(null);
  const param = useParams();
  const [replies, setReplies] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState(0);

  const fetchReplies = async () => {
    // 1. Get all replies for this doubt
    const { data: repliesData, error } = await supabase
      .from('doubt_replies')
      .select('*')
      .eq('doubt_id', param.id)
      .order('created_at', { ascending: true });

    if (!repliesData) {
      setReplies([]);
      return;
    }

    // 2. For each reply, fetch user details
    const repliesWithUsers = await Promise.all(
      repliesData.map(async (reply: any) => {
        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name, profile_pic, roll_no')
          .eq('id', reply.user_id)
          .single();
        return {
          ...reply,
          users: userData || {},
        };
      })
    );

    setReplies(repliesWithUsers);
  };

  const count_likes = async () => {
    const { count: likeCount } = await supabase
      .from('doubt_likes')
      .select('*', { count: 'exact', head: true })
      .eq('target_id', param.id);

    setLikes(likeCount?likeCount:0);
  }

  const deleteMainDoubt = async (doubtId: string) => {
    // 1. Delete all replies for this doubt
    await supabase
      .from('doubt_replies')
      .delete()
      .eq('doubt_id', doubtId);

    // 2. Delete all likes for this doubt
    await supabase
      .from('doubt_likes')
      .delete()
      .eq('target_id', doubtId);

    // 3. Delete the doubt itself
    const { error } = await supabase
      .from('doubts')
      .delete()
      .eq('id', doubtId);

    if (!error) {
      redirect('/doubts');
    } else {
      alert("Failed to delete the doubt.");
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      // Close menu if any menu is open and the click is outside any menu
      if (menuOpen) {
        const menus = document.querySelectorAll('.z-50');
        let clickedInside = false;
        menus.forEach(menu => {
          if (menu.contains(e.target as Node)) clickedInside = true;
        });
        if (!clickedInside) setMenuOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const addReply = async () => {
    if (!replyText.trim()) return;
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;
    // Insert reply
    const { error } = await supabase
      .from('doubt_replies')
      .insert([{
        user_id: user.id,
        content: replyText.trim(),
        parent_reply_id: null,
        is_anonymous: false,
        created_at: new Date(),
        is_by_senior: false,
        doubt_id: param.id,
      }]);
    if (!error) {
      setReplyText("");      // Clear textarea
      fetchReplies();        // Refresh replies
    }
  }

  const deleteReply = async (replyId: string) => {
    const { error } = await supabase
      .from('doubt_replies')
      .delete()
      .eq('id', replyId);

    if (!error) {
      fetchReplies(); // Refresh the replies list
    } else {
      // Optionally show an error message
      alert("Failed to delete reply.");
    }
  };

  function formatPostTime(dateString: string) {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const day = date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${time} · ${day}`;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }


  useEffect(() => {
    const fetchPostDetails = async () => {
      const { data, error } = await supabase
        .from('doubts')
        .select('user_id, content, created_at')
        .eq('id', param.id)
        .single();
      setPostDetails(data);
    }
    fetchPostDetails();
  }, [param.id])

  useEffect(() => {
    fetchReplies();
    count_likes();
  }, [param.id]);

  useEffect(() => {
    if (!postDetails?.user_id) return;
    const fetchParentUser = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name, profile_pic, roll_no')
        .eq('id', postDetails.user_id)
        .single();
      setParentUser({
        first_name: data?.first_name,
        last_name: data?.last_name,
        profile_pic: data?.profile_pic,
        roll_no: data?.roll_no
      });
    };
    fetchParentUser();
  }, [postDetails?.user_id]);
  useEffect(() => {
    const fetchCurrentUserProfilePic = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('users')
        .select('id, profile_pic')
        .eq('id', user.id)
        .single();
      if (data?.profile_pic) setCurrentUser({
        id: data.id,
        profile_pic: data.profile_pic
      });
    };
    fetchCurrentUserProfilePic();
  })

  if (!postDetails || !parentUser) {
    return (
      <div className="min-h-screen bg-white w-full">
        {/* Header Skeleton */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-24 rounded" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>

        <div className="w-full">
          {/* Main Post Skeleton */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-32 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-6 w-full rounded" />
                <Skeleton className="h-6 w-5/6 rounded" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-8 w-3/4 rounded" />
              <Skeleton className="h-6 w-1/2 rounded mt-2" />
            </div>
            <div className="mt-4 flex space-x-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-16 rounded" />
              ))}
            </div>
          </div>

          {/* Reply Composition Skeleton */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-10 w-full rounded" />
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Replies Skeleton */}
          <div className="divide-y divide-gray-200">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="p-4 hover:bg-gray-50 transition-colors relative">
                <div className="flex space-x-3 items-start">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-4 w-12 rounded" />
                    </div>
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-4 py-3 ">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => redirect('/doubts')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-black">Post</h1>
          </div>
          <Button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium" onClick={() => setReplyDialog(true)}>Reply</Button>
        </div>
      </div>


      <div className="w-full">
        {/* Main Post */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12">
              {/* <AvatarImage src="/placeholder.svg?height=48&width=48" />
                        <AvatarFallback>EM</AvatarFallback> */}
              <img src={parentUser?.profile_pic} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-black text-lg">{parentUser?.first_name} {parentUser?.last_name}</span>

              </div>
              <p className="text-gray-500 text-base">@{parentUser?.roll_no}</p>
            </div>
            <div className="relative ml-auto">
              <Button variant="ghost" size="sm" className="p-2" onClick={() => setMenuOpen(menuOpen === "main" ? null : "main")}>
                <MoreHorizontal className="h-5 w-5" />
              </Button>
              {menuOpen === "main" && (
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-50">
                  {postDetails?.user_id === currentUser?.id ? (
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                      onClick={() => {
                        // handle delete for main doubt
                        // deleteMainDoubt(postDetails.id)
                        if (typeof param.id === "string") deleteMainDoubt(param.id);
                        setMenuOpen(null);
                      }}
                    >
                      Delete
                    </button>
                  ) : (
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-yellow-600"
                      onClick={() => {
                        // handle report for main doubt
                        setMenuOpen(null);
                      }}
                    >
                      Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-black text-2xl leading-relaxed">{postDetails?.content}</p>
          </div>

          <div className="mt-4 text-gray-500 text-base">
            {postDetails?.created_at ? formatPostTime(postDetails.created_at) : ""}
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50"
              onClick={() => {
                setReplyToPost({
                  ...postDetails,
                  id: param.id,
                  users: parentUser, // attach user info for ReplyTextArea
                });
                setReplyDialog(true)
              }}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">{replies.length}</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-500 hover:bg-green-50"
            >
              <Repeat2 className="h-5 w-5" />
              <span className="font-medium">{formatNumber(17000)}</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-gray-600 hover:text-red-500 hover:bg-red-50"
            >
              <Heart className="h-5 w-5" />
              <span className="font-medium">{formatNumber(likes)}</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">{formatNumber(353000)}</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50"
            >
              <Bookmark className="h-5 w-5" />
              <span className="font-medium">{formatNumber(6300)}</span>
            </Button>
            <Button variant="ghost" className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50">
              <Share className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Reply Composition */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-3">
            <Avatar className="h-12 w-12">
              {/* <AvatarImage src="/placeholder.svg?height=48&width=48" />
                        <AvatarFallback>EM</AvatarFallback> */}
              <img src={currentUser?.profile_pic ?? "/placeholder.svg?height=40&width=40"} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Post your reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[60px] border-none resize-none text-lg placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              />
              <div className="flex justify-end mt-3">
                <Button
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium"
                  disabled={!replyText.trim()}
                  onClick={addReply}
                >
                  Reply
                </Button>
              </div>
            </div>
          </div>
        </div>

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
              userProfilePic={currentUser?.profile_pic || '/default-avatar.png'}
              post={replyToPost}
              setOpen={setReplyDialog}
              refreshPosts={fetchReplies}
            />
          </DialogContent>
        </Dialog>

        {/* Replies */}
        <div className="divide-y divide-gray-200">
          {replies.map((reply, idx) => (
            <div key={reply.id || idx} className="p-4 hover:bg-gray-50 transition-colors relative">
              <div className="flex space-x-3 items-start">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={reply.users?.profile_pic || "/placeholder.svg?height=40&width=40"} />
                  <AvatarFallback>
                    {reply.users?.first_name?.[0]}
                    {reply.users?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-black">
                      {reply.users?.first_name} {reply.users?.last_name}
                    </span>
                    <span className="text-gray-500">@{reply.users?.roll_no}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500">{formatPostTime(reply.created_at)}</span>
                  </div>
                  <p className="text-black mt-1">{reply.content}</p>
                </div>
                {/* Three dots menu on the right */}
                <div className="relative ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => setMenuOpen(menuOpen === reply.id ? null : reply.id)}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                  {menuOpen === reply.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-50">
                      {reply.user_id === currentUser?.id ? (
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                          onClick={() => {
                            // handle delete
                            deleteReply(reply.id)
                            setMenuOpen(null);
                          }}
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-yellow-600"
                          onClick={() => {
                            // handle report
                            setMenuOpen(null);
                          }}
                        >
                          Report
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
