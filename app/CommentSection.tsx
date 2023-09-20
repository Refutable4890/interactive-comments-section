'use client'

import CommentOrReply from './Comment'
import CommentInput from './CommentInput'
import { useDataContext } from './contexts/DataContext'
import type { Comment } from './contexts/DataContext'
import CommentList from './CommentsList'

export interface DataFromJSON {
  currentUser: User
  comments: Array<Comment>
}

export interface User {
  image: {
    png: string
    webp: string
  }
  username: string
}

export default function CommentSection() {
  const { comments } = useDataContext()
  if (typeof window === undefined) return <></>

  const commentComponents: Array<ReturnType<typeof CommentOrReply>> = []

  const rootComments = [
    ...comments.filter((comment) => comment.replyingTo === undefined),
  ]
  rootComments
    .sort((a, b) => b.score - a.score)
    .forEach((comment) => {
      commentComponents.push(
        <CommentOrReply key={comment.id} commentID={comment.id} />,
      )
    })

  return (
    <CommentList className="mx-auto max-w-screen-md">
      <CommentList>{commentComponents}</CommentList>
      <CommentInput mode="createComment" placeholder="Add a comment…" />
    </CommentList>
  )
}
