"use client"
import React, { useState, useEffect } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import Link from "next/link";
import { SideBarOptions } from "@/services/Constants";
import { usePathname } from "next/navigation"
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';

export function AppSidebar() {

    const path = usePathname();

    const { user } = useUser();
    const [userCredits, setUserCredits] = useState(0);

    // fetch credits
    useEffect(() => {
        const fetchCredits = async () => {
            if (!user?.email) return;
            const { data, error } = await supabase
                .from('Users')
                .select('credits')
                .eq('email', user.email)
                .single();
            if (data) setUserCredits(data.credits || 0);
        };
        fetchCredits();
    }, [user]);

    const displayMax = Math.max(userCredits, 100);

    return (
        <Sidebar className="border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <SidebarHeader className="flex items-center mt-6 flex-col gap-4">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <img
                        src={'/veritas_logo.png'}
                        alt='VeritasAI Logo'
                        width={200}
                        height={100}
                        className='relative w-[140px] h-auto rounded-xl border-4 border-white dark:border-gray-800 shadow-lg transition-transform duration-300 group-hover:scale-105'
                    />
                </div>

                <Button className="w-[90%] mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Interview
                </Button>
            </SidebarHeader>

            <SidebarContent className="mt-4 px-2">
                <SidebarGroup>
                    <SidebarMenu className="space-y-1">
                        {SideBarOptions.map((option, index) => (
                            <SidebarMenuItem key={index}>
                                <SidebarMenuButton asChild className={`p-3 rounded-xl transition-all duration-200 ${path == option.path ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'}`}>
                                    <Link href={option.path}>
                                        <div className="flex items-center gap-3">
                                            <option.icon className={`h-5 w-5 ${path == option.path ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-100'}`} />
                                            <span className="text-sm">{option.name}</span>
                                        </div>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <div className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{userCredits}</span>
                    </div>
                    <Progress value={displayMax ? (userCredits / displayMax) * 100 : 0} className="h-2 bg-gray-100 dark:bg-gray-700" indicatorClassName="bg-gradient-to-r from-blue-500 to-violet-500" />
                    <p className="text-xs text-gray-400 mt-2 text-center">Upgrade for more</p>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
