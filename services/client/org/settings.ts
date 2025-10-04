import { db } from "@/lib/firebase/firebase.browser"
// import { COMPANY_GENERAL_SETTINGS_DOC } from "@/services"
import { GeneralSetting } from "@/types/org/settings"
import { collection, getDocs } from "firebase/firestore"

export async function getCompanyGeneralSettings() {
    const generalSettingsRef = collection(db, "settings", "yohpal", "generalSettings")
    const generalSettingsDocs = await getDocs(generalSettingsRef)
    if (generalSettingsDocs.empty) return null
    const generalSettingsDoc = generalSettingsDocs.docs.at(0)
    if (!generalSettingsDoc?.exists()) return null
    return generalSettingsDoc.data() as unknown as GeneralSetting
}
