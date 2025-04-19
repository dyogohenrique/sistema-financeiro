import { ReactNode } from "react"

export default function AuthLayout( {children}: Readonly<{children: ReactNode}> ) {
  return (
    <main className="h-screen flex justify-center items-center">
        <div className="border border-slate-600 rounded-lg p-10 bg-base-100 shadow-lg">
            {children}
        </div>
    </main>
  )
}
