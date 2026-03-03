# **App Name**: AXI Shorts

## Core Features:

- User Authentication & Profile: Allow users to register and log in via email (Gmail accounts only). Basic user profile data, including first name, last name, and age, is stored and retrieved from Firestore.
- Short Video Upload: Enable authenticated users to upload short video files. Videos are stored in cloud storage (Firebase Storage), and their corresponding metadata (URL, uploader ID, timestamp, initial likes) is saved in Firestore.
- Dynamic Video Feed: Present users with a vertically scrolling, dynamic feed of short videos, populated with video metadata fetched from Firestore.
- Video Playback: An embedded video player to handle seamless, continuous looped playback of short videos presented in the feed.
- AI Video Caption Tool: A generative AI tool that assists users in crafting compelling titles and hashtags for their uploaded videos by generating suggestions based on user input.
- Engagement UI Placeholder: Display placeholder UI elements for social engagement actions (like, comment, share) on each video, without implementing backend functionality in the MVP.

## Style Guidelines:

- The overall color scheme is dark, reflecting the app's modern and digital aesthetic.
- Primary color: A vibrant digital cyan (#05F7FF). This color signifies energy and technological sophistication, acting as a prominent element against the dark background.
- Background color: A deeply desaturated, dark teal-grey (#151D1E) that provides a harmonious, non-distracting backdrop, visually connected to the primary color's hue.
- Accent color: A striking vivid green (#00CC66) to draw attention to interactive elements, call-to-actions, and highlights, offering a strong contrast with the primary and background colors.
- Headlines and prominent text: 'Space Grotesk' (sans-serif), for a modern, tech-inspired, and slightly condensed feel that commands attention.
- Body text and functional labels: 'Inter' (sans-serif), chosen for its excellent readability and neutral, professional appearance, ensuring clear communication.
- Utilize simple, clean vector icons (e.g., from Material Symbols or a similar set) for navigation and engagement buttons, maintaining a contemporary and easily decipherable visual language.
- Emphasize an immersive full-screen video viewing experience for the main feed, with minimalist, transparent UI overlays. Registration and profile screens should feature clean, centered layouts.
- Implement subtle and smooth transitions for page navigation and content loading. Incorporate micro-interactions such as feedback on button presses or slight video transitions to enhance user engagement without distraction.