// import { db } from "@/lib/firebase/firebase.browser"
// import { COMPANY_GENERAL_SETTINGS_DOC } from "@/services"
// import { GeneralSetting } from "@/types/org/settings"
// import { doc, getDoc } from "firebase/firestore"

import { db } from "@/lib/firebase/firebase.admin"
import { COMPANY_GENERAL_SETTINGS_DOC } from "@/services"
import { GeneralSetting } from "@/types/org/settings"

// export async function getCompanyGeneralSettings() {
//     const generalSettingsRef = doc(
//         db,
//         "settings",
//         "yohpal",
//         "generalSettings",
//         COMPANY_GENERAL_SETTINGS_DOC,
//     )
//     const generalSettingsDoc = await getDoc(generalSettingsRef)
//     if (!generalSettingsDoc.exists()) return null
//     return generalSettingsDoc.data() as unknown as GeneralSetting
// }

// server reference
// async function getLikedCount(userId: string) {
//     const likesDocs = await db
//         .collection("users")
//         .doc(userId)
//         .collection("likes")
//         .doc(DOC)
//         .collection("videoIds")
//         .get()
//     if (likesDocs.empty) return []
//     return likesDocs.docs.map((l) => l.id)
// }
export async function getCompanyGeneralSettings() {
    const settingsDoc = await db
        .collection("settings")
        .doc("yohpal")
        .collection("generalsettings")
        .doc(COMPANY_GENERAL_SETTINGS_DOC)
        .get()
    if (!settingsDoc.exists) return null
    return settingsDoc.data() as unknown as GeneralSetting
}
