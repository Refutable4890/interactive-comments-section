'use client'

import Image from 'next/image'
import { FormEvent, useEffect, useRef } from 'react'
import type { Comment } from './contexts/DataContext'
import { useDataContext } from './contexts/DataContext'

import { placeCursorAtTheEnd } from './utils'

interface CommonProps {
  placeholder?: string
  autoFocus?: boolean
  afterSubmit?: Function
  handleCancel?: Function
  confirmBtnText?: string
}

type modifyCommentProps =
  | {
      mode: 'updateCommentContent'
      commentID: Comment['id']
      commentContent: Comment['content']
    }
  | {
      mode: 'createComment'
      replyingTo?: string
    }

type Props = CommonProps & modifyCommentProps

function CommentInput(props: Props) {
  const { currentUser, createComment, updateComment } = useDataContext()

  const textarea = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (props.autoFocus && textarea.current)
      placeCursorAtTheEnd(textarea.current)
  }, [props.autoFocus])

  function hanldeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = event.target as HTMLFormElement
    if (props.mode === 'createComment') {
      createComment(target.content.value, props.replyingTo)
      target.content.value = ''
    } else {
      updateComment({
        commentID: props.commentID,
        commentContent: target.content.value,
      })
    }

    if (props.afterSubmit) props.afterSubmit()
  }

  return (
    <form
      className="grid grid-cols-2 gap-y-4  rounded-lg bg-white p-4 sm:grid-cols-[max-content_1fr_min-content] sm:gap-x-4"
      onSubmit={hanldeSubmit}
    >
      <textarea
        ref={textarea}
        className="col-span-full rounded-lg border border-light-gray px-6 py-3 text-dark-blue hover:border-dark-blue sm:col-start-2 sm:col-end-3 sm:row-start-1"
        name="content"
        placeholder={props.placeholder}
        required
        autoFocus={props.autoFocus}
        defaultValue={
          props.mode === 'updateCommentContent' ? props.commentContent : ''
        }
      />

      <Image
        className="justify-self-start sm:col-start-1 sm:self-start"
        src={currentUser.image.png}
        width={50}
        height={50}
        alt={'Your avatar'}
      />
      {/* Buttons */}
      <div className="gap-2 justify-self-end sm:col-start-3 sm:self-start">
        {props.handleCancel && (
          <button
            type="button"
            onClick={() => {
              if (props.handleCancel) props.handleCancel()
            }}
          >
            Cancel
          </button>
        )}
        <button className="self-end rounded-lg bg-moderate-blue px-6 py-3 font-bold uppercase text-white hover:bg-light-grayish-blue">
          {props.confirmBtnText || 'send'}
        </button>
      </div>
    </form>
  )
}

export default CommentInput
