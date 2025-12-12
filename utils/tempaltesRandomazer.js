export function getRandomTemplate(tour, hotel, date, formattedTime) {
    const templates = [
`Good afternoon 🙂
We hope you're doing well.

We would like to confirm that you have a group tour to ${tour} scheduled with us for tomorrow.
Could you please confirm if you are staying at ${hotel}?

${date} at about ${formattedTime} we will send your pickup time.🕢`,

`Hello,
This is a reminder of your group tour to ${tour} scheduled with us for tomorrow.
Please confirm your hotel: ${hotel}.

We will send your pickup time on ${date} around ${formattedTime}.`,

`Hi!

Your upcoming tour to ${tour} is booked for tomorrow.
Are you currently staying at ${hotel}? Please confirm.

Pickup time will be shared on ${date} at about ${formattedTime}.`,

`Dear guest,
We kindly remind you about your tour to ${tour} scheduled for tomorrow.
Please reply if you will be at ${hotel}.

Pickup details will be provided on ${date} at ${formattedTime}.`,

`Greetings from our team!

Your group tour to ${tour} is set for tomorrow.
Is ${hotel} your confirmed hotel? Awaiting your response.

We'll send the pickup time on ${date}, expected around ${formattedTime}.`,

`Good day!

Just checking in about your tour to ${tour} happening tomorrow.
Can you confirm if you are staying at ${hotel}?

Pickup info will be sent to you on ${date} at around ${formattedTime}.`,

`Hello!

Reminder: You have a group tour to ${tour} scheduled for tomorrow.
Please verify your hotel: ${hotel}.

Look out for your pickup details on ${date} (about ${formattedTime}).`,

`Dear traveler,
Your tour to ${tour} is planned for tomorrow.
Is your hotel still ${hotel}? Please confirm.

Pickup time information will be shared on ${date}, approximately at ${formattedTime}.`
    ];
    
    const idx = Math.floor(Math.random() * templates.length);
    return templates[idx];
}