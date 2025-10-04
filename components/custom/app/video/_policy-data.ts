// TODO(3467633a0185)

export const POLICIES = [
    {
        scenario: "Spam or Misleading",
        limits: [
            "Repetitive, unsolicited, or irrelevant content",
            "Misleading thumbnails, titles, or descriptions",
            "Scams, phishing attempts, or fraudulent schemes",
            "Commercial spam or excessive self-promotion",
        ],
    },
    {
        scenario: "Violence or Harmful Content",
        limits: [
            "Graphic violence, gore, or content depicting death",
            "Content that promotes or glorifies violence",
            "Self-harm or suicide content",
            "Dangerous challenges or harmful pranks",
        ],
    },
    {
        scenario: "Child Safety",
        limits: [
            "Sexual exploitation of minors including CSAM",
            "Physical or psychological abuse of minors",
            "Endangerment, neglect, or exploitation of children",
            "Grooming, solicitation, or predatory behavior",
            "Trafficking of minors or child soldier recruitment",
        ],
    },
    {
        scenario: "Hate Speech or Harassment",
        limits: [
            "Content attacking individuals based on protected attributes",
            "Promoting hatred or discrimination against groups",
            "Bullying, harassment, or threatening behavior",
            "Doxxing or sharing private personal information",
        ],
    },
    {
        scenario: "Sexual Content",
        limits: [
            "Sexually explicit content or pornography",
            "Sexual acts, nudity, or sexually suggestive content",
            "Content sexualizing minors in any way",
            "Non-consensual intimate imagery",
        ],
    },
    {
        scenario: "Illegal Activities",
        limits: [
            "Promoting or facilitating illegal activities",
            "Sale of illegal drugs, weapons, or contraband",
            "Instructions for creating dangerous items",
            "Copyright infringement or pirated content",
        ],
    },
    {
        scenario: "Misinformation",
        limits: [
            "Health misinformation that could cause harm",
            "Election misinformation or voter suppression",
            "Conspiracy theories that incite harm",
            "Manipulated media presented as authentic",
        ],
    },
    {
        scenario: "Other",
        limits: [],
    },
]
