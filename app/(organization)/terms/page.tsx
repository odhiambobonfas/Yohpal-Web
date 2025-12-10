import { withCache } from "@/lib/cache"
import { getCompanyGeneralSettings } from "@/services/server/org/settings"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Yohpal | Terms and Conditions",
    description: `The Yohpal Terms and Conditions define how you can use our services
    responsibly and securely. This page explains your rights, obligations,
    and the guidelines that govern our platform. Review our terms to stay
    informed and protected while using Yohpal.`,
}

export default async function Page() {
    const settings = await withCache(getCompanyGeneralSettings, "generalSettings")

    return (
        <div className="flex flex-col justify-center w-full items-center p-6 mt-10">
            <h1 className="text-3xl font-semibold mb-2">Terms and Conditions</h1>
            <h1 className="text-2xl font-semibold mb-8 text-center">
                YOHPAL GENERAL TERMS AND CONDITIONS
            </h1>

            <section className="w-full sm:w-4/5 lg:w-2/3 p-4 space-y-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Subject Matter And Scope Of The Terms And Conditions
                    </h2>
                    <p className="text-muted-foreground leading-loose">
                        These Terms and Conditions govern your access to and use of Yohpal, a
                        Kenyan-owned digital platform built to empower individuals, creators,
                        professionals, and freelancers through innovative, inclusive, and secure
                        digital experiences. By registering or using any feature of Yohpal, you
                        acknowledge and accept full compliance with these terms, our policies, and
                        the applicable laws of the Republic of Kenya. Yohpal operates in full
                        alignment with the Government of Kenya&apos;s Vision 2030 and the Bottom-Up
                        Economic Transformation Agenda (BETA), particularly in promoting digital
                        inclusion, job creation, youth empowerment, and ethical online conduct.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        1. Eligibility and Account Registration
                    </h2>
                    <hr className="mb-4" />
                    <p className="text-muted-foreground leading-loose">
                        To access Yohpal services, you must be at least Eighteen (18) years of age
                        and must register with accurate, truthful, and verifiable personal
                        information. Your account must remain in good standing and reflect your real
                        identity. Yohpal reserves the right to suspend, restrict, or permanently
                        close any account that is found to have submitted false information,
                        impersonated another individual, or violated national laws or platform
                        guidelines. You are fully responsible for all actions and activity conducted
                        through your account, and you agree to maintain the confidentiality of your
                        login credentials.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">2. Rights and Responsibilities</h2>
                    <hr className="mb-4" />
                    <p className="text-muted-foreground leading-loose mb-4">
                        All users of the Yohpal platform are entitled to a safe, inclusive, and
                        empowering digital environment. Yohpal upholds your right to create,
                        promote, and monetize content or services in accordance with platform
                        policies and national laws. Users have the right to access support, receive
                        earnings transparently, and report misuse or misconduct through official
                        channels.
                    </p>
                    <p className="text-muted-foreground leading-loose mb-4">
                        By using Yohpal, you accept the responsibility to conduct yourself with
                        honesty, professionalism, and digital integrity. You are required to
                        maintain accurate account information, respect the rights of other users,
                        and adhere to community standards. You must not engage in fraud, harassment,
                        impersonation, hate speech, political incitement, or any form of illegal or
                        unethical behavior.
                    </p>
                    <p className="text-muted-foreground leading-loose">
                        Every user plays a role in advancing Yohpal&apos;s mission of responsible
                        innovation, digital work access, and national development.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        3. Content Ownership, Responsibility, and Upload Guidelines
                    </h2>
                    <hr className="mb-4" />
                    <p className="text-muted-foreground leading-loose mb-4">
                        By uploading content to Yohpal including videos, images, audio, or written
                        material, you affirm that you are the rightful owner of such content. While
                        you retain full ownership of your intellectual property, you grant Yohpal a
                        non-exclusive, royalty-free, worldwide license to use, display, promote, and
                        distribute the content within the platform, as part of platform operations
                        or promotional efforts.
                    </p>
                    <p className="text-muted-foreground leading-loose">
                        All content submitted to Yohpal must adhere to Kenya&apos;s legal and moral
                        standards. Prohibited material includes sexually explicit content, hate
                        speech, violent extremism, political incitement, misinformation, ethnic
                        profiling, and any other material deemed unlawful or harmful to public
                        order. Content must not infringe upon the intellectual property rights of
                        third parties, nor should it mislead, harass, or incite animosity among
                        users or members of the public. Yohpal reserves the right to remove,
                        restrict, or report any content found in violation of these terms to the
                        appropriate authorities.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        4. Monetization, Promotion, and Earnings
                    </h2>
                    <hr className="mb-4" />
                    <p className="text-muted-foreground leading-loose mb-4">
                        Yohpal offers eligible users the opportunity to monetize their content,
                        promote their accounts, and earn through affiliate marketing or job-based
                        services available on the platform. Eligibility for these features may vary
                        and may be subject to account verification, content performance, and
                        compliance history.
                    </p>
                    <p className="text-muted-foreground leading-loose mb-4">
                        All promotional activities on Yohpal must be honest and in accordance with
                        ethical standards. Misleading advertisements, engagement fraud (including
                        the use of fake followers), or manipulation of performance metrics may
                        result in loss of promotional privileges or termination of your account.
                    </p>
                    <p className="text-muted-foreground leading-loose">
                        Users who earn through the platform, whether through content monetization,
                        Hustle, or affiliate programs shall receive payments via the Yohpal Wallet
                        or select the available payment methods. Yohpal may withhold or delay
                        payments in cases of suspected fraud or regulatory investigation. Users are
                        solely responsible for declaring and paying any taxes due to the Kenya
                        Revenue Authority or other legal entities, in accordance with applicable
                        national tax laws.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        5. Hustle Module Access and Responsibilities
                    </h2>
                    <hr className="mb-4" />
                    <p className="text-muted-foreground leading-loose mb-4">
                        Yohpal&apos;s Hustle Module is designed to create structured digital job
                        opportunities in support of Kenya&apos;s digital employment initiatives.
                        Users who seek services through the module must submit legitimate, clearly
                        described, and fairly compensated tasks. Hustlers, who are verified Yohpal
                        users offering their services, must activate Hustler Mode, undergo
                        onboarding, and consistently demonstrate professionalism, reliability, and
                        transparency in all task-related engagements.
                    </p>
                    <p className="text-muted-foreground leading-loose">
                        Both users and hustlers are expected to adhere to the national labor and
                        digital engagement standards. Abuse of the module, including submission of
                        unlawful tasks, failure to complete assigned duties, or misuse of earnings,
                        may result in suspension or permanent exclusion from the module.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        6. Platform Conduct and Legal Compliance
                    </h2>
                    <hr className="mb-4" />
                    <p className="text-muted-foreground leading-loose mb-4">
                        All Yohpal users are expected to behave with respect, integrity, and
                        professionalism. The platform strictly prohibits cyberbullying, harassment,
                        the spread of misinformation, political agitation, ethnic incitement, and
                        exploitation. Yohpal shall not be used as a platform for undermining
                        national security, spreading fake news, or conducting fraudulent activity.
                    </p>
                    <p className="text-muted-foreground leading-loose">
                        Violations of Kenya&apos;s laws, including the Computer Misuse and
                        Cybercrimes Act, the Data Protection Act, or the Penal Code, will result in
                        the immediate suspension of the user&apos;s account and the submission of
                        evidence to relevant government authorities. Yohpal is a law-abiding
                        platform and cooperates fully with investigations from licensed regulatory
                        bodies and security agencies.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">7. Data Privacy and Security</h2>
                    <hr className="mb-4" />
                    <p className="text-muted-foreground leading-loose mb-4">
                        Yohpal collects and processes your personal data in compliance with the Data
                        Protection Act, 2019. This data includes your account details, content,
                        interactions, financial records, and device information. Yohpal shall use
                        this data strictly for purposes of enhancing user experience, enforcing
                        policies, processing transactions, resolving disputes, and ensuring the
                        safety and integrity of the platform.
                    </p>
                    <p className="text-muted-foreground leading-loose">
                        Your data will not be sold or shared without your consent, unless required
                        by law or government request. You have the right to request correction,
                        access, or deletion of your personal data at any time by contacting our Data
                        Protection Officer via{" "}
                        <a
                            href={`mailto:${settings?.companyEmail}`}
                            className="text-primary hover:underline"
                        >
                            <b>{settings?.companyEmail}</b>
                        </a>
                        .
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        8. Platform Changes and Suspension of Services
                    </h2>
                    <hr className="mb-4" />
                    <p className="text-muted-foreground leading-loose mb-4">
                        Yohpal retains the right to alter or remove platform features, modules, or
                        services at any time in order to improve functionality, respond to user
                        feedback, or comply with regulatory instructions. In instances of planned
                        maintenance, cyber threats, legal proceedings, or public safety alerts,
                        Yohpal may temporarily or permanently suspend access to certain areas of the
                        platform.
                    </p>
                    <p className="text-muted-foreground leading-loose">
                        All changes to terms, policies, and services shall be communicated via
                        in-app notifications or through Yohpal&apos;s official communication
                        channels. Continued use of the platform after such updates constitutes
                        acceptance of the revised terms.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        9. Suspension, Termination, and Penalties
                    </h2>
                    <hr className="mb-4" />
                    <p className="text-muted-foreground leading-loose">
                        Yohpal reserves the right to suspend or terminate accounts found in
                        violation of these Terms or any applicable national law. Accounts involved
                        in harmful, abusive, or fraudulent activity may also be subject to
                        suspension or removal. Additionally, accounts that remain dormant for an
                        extended period without justification may be deactivated. Termination
                        decisions are final and may include the forfeiture of any accumulated
                        earnings or referral privileges.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        10. Government Alignment and Public Mandate
                    </h2>
                    <hr className="mb-4" />
                    <p className="text-muted-foreground leading-loose mb-4">
                        Yohpal is proudly built in Kenya, for Kenya. Our platform actively supports
                        the Government of Kenya&apos;s commitment to building a digitally literate,
                        economically active, and socially responsible society. We work in close
                        alignment with the Ministry of ICT and Digital Economy, the National
                        Employment Authority, county governments, and youth empowerment programs.
                    </p>
                    <p className="text-muted-foreground leading-loose">
                        We welcome partnerships with public institutions, innovation hubs,
                        development partners, and national digital infrastructure initiatives to
                        extend access and opportunity to youth and marginalized communities. By
                        using Yohpal, you are joining a movement that places nation-building,
                        equity, and innovation at the center of digital engagement.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        11. Support and Dispute Resolution
                    </h2>
                    <hr className="mb-4" />
                    <p className="text-muted-foreground leading-loose mb-4">
                        All user queries, complaints, or disputes must be reported through the
                        official Yohpal Help Desk within the app, or via email or phone. Yohpal
                        commits to addressing all legitimate concerns fairly and in a timely manner.
                        In cases where users are unable to resolve disputes amongst themselves,
                        Yohpal may intervene and provide a binding resolution. Platform decisions
                        are made with fairness and integrity and shall be considered final.
                    </p>
                    <p className="text-muted-foreground leading-loose">
                        For more serious issues involving legal claims, criminal activity, or data
                        misuse, Yohpal reserves the right to involve government agencies or escalate
                        matters to competent authorities. Disputes must be raised within 48 hours of
                        the triggering event.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">12. Acceptance of Terms</h2>
                    <hr className="mb-4" />
                    <p className="text-muted-foreground leading-loose">
                        By creating an account or using any Yohpal service, you confirm that you
                        have read, understood, and agreed to abide by these Terms and Conditions.
                        You also acknowledge Yohpal&apos;s authority to enforce platform rules and
                        take appropriate action to protect user safety, platform integrity, and
                        national interest.
                    </p>
                </div>

                <div className="bg-background p-6 rounded-lg border-2">
                    <h2 className="text-xl font-semibold mb-4">
                        For Inquiries And Official Correspondence, Please Contact:
                    </h2>
                    <div className="space-y-2">
                        <p className="text-muted-foreground">
                            <strong>Phone:</strong>{" "}
                            <a
                                href={`tel:${settings?.companyPhone}`}
                                className="text-primary hover:underline"
                            >
                                <b>{settings?.companyPhone}</b>
                            </a>
                        </p>
                        <p className="text-muted-foreground">
                            <strong>Email:</strong>{" "}
                            <Link
                                href={`mailto:${settings?.companyEmail}`}
                                className="text-primary hover:underline"
                            >
                                <b>{settings?.companyEmail}</b>
                            </Link>
                        </p>
                        <p className="text-muted-foreground">
                            <strong>In-App Support:</strong> Settings → Help Desk
                        </p>
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-lg font-semibold text-primary">
                            Yohpal: Monetizing Creativity
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
