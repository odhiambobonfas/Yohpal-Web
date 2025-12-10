import { db } from "@/lib/firebase/firebase.admin"
import { GeneralSettings } from "@/types/org/settings"

export async function getCompanyGeneralSettings() {
    const settingsDocs = await db
        .collection("settings")
        .doc("yohpal")
        .collection("generalSettings")
        .get()

    if (settingsDocs.empty) return null
    const settings = settingsDocs.docs.reduce((acc, doc) => {
        return { ...acc, ...doc.data() }
    }, {})

    return settings as unknown as GeneralSettings
}
