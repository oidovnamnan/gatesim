"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Search, Mail, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Shield } from "lucide-react";
import { EnrichedUser } from "./user-sheet";
import { formatPrice } from "@/lib/utils";

interface UsersTableProps {
    users: EnrichedUser[];
    loading: boolean;
    onUserClick: (user: EnrichedUser) => void;
}

export function UsersTable({ users, loading, onUserClick }: UsersTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    // Filter Logic
    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = filteredUsers.slice(startIndex, startIndex + pageSize);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Reset page on search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    }

    // Relative Time Formatter (Simple)
    function formatRelativeTime(timestamp?: number): string {
        if (!timestamp) return "-";
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return "Today";
        if (days === 1) return "Yesterday";
        if (days < 30) return `${days} days ago`;
        return date.toLocaleDateString();
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div className="text-sm text-slate-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredUsers.length)} of {filteredUsers.length} users
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/5 shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-[#11141d]">
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-center">Orders</TableHead>
                            <TableHead className="text-right">Total Spent</TableHead>
                            <TableHead className="text-right">Joined</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell><div className="h-10 w-32 bg-slate-200 dark:bg-white/10 rounded"></div></TableCell>
                                    <TableCell><div className="h-5 w-48 bg-slate-200 dark:bg-white/10 rounded"></div></TableCell>
                                    <TableCell><div className="h-5 w-8 mx-auto bg-slate-200 dark:bg-white/10 rounded"></div></TableCell>
                                    <TableCell><div className="h-5 w-24 ml-auto bg-slate-200 dark:bg-white/10 rounded"></div></TableCell>
                                    <TableCell><div className="h-5 w-24 ml-auto bg-slate-200 dark:bg-white/10 rounded"></div></TableCell>
                                </TableRow>
                            ))
                        ) : currentData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                    No users found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentData.map(user => (
                                <TableRow
                                    key={user.id}
                                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5"
                                    onClick={() => onUserClick(user)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10">
                                                {user.photoURL ? (
                                                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-4 h-4 text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                                    {user.displayName || "No Name"}
                                                    {user.role === 'super_admin' && <Badge variant="secondary" className="text-[10px] h-4 px-1"><Shield className="w-3 h-3 mr-1 text-amber-500" />Admin</Badge>}
                                                </div>
                                                {user.phone && <div className="text-xs text-slate-500">{user.phone}</div>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            {user.email}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {user.orderCount > 0 ? (
                                            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-500">
                                                {user.orderCount}
                                            </Badge>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {user.totalSpent > 0 ? (
                                            <span className="text-emerald-500 dark:text-emerald-400">
                                                {formatPrice(user.totalSpent, "MNT")}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right text-slate-500 text-xs">
                                        {formatRelativeTime(user.createdAt)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <span className="text-sm font-medium mx-2">
                        Page {currentPage} of {totalPages}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
