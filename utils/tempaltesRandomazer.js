export function getRandomTemplate(tour, hotel) {
const templates = [
`Good day 🙂
We hope you're doing well.

We would like to confirm that you have a group tour to ${tour} scheduled with us for tomorrow.
Could you please confirm if you are staying at ${hotel}?

Today at about 8:10PM we will send your pickup time.🕢`,

`Hello,
This is a reminder of your group tour to ${tour} scheduled with us for tomorrow.
Please confirm your hotel: ${hotel}.

Today at about 8:10PM we will send your pickup time.🕢`,

`Hi!

Your upcoming tour to ${tour} is booked for tomorrow.
Are you currently staying at ${hotel}? Please confirm.

Today at about 8:10PM we will send your pickup time.🕢`,

`Dear guest,
We kindly remind you about your tour to ${tour} scheduled for tomorrow.
Please reply if you will be at ${hotel}.

Today at about 8:10PM we will send your pickup time.🕢`,

`Greetings from our team!

Your group tour to ${tour} is set for tomorrow.
Is ${hotel} your confirmed hotel? Awaiting your response.

Today at about 8:10PM we will send your pickup time.🕢`,

`Good day!

Just checking in about your tour to ${tour} happening tomorrow.
Can you confirm if you are staying at ${hotel}?

Today at about 8:10PM we will send your pickup time.🕢`,

`Hello!

Reminder: You have a group tour to ${tour} scheduled for tomorrow.
Please verify your hotel: ${hotel}.

Today at about 8:10PM we will send your pickup time.🕢`,

`Dear traveler,
Your tour to ${tour} is planned for tomorrow.
Is your hotel still ${hotel}? Please confirm.

Today at about 8:10PM we will send your pickup time.🕢`
];
    
    const idx = Math.floor(Math.random() * templates.length);
    return templates[idx];
}