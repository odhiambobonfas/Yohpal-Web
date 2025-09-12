import Link from "next/link"

export default function Page() {
  return (
    <div className="grid h-screen place-items-center bg-white-100 px-6  lg:px-8">
      <div className="text-center">
        <img
          src="/404-error.svg"
          width={500}
          height={200}
          loading="lazy"
          alt="404 page not found"
        />
        <p className="text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">
        Seems we couldn&apos;t find the page your looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="bg-primary rounded-lg px-4 py-3 text-primary-foreground"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}
