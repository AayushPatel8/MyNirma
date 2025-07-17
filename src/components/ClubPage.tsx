'use client'
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, GraduationCap, Crown, Star } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Member {
    name: string;
    role?: string;
}

interface Club {
    id: string;
    shortName: string;
    fullName: string;
    logo: string;
    facultyAdvisors: string[];
    boardMembers: Member[];
    executives: Member[];
    members: Member[];
}

const clubsData: Club[] = [
    {
        id: "aces",
        shortName: "ACES",
        fullName: "Association for Computer Engineering Students",
        logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&h=150&fit=crop&crop=center",
        facultyAdvisors: ["Dr. Mehta", "Prof. Joshi"],
        boardMembers: [
            { name: "Aayush Patel", role: "President" },
            { name: "Sonu Kumar", role: "Vice President" }
        ],
        executives: [
            { name: "Raj Patel", role: "Treasurer" },
            { name: "Tanya Mehra", role: "Event Head" }
        ],
        members: [
            { name: "Arjun Sharma" },
            { name: "Priya Patel" },
            { name: "Karan Modi" },
            { name: "Sneha Jain" },
            { name: "Rohit Gupta" },
            { name: "Anjali Singh" },
            { name: "Vikram Rao" },
            { name: "Kavya Nair" }
        ]
    },
    {
        id: "nvm",
        shortName: "NVM",
        fullName: "Nirma Volunteering Movement",
        logo: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&h=150&fit=crop&crop=center",
        facultyAdvisors: ["Prof. Ramesh", "Prof. Bhavika"],
        boardMembers: [
            { name: "Riya Sharma", role: "President" },
            { name: "Devansh Shah", role: "Vice President" }
        ],
        executives: [
            { name: "Nita Desai", role: "Outreach Head" }
        ],
        members: [
            { name: "Manish Thakur" },
            { name: "Pooja Agarwal" },
            { name: "Siddharth Joshi" },
            { name: "Meera Kapoor" },
            { name: "Harsh Pandya" },
            { name: "Divya Mehta" },
            { name: "Amit Trivedi" },
            { name: "Ritika Soni" },
            { name: "Nikhil Jain" },
            { name: "Shreya Patel" }
        ]
    }
];

// Demo: Current user is President of ACES for demonstration
const currentUserRole = { clubId: "aces", role: "President" };

