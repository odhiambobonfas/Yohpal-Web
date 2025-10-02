import { db } from "@/lib/firebase/firebase.browser"
import { COMPANY_GENERAL_SETTINGS_DOC } from "@/services"
import { GeneralSetting } from "@/types/org/settings"
import { doc, getDoc } from "firebase/firestore"

export async function getCompanyGeneralSettings() {
    const generalSettingsRef = doc(
        db,
        "settings",
        "yohpal",
        "generalSettings",
        COMPANY_GENERAL_SETTINGS_DOC,
    )
    const generalSettingsDoc = await getDoc(generalSettingsRef)
    if (!generalSettingsDoc.exists()) return null
    return generalSettingsDoc.data() as unknown as GeneralSetting
}
