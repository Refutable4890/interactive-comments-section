'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import dataFromJSON from '@/data.json'
import { DataFromJSON, User } from '../CommentSection'

interface Comment {
  id: string
  content: string
  createdAt: string
  score: number
  user: User
  replyingTo?: string
}

interface CreateComment {
  (commentContent: Comment['content'], replyingTo?: Comment['replyingTo']): void
}

interface UpdateComment {
  (comment: {
    commentID: Comment['id']
    commentContent?: Comment['content']
    commentScore?: Comment['score']
  }): void
}

interface DeleteComment {
  (commentID: Comment['id']): void
}

interface GetReplies {
  (commentID: Comment['id']): Array<Comment>
}

interface DataContextType {
  currentUser: User
  comments: Array<Comment>
  createComment: CreateComment
  updateComment: UpdateComment
  deleteComment: DeleteComment
  getReplies: GetReplies
}

const DataContext = createContext<DataContextType>({
  currentUser: { image: { png: '', webp: '' }, username: '' },
  comments: [],
  createComment: () => {},
  updateComment: () => {},
  deleteComment: () => {},
  getReplies: () => [],
})

const DATA_KEY_IN_LOCAL_STORAGE = 'data'

function DataContextProvider(props: { children: React.ReactNode }) {
  const [data, setData] = useState<DataFromJSON>({
    currentUser: {
      username: '',
      image: { png: '', webp: '' },
    },
    comments: [],
  })

  useEffect(() => {
    const localStorageData = window.localStorage.getItem(
      DATA_KEY_IN_LOCAL_STORAGE,
    )
    let _dataFromJSON: DataFromJSON
    if (localStorageData) _dataFromJSON = JSON.parse(localStorageData)
    else _dataFromJSON = dataFromJSON

    setData(_dataFromJSON)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(DATA_KEY_IN_LOCAL_STORAGE, JSON.stringify(data))
  }, [data])

  const createComment: CreateComment = (commentContent, replyingTo) => {
    setData((data) => {
      const comment: Comment = {
        id: window.crypto.randomUUID(),
        content: commentContent,
        createdAt: new Date().toJSON(),
        score: 0,
        user: data.currentUser,
        replyingTo,
      }
      const newData = { ...data }
      newData.comments.push(comment)
      return newData
    })
  }

  const updateComment: UpdateComment = ({
    commentID,
    commentContent,
    commentScore,
  }) => {
    setData((data) => {
      const newData = { ...data }
      newData.comments = newData.comments.map((comment) => {
        if (comment.id === commentID) {
          if (commentContent !== undefined) comment.content = commentContent
          if (commentScore !== undefined) comment.score = commentScore
        }
        return comment
      })
      return newData
    })
  }

  const deleteComment: DeleteComment = (commentID) => {
    // Delete all the replies
    data.comments
      .filter((comment) => comment.replyingTo === commentID)
      .forEach((comment) => {
        deleteComment(comment.id)
      })

    setData((data) => {
      const newData = { ...data }
      newData.comments = newData.comments.filter(
        (comment) => comment.id !== commentID,
      )
      return newData
    })
  }

  const getReplies: GetReplies = (commentID) =>
    data.comments
      .filter((comment) => comment.replyingTo === commentID)
      .toSorted((a, b) => {
        if (new Date(a.createdAt) < new Date(b.createdAt)) {
          return -1
        } else if (new Date(a.createdAt) === new Date(b.createdAt)) {
          return 0
        } else {
          return 1
        }
      })

  const contextProviderValue: DataContextType = {
    currentUser: data.currentUser,
    comments: data.comments,
    createComment,
    updateComment,
    deleteComment,
    getReplies,
  }

  return (
    <DataContext.Provider value={contextProviderValue}>
      {props.children}
    </DataContext.Provider>
  )
}

const useDataContext = () => useContext(DataContext)

export { DataContextProvider, useDataContext }
export type { Comment, CreateComment, UpdateComment, DeleteComment }
