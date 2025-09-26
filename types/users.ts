export interface YPUser {
    uid: string
    email: string
    userName: string
    firstName: string
    lastName: string
    phoneNumber: string
    profile_picture: string
    bio: string
    Country: string
    refererCode: string
    referralCode: string
    contentPreferences: string[] | undefined
}

export interface AuthUser {
    email: string
    password: string
}
