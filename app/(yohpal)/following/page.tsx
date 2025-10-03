import NotLoggedIn from "@/components/custom/app/video/following/NotLoggedIn"

export default async function Page() {
    // const cookieStore = await cookies()
    // const userId = cookieStore.get(COOKIES.User)?.value

    return <NotLoggedIn />

    // return (
    //     <div
    //         className="grid gap-4 p-2"
    //         style={{
    //             gridTemplateColumns:
    //                 "repeat(auto-fit, minmax(max(calc(100% / 6 - 1rem), 200px), 1fr))",
    //         }}
    //     >
    //         {Array(14)
    //             .fill(0)
    //             .map((_, i) => (
    //                 <VideoPlace key={i} />
    //             ))}
    //     </div>
    // )
}

// function VideoPlace() {
//     return (
//         <div className="h-70 w-full bg-secondary/40 shadow-md rounded-lg flex flex-col overflow-hidden">
//             <div className="flex bg-blue-400 h-full"></div>
//             <div className="inline-flex h-20 items-center gap-2 p-2">
//                 <div className="bg-pink-100 h-5 flex-1"></div>
//             </div>
//         </div>
//     )
// }
