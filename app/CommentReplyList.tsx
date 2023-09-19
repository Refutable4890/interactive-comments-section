export default function CommentReplyList(props: { children: React.ReactNode }) {
  return (
    <>
      <section className="flex">
        <div className="mr-4 border border-light-gray"></div>
        {props.children}
      </section>
    </>
  )
}