const ClubsPage = () => {
    const canManageClub = (clubId: string) => {
        return currentUserRole.clubId === clubId &&
            (currentUserRole.role === "President" || currentUserRole.role === "Vice President");
    };

    const getRoleIcon = (role: string) => {
        switch (role.toLowerCase()) {
            case "president":
                return <Crown className="w-4 h-4" />;
            case "vice president":
                return <Star className="w-4 h-4" />;
            default:
                return <Users className="w-4 h-4" />;
        }
    };

    const supabase = createClient();
    const [clubsData, setClubsData] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchClubs = async () => {
        const { data: clubs, error } = await supabase
            .from("clubs")
            .select("*");

        if (error) {
            console.error("Error fetching clubs:", error);
            return;
        }

        const clubsWithDetails: Club[] = await Promise.all(clubs.map(async (club: any) => {
            const [faculty, members] = await Promise.all([
                supabase
                    .from("club_faculty_advisors")
                    .select("name")
                    .eq("club_id", club.id)
                    .throwOnError(),
                supabase
                    .from("club_members")
                    .select("user_roll_no, position, level")
                    .eq("club_id", club.id)
                    .throwOnError()
            ]);

            const board: Member[] = [];
            const exec: Member[] = [];
            const general: Member[] = [];

            for (const m of members.data || []) {
                // Optionally fetch user name from `users` table using roll_no
                const { data: user } = await supabase
                    .from("users")
                    .select("first_name, last_name")
                    .eq("roll_no", m.user_roll_no)
                    .maybeSingle();

                const fullName = user ? `${user.first_name} ${user.last_name}` : m.user_roll_no;

                const member = {
                    name: fullName,
                    role: m.position,
                };

                if (m.level === "board") board.push(member);
                else if (m.level === "executive") exec.push(member);
                else general.push(member);
            }

            return {
                id: club.id,
                shortName: club.short_name,
                fullName: club.full_name,
                logo: club.logo_url,
                facultyAdvisors: faculty.data?.map(f => f.name) || [],
                boardMembers: board,
                executives: exec,
                members: general
            };
        }));

        setClubsData(clubsWithDetails);
        setLoading(false);
    };

    useEffect(() => {
        fetchClubs();
    }, []);

    if (loading) return <p className="p-8 text-center text-gray-500">Loading clubs...</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Explore Clubs</h1>
                    <p className="text-slate-600 text-lg">Discover and connect with university organizations</p>
                </div>

                {/* Clubs Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-1 gap-8">
                    {clubsData.map((club) => (
                        <Card key={club.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="w-16 h-16 border-2 border-slate-200">
                                            <AvatarImage src={club.logo} alt={club.shortName} />
                                            <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                {club.shortName.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">{club.shortName}</h2>
                                            <p className="text-slate-600 font-medium">{club.fullName}</p>
                                        </div>
                                    </div>
                                    {canManageClub(club.id) && (
                                        <Button variant="outline" size="sm" className="shrink-0">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Manage
                                        </Button>
                                    )}
                                </div>

                                {/* Faculty Advisors */}
                                <div className="mt-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <GraduationCap className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm font-semibold text-slate-700">Faculty Advisors</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {club.facultyAdvisors.map((advisor, index) => (
                                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                                {advisor}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <Tabs defaultValue="board" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-4">
                                        <TabsTrigger value="board" className="text-xs">Board</TabsTrigger>
                                        <TabsTrigger value="executives" className="text-xs">Executives</TabsTrigger>
                                        <TabsTrigger value="members" className="text-xs">Members</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="board" className="space-y-3">
                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="board-list" className="border-slate-200">
                                                <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:text-slate-900">
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="w-4 h-4" />
                                                        <span>View All Members ({club.boardMembers.length})</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                                                        {club.boardMembers.map((member, index) => (
                                                            <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                                                                <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full">
                                                                    {getRoleIcon(member.role!)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900">{member.name}</p>
                                                                    <p className="text-sm text-amber-700 font-medium">{member.role}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* {club.boardMembers.length > 3 && (
                                                        <div className="mt-3">
                                                            <Accordion type="single" collapsible>
                                                                <AccordionItem value="more-members" className="border-slate-200">
                                                                    <AccordionTrigger className="text-xs text-slate-600 py-2">
                                                                        Show {club.members.length - 3} more members
                                                                    </AccordionTrigger>
                                                                    <AccordionContent>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                                                            {club.boardMembers.map((member, index) => (
                                                                                <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                                                                                    <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full">
                                                                                        {getRoleIcon(member.role!)}
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="font-semibold text-slate-900">{member.name}</p>
                                                                                        <p className="text-sm text-amber-700 font-medium">{member.role}</p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </AccordionContent>
                                                                </AccordionItem>
                                                            </Accordion>
                                                        </div>
                                                    )} */}
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>

                                    </TabsContent>

                                    <TabsContent value="executives" className="space-y-3">
                                        {club.executives.map((executive, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                                                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                                                    <Star className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{executive.name}</p>
                                                    <p className="text-sm text-purple-700 font-medium">{executive.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="members">
                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="members-list" className="border-slate-200">
                                                <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:text-slate-900">
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="w-4 h-4" />
                                                        <span>View All Members ({club.members.length})</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                                                        {club.members.slice(0, 3).map((member, index) => (
                                                            <div key={index} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-md">
                                                                <Avatar className="w-6 h-6">
                                                                    <AvatarFallback className="text-xs bg-slate-200">
                                                                        {member.name.split(' ').map(n => n[0]).join('')}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-sm text-slate-700">{member.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {club.members.length > 3 && (
                                                        <div className="mt-3">
                                                            <Accordion type="single" collapsible>
                                                                <AccordionItem value="more-members" className="border-slate-200">
                                                                    <AccordionTrigger className="text-xs text-slate-600 py-2">
                                                                        Show {club.members.length - 3} more members
                                                                    </AccordionTrigger>
                                                                    <AccordionContent>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                                                            {club.members.slice(3).map((member, index) => (
                                                                                <div key={index + 3} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-md">
                                                                                    <Avatar className="w-6 h-6">
                                                                                        <AvatarFallback className="text-xs bg-slate-200">
                                                                                            {member.name.split(' ').map(n => n[0]).join('')}
                                                                                        </AvatarFallback>
                                                                                    </Avatar>
                                                                                    <span className="text-sm text-slate-700">{member.name}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </AccordionContent>
                                                                </AccordionItem>
                                                            </Accordion>
                                                        </div>
                                                    )}
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClubsPage;
