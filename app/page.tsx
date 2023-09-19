import CommentSection from './CommentSection'
import { DataContextProvider } from './contexts/DataContext'

export default function Home() {
  return (
    <main className="m-5">
      <DataContextProvider>
        <CommentSection />
      </DataContextProvider>
    </main>
  )
}
