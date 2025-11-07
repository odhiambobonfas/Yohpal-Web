import ResetPasswordComponent from "./reset-component"
import SendPasswordResetComponent from "./send-password-reset-component"

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{
        [key: string]: string | string[] | undefined
    }>
}) {
    const { oobCode, mode } = await searchParams

    if (mode === "resetPassword" && oobCode) {
        return <ResetPasswordComponent oobCode={oobCode as string} />
    }
    return <SendPasswordResetComponent />
}
