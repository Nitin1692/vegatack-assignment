"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CommentList from "@/components/CommentList";

interface Props {
  post: any;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PostCard({ post, onEdit, onDelete }: Props) {
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [liked, setLiked] = useState(post.liked || false); // backend should return whether user liked this post

  const toggleLike = async () => {
    try {
      if (liked) {
        // unlike
        await fetch(`/api/posts/${post.id}/like`, { method: "DELETE" });
        setLiked(false);
      } else {
        // like
        await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
        setLiked(true);
      }
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  return (
    <div className="border rounded p-4 mb-4">
      <p>{post.content}</p>
      {post.image_url && (
        <img src={post.image_url} className="mt-2 rounded" alt="Post image" />
      )}
      <div className="flex justify-between mt-2 items-center">
        <div className="flex items-center space-x-4">
          <Button
            size="sm"
            variant={liked ? "default" : "outline"}
            onClick={toggleLike}
          >
            {liked ? "Unlike" : "Like"}
          </Button>
          <span className="text-sm text-gray-500">Likes: {likeCount}</span>
          <span className="text-sm text-gray-500">
            Comments: {post.comment_count}
          </span>
        </div>
        <div className="space-x-2">
          {onEdit && (
            <Button size="sm" variant="outline" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>
      <CommentList postId={post.id} />
    </div>
  );
}
