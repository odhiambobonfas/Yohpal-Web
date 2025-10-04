import { db } from "@/lib/firebase/firebase.admin"
import { GeneralSetting } from "@/types/org/settings"

export async function getCompanyGeneralSettings() {
    const settingsDocs = await db
        .collection("settings")
        .doc("yohpal")
        .collection("generalsettings")
        .get()

    if (settingsDocs.empty) return null
    const settingDoc = settingsDocs.docs.at(0)
    if (!settingDoc?.exists) return null

    return settingDoc.data() as unknown as GeneralSetting
}
