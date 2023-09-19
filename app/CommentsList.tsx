export default function CommentList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <>
      <section className={'flex flex-col gap-5 ' + className}>
        {children}
      </section>
    </>
  )
}
