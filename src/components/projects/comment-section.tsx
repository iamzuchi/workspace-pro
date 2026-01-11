"use client";

import { useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/actions/comments";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        name: string | null;
        image: string | null;
    };
}

interface CommentSectionProps {
    projectId: string;
    initialComments: Comment[];
    currentUserImage?: string | null;
    currentUserName?: string | null;
}

export function CommentSection({ projectId, initialComments, currentUserImage, currentUserName }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async () => {
        if (!content.trim()) return;

        startTransition(async () => {
            try {
                const newComment = await createComment(projectId, content);
                // Optimistically add the comment or wait for revalidation
                const optimisiticComment: Comment = {
                    id: newComment.id,
                    content: newComment.content,
                    createdAt: newComment.createdAt,
                    user: {
                        name: currentUserName || "User",
                        image: currentUserImage || null
                    }
                };

                setComments([optimisiticComment, ...comments]);
                setContent("");
                router.refresh();
            } catch (error) {
                console.error("Failed to post comment:", error);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <Avatar>
                    <AvatarImage src={currentUserImage || ""} />
                    <AvatarFallback>{currentUserName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea
                        placeholder="Add a comment..."
                        value={content}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={!content.trim() || isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Post Comment
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                        <Avatar>
                            <AvatarImage src={comment.user.image || ""} />
                            <AvatarFallback>{comment.user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">{comment.user.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
