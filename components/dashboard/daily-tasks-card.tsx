"use client"

import { Check, Clock, Circle, AlertCircle } from "lucide-react"
import { useState } from "react"

interface Task {
    id: string
    title: string
    time?: string
    urgent?: boolean
    completed?: boolean
}

interface DailyTasksCardProps {
    tasks?: Task[]
}

const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Réception livraison Metro',
        time: '09:30',
        urgent: true,
        completed: false
    },
    {
        id: '2',
        title: 'Contrôle température frigo',
        time: '10:00',
        urgent: false,
        completed: true
    },
    {
        id: '3',
        title: 'Inventaire semi-annuel',
        time: '15:30',
        urgent: false,
        completed: false
    },
    {
        id: '4',
        title: 'Validation planning semaine 43',
        urgent: false,
        completed: false
    }
]

export function DailyTasksCard({ tasks: initialTasks = mockTasks }: DailyTasksCardProps) {
    const [tasks, setTasks] = useState(initialTasks)

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ))
    }

    const completedCount = tasks.filter(t => t.completed).length
    const totalCount = tasks.length
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    return (
        <div className="group relative overflow-hidden rounded-[16px] border border-white/[0.08] bg-gradient-to-br from-[#1a1410]/90 via-[#1f1612]/80 to-[#1a1410]/90 backdrop-blur-xl shadow-xl shadow-black/20 transition-all duration-500 hover:border-white/[0.12] hover:shadow-2xl">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.05),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-lg font-semibold text-white tracking-tight">Tâches du jour</h3>
                        <p className="text-xs text-white/40 mt-0.5">Avance dans ta checklist opérationnelle</p>
                    </div>

                    {/* Progress indicator */}
                    <div className="relative">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                            <div className="relative h-5 w-5">
                                <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
                                    <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                                    <circle
                                        cx="10" cy="10" r="8"
                                        fill="none"
                                        stroke="url(#progressGradient)"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeDasharray={`${progressPercentage * 0.5} 50`}
                                        className="transition-all duration-500"
                                    />
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#22c55e" />
                                            <stop offset="100%" stopColor="#10b981" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-green-400">{completedCount}/{totalCount}</span>
                        </div>
                    </div>
                </div>

                {/* Tasks list */}
                <div className="space-y-2">
                    {tasks.map((task, index) => (
                        <div
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 cursor-pointer group/task ${task.completed
                                    ? 'bg-green-500/[0.05] border-green-500/20 hover:border-green-500/30'
                                    : task.urgent
                                        ? 'bg-red-500/[0.03] border-red-500/20 hover:border-red-500/40 hover:bg-red-500/[0.06]'
                                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
                                }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Priority indicator bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all ${task.completed ? 'bg-green-500' :
                                    task.urgent ? 'bg-gradient-to-b from-red-500 to-orange-500' :
                                        'bg-white/10 group-hover/task:bg-orange-500/50'
                                }`} />

                            <div className="flex items-start gap-3 pl-2">
                                {/* Checkbox with animation */}
                                <div className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${task.completed
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-500 scale-100'
                                        : 'border-white/30 group-hover/task:border-orange-400 group-hover/task:scale-105'
                                    }`}>
                                    {task.completed ? (
                                        <Check className="h-3 w-3 text-white animate-scale-check" />
                                    ) : (
                                        <Circle className="h-2 w-2 text-white/20 group-hover/task:text-orange-400 transition-colors" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium transition-all ${task.completed
                                            ? 'text-white/40 line-through'
                                            : 'text-white group-hover/task:text-orange-300'
                                        }`}>
                                        {task.title}
                                    </p>

                                    {/* Time and badges */}
                                    <div className="flex items-center gap-2 mt-1.5">
                                        {task.time && (
                                            <div className={`flex items-center gap-1 text-xs ${task.completed ? 'text-white/30' : 'text-white/50'}`}>
                                                <Clock className="h-3 w-3" />
                                                <span>{task.time}</span>
                                            </div>
                                        )}
                                        {task.urgent && !task.completed && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                                                <AlertCircle className="h-2.5 w-2.5" />
                                                Urgent
                                            </span>
                                        )}
                                        {task.completed && (
                                            <span className="text-[10px] text-green-400/70 font-medium">Terminé ✓</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Link to all tasks */}
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    <button className="w-full text-center text-xs text-white/40 hover:text-orange-400 transition-colors font-medium">
                        Voir toutes les tâches →
                    </button>
                </div>
            </div>
        </div>
    )
}
