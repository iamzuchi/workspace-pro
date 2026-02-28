"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Send, Trash2 } from "lucide-react";
import { addTaskComment, deleteTaskComment } from "@/actions/task";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskComment {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        name: string | null;
        image: string | null;
    };
    userId: string;
}

interface TaskCommentsProps {
    workspaceId: string;
    projectId: string;
    taskId: string;
    currentUserId: string;
    initialComments: TaskComment[];
}

export const TaskComments = ({ workspaceId, projectId, taskId, currentUserId, initialComments }: TaskCommentsProps) => {
    const [comments, setComments] = useState<TaskComment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        startTransition(() => {
            addTaskComment(workspaceId, projectId, taskId, newComment).then((data) => {
                if (data.error) {
                    toast.error(data.error);
                } else if (data.success && data.comment) {
                    toast.success("Comment added");
                    setComments((prev) => [...prev, data.comment as unknown as TaskComment]);
                    setNewComment("");
                }
            });
        });
    };

    const handleDeleteComment = (commentId: string) => {
        startTransition(() => {
            deleteTaskComment(workspaceId, projectId, commentId).then((data) => {
                if (data.error) {
                    toast.error(data.error);
                } else if (data.success) {
                    toast.success("Comment deleted");
                    setComments((prev) => prev.filter((c) => c.id !== commentId));
                }
            });
        });
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <h3 className="text-sm font-medium">Comments ({comments.length})</h3>

            <ScrollArea className="flex-1 pr-4 max-h-[300px]">
                <div className="space-y-4">
                    {comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 text-sm">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.user.image || ""} />
                                    <AvatarFallback>{comment.user.name?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{comment.user.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        {comment.userId === currentUserId && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDeleteComment(comment.id)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-zinc-700">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            <div className="flex gap-2 items-center mt-auto pt-4 border-t">
                <Input
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment();
                        }
                    }}
                    disabled={isPending}
                />
                <Button size="icon" onClick={handleAddComment} disabled={isPending || !newComment.trim()}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
};
