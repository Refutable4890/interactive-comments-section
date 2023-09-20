'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Comment, useDataContext } from './contexts/DataContext'
import CommentList from './CommentsList'
import CommentInput from './CommentInput'
import IconReply from '@/public/icons/icon-reply.svg'
import IconDelete from '@/public/icons/icon-delete.svg'
import IconEdit from '@/public/icons/icon-edit.svg'
import IconPlus from '@/public/icons/icon-plus.svg'
import IconMinus from '@/public/icons/icon-minus.svg'
import CommentReplyList from './CommentReplyList'
import { Dialog } from '@headlessui/react'
import { placeCursorAtTheEnd } from './utils'

interface ScoreProps {
  className?: string
  layout?: 'column' | 'row'
  plusScore: Function
  minusScore: Function
  score: Comment['score']
}

function Score({ className, plusScore, minusScore, score }: ScoreProps) {
  return (
    <section
      className={`flex flex-shrink-0 items-center rounded-xl bg-very-light-gray sm:flex-col
       ${className}`}
    >
      <button
        className="aspect-square  px-3 py-2 text-grayish-blue hover:text-moderate-blue"
        onClick={() => {
          plusScore()
        }}
      >
        <IconPlus />
      </button>
      <span className="p-3 py-2 font-bold text-moderate-blue">{score}</span>
      <button
        className="aspect-square  p-3 py-2 text-grayish-blue hover:text-moderate-blue"
        onClick={() => {
          minusScore()
        }}
      >
        <IconMinus />
      </button>
    </section>
  )
}

interface CommentProps {
  commentID: Comment['id']
}

function Comment({ commentID }: CommentProps): React.ReactNode {
  const { currentUser, comments, deleteComment, getReplies, updateComment } =
    useDataContext()

  const [doShowReply, setDoShowReply] = useState(false)
  const [doShowEdit, setDoShowEdit] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const updateContentFormTextarea = useRef<HTMLTextAreaElement>(null)

  function handleEdit() {
    setDoShowEdit(true)
  }

  useEffect(() => {
    if (doShowEdit && updateContentFormTextarea.current)
      placeCursorAtTheEnd(updateContentFormTextarea.current)
  }, [doShowEdit])

  const comment = comments.find((comment) => comment.id === commentID)
  if (!comment) return <></>

  const replies: Array<ReturnType<typeof Comment>> = getReplies(commentID).map(
    (comment) => <Comment key={comment.id} commentID={comment.id} />,
  )

  return (
    <>
      <div className="grid grid-cols-[max-content_1fr] gap-x-2 gap-y-3 rounded-lg bg-white p-4 sm:grid-cols-[min-content_minmax(min-content,1fr)_minmax(min-content,max-content)] sm:gap-x-4">
        <div className="col-span-full flex flex-wrap items-center gap-4 sm:col-start-2 sm:col-end-3 sm:row-start-1">
          <Image
            className="shrink-0"
            src={comment.user.image.png}
            alt={'Avatar of ' + comment.user.username}
            width={50}
            height={50}
          />
          <p>
            <span className="font-bold">{comment.user.username}</span>
            {currentUser.username === comment.user.username && (
              <span className="ml-2 rounded-sm bg-moderate-blue px-2 align-middle text-white">
                you
              </span>
            )}
          </p>
          <p className="grow basis-[min-content] text-grayish-blue">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>

        {!doShowEdit && (
          <p className="col-span-full  text-grayish-blue sm:col-start-2">
            {comment.content}
          </p>
        )}

        {doShowEdit && (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              updateComment({
                commentContent: (event.target as HTMLFormElement).content.value,
                commentID,
              })
              setDoShowEdit(false)
            }}
            className="col-span-full sm:col-start-2"
            id="updateContent"
          >
            <textarea
              required
              ref={updateContentFormTextarea}
              defaultValue={comment.content}
              name="content"
              className="w-full rounded-lg border border-light-gray px-6 py-3 text-dark-blue hover:border-dark-blue "
            />
          </form>
        )}

        <Score
          className="self-start justify-self-start sm:row-span-full sm:row-end-3  sm:self-start  sm:justify-self-start"
          score={comment.score}
          plusScore={() => {
            updateComment({ commentID, commentScore: comment.score + 1 })
          }}
          minusScore={() => {
            updateComment({ commentID, commentScore: comment.score - 1 })
          }}
        />

        {/* Edit, delete, reply buttons */}
        <section
          className={`col-start-2 flex flex-wrap justify-end gap-3 justify-self-end sm:col-start-3 sm:row-start-1 sm:flex ${
            doShowEdit ? 'hidden' : ''
          }`}
        >
          {currentUser.username === comment.user.username && (
            <>
              <button
                className="flex items-center gap-2 font-bold text-soft-red hover:text-pale-red"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <IconDelete />
                Delete
              </button>
              <button
                className="flex items-center gap-2 font-bold text-moderate-blue hover:text-grayish-blue"
                onClick={handleEdit}
              >
                <IconEdit />
                Edit
              </button>
            </>
          )}
          <button
            className="flex items-center gap-2 font-bold text-moderate-blue hover:text-grayish-blue"
            onClick={() => {
              setDoShowReply((doShow) => !doShow)
            }}
          >
            <IconReply />
            Reply
          </button>
        </section>

        {/* Editor buttons */}
        {doShowEdit && (
          <section className="col-start-2 flex flex-wrap-reverse justify-end gap-3 justify-self-end sm:col-end-4">
            <button
              onClick={() => setDoShowEdit(false)}
              className="rounded-lg px-6 py-3 font-bold uppercase  hover:bg-light-grayish-blue"
              type="button"
            >
              cancel
            </button>
            <button
              className="rounded-lg bg-moderate-blue px-6 py-3 font-bold uppercase text-white hover:bg-light-grayish-blue"
              form="updateContent"
            >
              update
            </button>
          </section>
        )}
      </div>

      {(doShowReply || replies.length > 0) && (
        <CommentReplyList>
          <CommentList className="grow">
            {/* reply */}
            {doShowReply && (
              <CommentInput
                mode="createComment"
                placeholder="Add a reply…"
                autoFocus={true}
                afterSubmit={() => {
                  setDoShowReply(false)
                }}
                replyingTo={commentID}
                confirmBtnText="reply"
              />
            )}

            {replies.length > 0 && replies}
          </CommentList>
        </CommentReplyList>
      )}

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        className="relative z-50"
      >
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          {/* The actual dialog panel  */}
          <Dialog.Panel className="flex w-full max-w-sm flex-col gap-3 rounded-lg bg-white p-6 font-bold">
            <Dialog.Title>Delete comment</Dialog.Title>
            <Dialog.Description className="text-grayish-blue">
              Are you sure you want to delete this comment? This will remove the
              comment and can`&apos;t be undone.
            </Dialog.Description>
            <div className="flex gap-4 self-stretch font-bold text-white">
              <button
                className="grow rounded-lg bg-grayish-blue px-4 py-2"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                NO, CANCEL
              </button>
              <button
                className="grow rounded-lg bg-soft-red px-4 py-2"
                onClick={() => deleteComment(commentID)}
              >
                YES, DELETE
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
}

export default Comment
