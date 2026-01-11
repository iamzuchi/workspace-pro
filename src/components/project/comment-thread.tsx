"use client";

import { useState, useTransition } from "react";
import { postComment } from "@/actions/activities";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface CommentThreadProps {
    workspaceId: string;
    projectId: string;
    initialComments: any[];
}

export const CommentThread = ({ workspaceId, projectId, initialComments }: CommentThreadProps) => {
    const [content, setContent] = useState("");
    const [comments, setComments] = useState(initialComments);
    const [isPending, startTransition] = useTransition();

    const onSubmit = () => {
        if (!content) return;

        startTransition(() => {
            postComment(workspaceId, projectId, content).then((data) => {
                if (data.success && data.comment) {
                    // Refresh localized comments (or just wait for server refresh)
                    setContent("");
                } else if (data.error) {
                    alert(data.error);
                }
            });
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <Textarea
                    placeholder="Write a comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isPending}
                    className="min-h-[100px]"
                />
            </div>
            <div className="flex justify-end">
                <Button onClick={onSubmit} disabled={isPending}>
                    Post Comment
                </Button>
            </div>

            <div className="space-y-6 mt-8">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user.image} />
                            <AvatarFallback>{comment.user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">{comment.user.name}</span>
                                <span className="text-xs text-zinc-500">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-600">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
