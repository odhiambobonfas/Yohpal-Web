import {
    LucideBell,
    LucideCheck,
    LucideCheckCircle2,
    LucideClock,
    LucideCopyright,
    LucideMail,
    LucideMapPin,
    LucidePhone,
} from "lucide-react"
import Image from "next/image"

import { withCache } from "@/lib/cache"
import { getCompanyGeneralSettings } from "@/services/server/org/settings"
import Link from "next/link"
import {
    founderDetails,
    heroCardData,
    howWeWorkList,
    leaderShip,
    ourServicesList,
    storeLinks,
    whoWeAreList,
} from "./_lib/data"

export default async function Page() {
    const settings = await withCache(getCompanyGeneralSettings, "generalSettings")

    const contactInfo = [
        { icon: LucideMapPin, title: "Our Address", details: settings?.companyAddress },
        { icon: LucidePhone, title: "Contact Number", details: settings?.companyPhone },
        { icon: LucideMail, title: "Contact Email", details: settings?.companyEmail },
        { icon: LucideClock, title: "Opening Hours", details: "Open 24/7" },
    ]
    return (
        <>
            <section className="dark:bg-primary/20 bg-primary/5 py-20 p-2 flex flex-col gap-4 items-center">
                <div className="w-full p-2 md:p-1 md:w-5/6 flex flex-col gap-4">
                    {/* Hero section */}
                    <div className="mt-10 w-fit border border-secondary-foreground/40 inline-flex rounded-full py-2 px-3  items-center gap-2">
                        <LucideBell className="p-1 size-6 text-scondary-foreground bg-primary/20 rounded-full" />
                        <span className="font-[600] text-secondary-foreground text-sm">
                            One Platform. Endless Possibilities.
                        </span>
                    </div>

                    <div className="flex md:flex-row flex-col mt-3 justify-between md:max-h-80">
                        <div className="md:w-3/6 w-full flex flex-col gap-4 p-2">
                            <h1 className="text-4xl text-secondary-foreground font-semibold">
                                Connect. Hustle. Shop. Earn — All with YohPal
                            </h1>
                            <p className="text-balance text-lg text-secondary-foreground/80">
                                YohPal is a next-generation digital ecosystem combining social
                                media, services, e-commerce, messaging, and digital finance. Whether
                                you&apos;re a creator, hustler, shopper, or entrepreneur — YohPal is
                                your all-in-one platform to grow, connect, and thrive.
                            </p>
                            <Link
                                href={"/"}
                                className="bg-primary rounded-lg w-fit cursor-pointer py-3 text-lg px-4 text-primary-foreground hover:-translate-y-0.5 transition-all ease-in-out duration-200"
                            >
                                Explore the platform
                            </Link>
                            <StoreButtons />
                        </div>

                        <div className="md:w-3/6 w-full items-center justify-center p-2">
                            <Image
                                src="/org/images/illustration-16.webp"
                                loading="lazy"
                                width={800}
                                height={800}
                                alt="illustration"
                                className="h-full w-full object-contain hover:-translate-y-1.5 transition-transform ease-in-out duration-200"
                            />
                        </div>
                    </div>
                    <div className="w-full mt-[50px] flex gap-4 md:flex-nowrap flex-wrap items-stretch justify-center">
                        {heroCardData.map((d, idx) => (
                            <div
                                key={idx}
                                className="w-11/12 md:w-1/3 border border-primary/20 flex flex-col items-start gap-2
                                px-3 py-4 rounded-lg justify-start dark:bg-primary/20 bg-primary-foreground
                                hover:-translate-y-1.5 transition-transform ease-in-out duration-200
                                hover:shadow-lg drop-shadow-primary/40 cursor-pointer"
                            >
                                <div className="w-fit">
                                    <d.icon className="bg-primary/10 text-accent-foreground/80 p-2 size-12 rounded-full" />
                                </div>
                                <div className="flex flex-col flex-1 gap-1 w-full">
                                    <h2 className="text-xl text-secondary-foreground font-semibold">
                                        {d.title}
                                    </h2>
                                    <p className="text-balance text-secondary-foreground">
                                        {d.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* who we are section */}
            <section className="bg-primary-foreground/5 p-5 min-h-[80svh] py-20 md:p-2 flex flex-col gap-4 items-center justify-center">
                <div className="md:w-5/6 flex md:flex-nowrap flex-wrap flex-row gap-4">
                    <div className="flex flex-col w-full md:w-3/6 px-2 gap-4">
                        <span className="uppercase text-secondary-foreground/90">who we are</span>
                        <h2 className="text-3xl font-bold text-pretty">
                            Building Africa’s Most Powerful Digital Ecosystem
                        </h2>
                        <p className="italic  text-secondary-foreground/90 text-lg">
                            At YohPal, we believe in bridging gaps through technology — empowering
                            creators, service providers, businesses, and communities to connect,
                            grow, and thrive from a single digital hub.
                        </p>

                        <div className="leading-0 my-3">
                            {whoWeAreList.map((item, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex gap-2 text-lg items-start justify-start"
                                >
                                    <LucideCheckCircle2 className="text-primary font-black md:size-8" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-5/12 columns-2 gap-2 mt-5 md:m-0">
                        {Array(4)
                            .fill(0)
                            .map((__val, idx) => (
                                <Image
                                    key={idx}
                                    src={`/org/images/img${idx + 1}.jpg`}
                                    width={500}
                                    height={500}
                                    alt="display img"
                                    loading="lazy"
                                    className="mb-2 w-full break-inside-avoid rounded-lg overflow-hidden"
                                />
                            ))}
                    </div>
                </div>
            </section>

            {/* Founder section */}
            <section className="bg-secondary min-h-[80svh] p-5 md:p-2 flex md:flex-nowrap flex-wrap gap-4 items-center justify-center">
                <div className="w-full md:w-2/6 flex justify-center relative">
                    <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl bg-primary/20 blur-3xl"></div>

                    <Image
                        src={founderDetails.image}
                        loading="lazy"
                        width={500}
                        height={500}
                        alt="founder's image"
                        className="relative rounded-xl object-contain md:max-h-[60svh] w-auto z-10 shadow-lg"
                    />
                </div>
                <div className="w-full md:w-3/6 flex flex-col gap-4">
                    <h2 className="text-4xl font-bold capitalize">Meet Our Founder</h2>
                    <p className="text-lg text-foreground text-balance my-2">
                        {founderDetails.description}
                    </p>
                    {founderDetails.facts.map((fact, idx) => (
                        <span key={idx} className="inline-flex gap-2 items-center">
                            <LucideCheck className="bg-primary text-primary-foreground rounded-full p-1 size-5 font-bold" />
                            {fact}
                        </span>
                    ))}
                </div>
            </section>

            {/* How we work section */}
            <section className="py-20 bg-slate-[70svh] min-h-screen p-5 md:p-2 flex flex-col items-center justify-center text-pretty">
                <h2 className="text-4xl capitalize font-semibold">How we Work</h2>
                <div className="w-2/6 md:w-1/6 h-1 bg-primary rounded-full my-2"></div>

                <p className="text-center my-5 w-5/6 md:w-3/6 text-pretty text-lg">
                    At YohPal, we build purpose-driven solutions that solve everyday challenges by
                    combining user insights, innovative technology, and community-centered design.
                </p>
                {howWeWorkList.map((item, idx) => (
                    <div
                        key={idx}
                        className="group md:w-3/6 w-full flex md:flex-nowrap flex-wrap justify-center items-center bg-gradient-to-r from-primary/10 my-3
                        to-primary-foreground/10 border-2 border-primary/40 rounded-xl p-5 gap-4
                        shadow-primary ease-in-out duration-300 hover:-translate-y-1.5 cursor-pointer
                        "
                    >
                        <item.icon
                            className="w-fit size-14 bg-primary text-slate-100/90 rounded-xl p-3 shadow-primary/40 shadow-lg
                            transform transition-transform duration-300 group-hover:rotate-12
                            "
                        />
                        <div className="flex flex-col w-full text-start px-2">
                            <h3 className="text-2xl font-semibold capitalize">{item.title}</h3>
                            <p className="my-2 text-pretty">{item.description}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Our services section */}
            <section className="py-20 bg-secondary min-h-screen p-5 md:p-2 flex flex-col items-center justify-center  text-pretty">
                <h2 className="text-4xl capitalize font-semibold">Our Services</h2>
                <div className="w-2/6 md:w-1/6 h-1 bg-primary rounded-full my-2"></div>

                <p className="text-center my-5 w-5/6 md:w-2/6 text-pretty text-lg">
                    At YohPal, we connect communities, businesses, and creators through powerful
                    digital solutions tailored for real-life needs.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full md:w-4/6">
                    {ourServicesList.map((item, idx) => (
                        <div
                            key={idx}
                            className="pl-5 group flex flex-col justify-start bg-primary/5
        hover:border-r-2 border-primary/40 rounded-xl p-5 gap-4
        hover:shadow-xl shadow-secondary ease-in-out duration-300 hover:-translate-y-1.5 cursor-pointer"
                        >
                            <item.icon
                                className="w-fit size-14 bg-primary/10 text-primary/90 rounded-xl p-3
        transform transition-transform duration-300 group-hover:-rotate-12 group-hover:bg-primary group-hover:text-primary-foreground"
                            />
                            <div className="flex flex-col flex-1 w-full text-start px-2">
                                <h3 className="text-2xl font-semibold text-foreground capitalize">
                                    {item.title}
                                </h3>
                                <p className="my-2 text-foreground text-pretty">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Our ecosystem */}
            <section className="p-5 min-h-screen md:p-2 flex flex-col gap-4 items-center justify-center">
                <div className="md:w-5/6 flex md:flex-nowrap flex-wrap flex-row gap-4">
                    <div className="flex flex-col w-full md:w-3/6 px-2 gap-4">
                        <span className="font-semibold uppercase text-primary">
                            Our Innovative Ecosystem
                        </span>
                        <h2 className="text-3xl font-bold text-pretty">
                            Powering Digital Life, Work & Commerce — Seamlessly
                        </h2>
                        <p className="text-foreground text-lg text-pretty">
                            YohPal is more than just an app — it&apos;s a powerful ecosystem of
                            platforms designed to make life easier. From content creation and job
                            hunting to online shopping, secure chatting, and managing earnings — we
                            provide the tools for people to connect, grow, and earn in the digital
                            age.
                        </p>
                        <p className="text-foreground text-lg text-pretty">
                            Our ecosystem is made up of five interconnected platforms, each designed
                            with real-life needs in mind. From watching and sharing videos on YohPal
                            Social, to finding work or hiring skilled professionals through YohPal
                            Hustle, to buying and selling through YohPal Market — users are
                            supported at every turn. YohPal Chat brings secure, real-time messaging
                            into the mix, while YohPal Wallet ensures users can manage their
                            finances, promote their services, and earn through referrals and
                            affiliate programs with ease.
                        </p>
                    </div>
                    <div className="w-full md:w-6/12 flex flex-col gap-4 mt-5 md:m-0 ">
                        {/* Dont include the custom solutions item */}
                        {ourServicesList.slice(0, -1).map((service, idx) => (
                            <div
                                key={idx}
                                className="border-b-2 cursor-pointer w-full flex group gap-5 pb-3"
                            >
                                <service.icon
                                    className="flex-shrink-0 group-hover:bg-primary/80 duration-300 group-hover:text-foreground transition-all
                  ease-in-out bg-primary/10 rounded-full p-3 size-14 text-primary"
                                />
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold group-hover:text-primary duration-300">
                                        {service.title}
                                    </h3>
                                    <p className="text-foreground text-balance">
                                        {service.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Leadership section */}
            <section className="py-20 bg-secondary min-h-[60svh] p-5 md:p-2 flex flex-col items-center justify-center text-pretty">
                <h2 className="text-4xl capitalize font-semibold">Our leadership team</h2>
                <div className="w-2/6 md:w-1/6 h-1 bg-primary rounded-full my-2"></div>

                <div className="grid my-5 grid-cols-1 lg:grid-cols-4 gap-6 w-11/12 md:w-full max-w-6xl justify-center">
                    {leaderShip.map((leader, idx) => (
                        <div
                            key={idx}
                            className="hover:-translate-y-2 transition-all hover:shadow-primary-foreground ease-in-out duration-300 flex flex-col rounded-xl shadow-lg bg-secondary-foreground/10 overflow-hidden h-full"
                        >
                            <div className="aspect-square w-full overflow-hidden">
                                <Image
                                    src={leader.image}
                                    alt={`${leader.name}'s image`}
                                    loading="lazy"
                                    width={500}
                                    height={500}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex mb-3  flex-col flex-1 p-4 items-center justify-center">
                                <span className="font-bold my-2 text-2xl text-center">
                                    {leader.name}
                                </span>
                                <span className="bg-primary/30 text-sm font-semibold rounded-full px-4 py-1 text-primary/90 text-center">
                                    {leader.role}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact section */}
            <section
                id="contact"
                className="py-20 min-h-[60svh] p-5 md:p-2 flex flex-col items-center justify-center text-pretty"
            >
                <h2 className="text-4xl capitalize font-semibold">Contact</h2>
                <div className="w-2/6 md:w-1/6 h-1 bg-primary rounded-full my-2"></div>

                <div className="grid my-5 grid-cols-1 lg:grid-cols-4 gap-6 w-11/12 md:w-full max-w-6xl justify-center">
                    {contactInfo.map((contact, idx) => (
                        <div
                            key={idx}
                            className="group flex flex-col justify-center items-center my-3
                            border-2 border-primary/40 rounded-xl p-5 gap-1
                            hover:shadow-xl shadow-secondary ease-in-out duration-300 hover:-translate-y-1.5 cursor-pointer"
                        >
                            <contact.icon className="w-fit size-14 mb-3 bg-primary/10 text-primary/90 rounded-2xl p-3" />
                            <h3 className="text-2xl font-semibold capitalize">{contact.title}</h3>
                            <p className="my-2 text-foreground text-pretty">{contact.details}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* footer section */}
            <footer className="flex flex-col dark:bg-secondary items-center justify-center">
                <div className="border-t-2 w-fit flex flex-col items-center p-3 capitalize">
                    <span className="inline-flex gap-2 items-center text-xs">
                        <LucideCopyright className="size-3 text-muted-foreground" />
                        Copyright {new Date().getFullYear()}
                        <b>Yohpal International</b> All rights reserved
                    </span>
                </div>
            </footer>
        </>
    )
}

function StoreButtons() {
    return (
        <div className="grid grid-cols-2 gap-4 md:gap-6 w-fit items-center justify-start">
            <Link href={storeLinks.appStore} target="_blank" className="h-14 flex items-start">
                <Image
                    src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us"
                    alt="Download Yohpal on the App Store"
                    height={48}
                    width={144}
                    loading="eager"
                    className="h-full w-auto p-0.5"
                    unoptimized
                />
            </Link>
            <Link href={storeLinks.playStore} target="_blank" className="h-14 flex items-center">
                <Image
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                    alt="Get it on Google Play"
                    height={48}
                    width={162}
                    className="h-full w-auto transform scale-[1.3] md:scale-125"
                />
            </Link>
        </div>
    )
}
