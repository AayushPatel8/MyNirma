'use client'
import { University,Calendar, ChevronUp, CircleQuestionMark, Home, Inbox, MessageSquareText, NotebookText, PenLine, Search, Settings, SquarePlus, User2 } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DropdownMenu } from "@radix-ui/react-dropdown-menu"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import Signout from "./Signout"
import PostNotes from "./Post"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

// Menu items.
const items = [
    {
        title: "Home",
        url: "/home",
        icon: Home,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Notes",
        url: "/notes",
        icon: NotebookText,
    },
    {
        title: "Doubts",
        url: "/doubts",
        icon: CircleQuestionMark,
    },
    {
        title: "Post",
        url: "#",
        icon: SquarePlus,
    },
    {
        title: "Messages",
        url: "#",
        icon: MessageSquareText,
    },
    {
        title: "Clubs",
        url: "/clubs",
        icon: University,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]

interface sidebarProps {
    user: string;
    profileImage: string;
}

export function AppSidebar({ user = "Aayush Patel", profileImage }: sidebarProps) {
    return (
        <Sidebar variant="sidebar">
            <SidebarHeader className="text-3xl font-extrabold px-6 py-6 text-black">
                MyNirma
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-2">
                            {items.map((item) => {
                                if (item.title === "Post") {
                                    return (
                                        <Dialog key={item.title}>
                                            <SidebarMenuItem>
                                                <DialogTrigger asChild>
                                                    <SidebarMenuButton className="flex items-center gap-4 px-4 py-3 text-[17px] font-medium text-black rounded-xl hover:bg-neutral-200 transition-colors">
                                                        <item.icon className="w-7 h-7" />
                                                        <span>{item.title}</span>
                                                    </SidebarMenuButton>
                                                </DialogTrigger>
                                            </SidebarMenuItem>
                                            <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>Upload Notes</DialogTitle>
                                                    <DialogDescription>
                                                        Upload your notes here.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <PostNotes />
                                            </DialogContent>
                                        </Dialog>
                                    )
                                }

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a
                                                href={item.url}
                                                className="flex items-center gap-4 px-4 py-3 text-[17px] font-medium text-black rounded-xl hover:bg-neutral-200 transition-colors"
                                            >
                                                <item.icon className="w-7 h-7" />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="mt-auto px-4 py-4 border-t border-neutral-200 dark:border-neutral-700">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="flex items-center gap-3 w-full px-3 py-2 text-[16px] font-medium text-black rounded-xl hover:bg-neutral-200 transition-colors ">
                                    {profileImage === "" ? <User2 className="w-6 h-6" /> :

                                        <img
                                            src={profileImage}
                                            alt="Profile Picture"
                                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                                        />
                                    }

                                    <span>{user}</span>
                                    <ChevronUp className="ml-auto w-4 h-4 opacity-60" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width] bg-white dark:bg-neutral-900 shadow-md rounded-lg py-1"
                            >
                                <DropdownMenuItem className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => redirect('/my-notes')} className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
                                    <span>My Notes</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
                                    <Signout />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
