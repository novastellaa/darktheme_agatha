import { Toaster } from "@/components/ui/toaster"


export default function ChatNewLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        {children}
        <Toaster />
      </div>
    )
  }