import { formatStat } from "@/lib/utils"
import { getVideosByTag } from "@/services/server/tags"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

interface Props {
    params: Promise<{ tagname: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { tagname } = await params
    return {
        title: `#${tagname}`,
    }
}

export default async function Page({ params }: Props) {
    const { tagname } = await params

    const taggedContent = await getVideosByTag(tagname)
    if (taggedContent.videos.length === 0) return <NoTagFound tagname={tagname} />

    return (
        <section className="p-3 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center justify-center size-20 sm:size-30">
                    <span className="text-muted-foreground text-4xl sm:text-5xl">#</span>
                </div>
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl sm:text-4xl font-semibold">#{tagname}</h1>
                    <span>{formatStat(taggedContent.count)} posts</span>
                </div>
            </div>

            <div className="grid gap-4 p-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                {taggedContent.videos.map((v, k) => (
                    <div
                        key={k}
                        className={`${k === 0 ? "border-2 border-primary/40" : ""} relative aspect-[9/16] bg-muted h-80 md:h-120 rounded-md overflow-hidden`}
                    >
                        <Image
                            src={v.thumbnail}
                            className="flex bg-slate-100/10 h-full w-full object-cover"
                            alt="video thumbnail"
                            width={100}
                            height={100}
                        />

                        <div className="absolute text-white bottom-0 w-full h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-center items-end gap-2 px-4 py-3">
                            <Link
                                href={`/user/${v.userId}`}
                                className="hover:underline cursor-pointer"
                            >
                                @{v.userName}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

function NoTagFound({ tagname }: { tagname: string }) {
    return (
        <section className="flex flex-col gap-2 items-center justify-center mt-10 px-4 text-center">
            <h1 className="text-6xl sm:text-[7rem] text-muted-foreground font-semibold">#</h1>
            <h2 className="text-xl sm:text-2xl">
                Couldn&apos;t find this hashtag{" "}
                <em>
                    <b>#{tagname}</b>
                </em>
            </h2>
            <span className="text-base sm:text-xl max-w-2xl">
                Looking for videos? Try browsing our trending creators, hashtags, and sounds.
            </span>
        </section>
    )
}
