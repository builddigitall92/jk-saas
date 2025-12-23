"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Users, Sparkles } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface TeamMember {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
}

interface WelcomeHeroProps {
    userName: string
    establishmentId?: string
}

export function WelcomeHero({ userName, establishmentId }: WelcomeHeroProps) {
    const supabase = createClient()
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTeamMembers() {
            if (!establishmentId) {
                setLoading(false)
                return
            }

            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data } = await (supabase as any)
                    .from('profiles')
                    .select('id, first_name, last_name, avatar_url')
                    .eq('establishment_id', establishmentId)
                    .limit(5)

                if (data) {
                    setTeamMembers(data)
                }
            } catch (error) {
                console.error('Error fetching team members:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTeamMembers()
    }, [establishmentId])

    const currentDate = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    const getInitials = (member: TeamMember) => {
        const first = member.first_name?.charAt(0) || ''
        const last = member.last_name?.charAt(0) || ''
        return (first + last).toUpperCase() || '?'
    }

    const activeCount = teamMembers.length

    return (
        <div className="group relative overflow-hidden rounded-[18px] border border-white/[0.08] shadow-2xl shadow-orange-500/5 transition-all duration-500 hover:shadow-orange-500/10 hover:border-white/[0.12]">
            {/* Gradient background layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1410] via-[#251a14] to-[#1a1410]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,140,66,0.15),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(239,68,68,0.08),transparent_60%)]" />

            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] bg-[length:250%_100%] group-hover:animate-shimmer" />

            {/* Glass overlay */}
            <div className="absolute inset-0 backdrop-blur-[2px]" />

            {/* Content */}
            <div className="relative p-8">
                {/* Top accent line */}
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

                {/* Sparkle icon */}
                <div className="absolute top-6 right-6 opacity-40 group-hover:opacity-60 transition-opacity">
                    <Sparkles className="h-5 w-5 text-orange-400 animate-pulse" />
                </div>

                {/* Welcome text */}
                <div className="mb-6">
                    <h1 className="text-[2.5rem] font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent leading-tight mb-2 tracking-tight">
                        Bienvenue, {userName} !
                    </h1>
                    <p className="text-base text-white/60 capitalize font-light tracking-wide">
                        📅 {currentDate}
                    </p>
                    {/* Ambient subtitle */}
                    <p className="text-sm text-orange-400/70 mt-3 font-medium">
                        Prêt à sécuriser le service d&apos;aujourd&apos;hui.
                    </p>
                </div>

                {/* Team members */}
                <div className="flex items-center gap-4">
                    {/* Avatar stack with glow */}
                    <div className="flex -space-x-3">
                        {loading ? (
                            <div className="h-11 w-11 rounded-full bg-white/10 animate-pulse ring-2 ring-[#1a1410]" />
                        ) : teamMembers.length > 0 ? (
                            teamMembers.slice(0, 4).map((member, index) => (
                                <div
                                    key={member.id}
                                    className="relative h-11 w-11 rounded-full ring-2 ring-[#1a1410] overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 transition-all duration-300 hover:scale-110 hover:z-20 hover:ring-orange-500/50 cursor-pointer group/avatar"
                                    style={{ zIndex: 10 - index }}
                                    title={`${member.first_name} ${member.last_name}`}
                                >
                                    {/* Avatar glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />

                                    {member.avatar_url ? (
                                        <Image
                                            src={member.avatar_url}
                                            alt={`${member.first_name} ${member.last_name}`}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-white text-sm font-bold">
                                            {getInitials(member)}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center ring-2 ring-[#1a1410]">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Team count pill with glow */}
                    <div className="relative group/pill">
                        <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl opacity-0 group-hover/pill:opacity-100 transition-opacity" />
                        <div className="relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] hover:border-orange-500/30 transition-all cursor-default">
                            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-sm text-white/80 font-medium">
                                {activeCount > 0 ? `+${activeCount} membres de l'équipe actifs` : 'Aucun membre actif'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1a1410]/50 to-transparent pointer-events-none" />
        </div>
    )
}
