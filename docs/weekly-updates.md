## Week 1 (backend)
- Set up backend for ResearchLens
- Implemented research paper search using arXiv API
- Tested backend locally using browser
- Converted arXiv XML response into structured JSON format
- Extracted title, authors, summary, and link fields
## Week 1 — Project Setup & Core UI Build (frontend)

- Created the three main files — `index.html`, `styles.css`, and `script.js` to get the project started
- Added Google Fonts and set up color variables in CSS so changing theme colors later would be easy
- Built the top navbar with the logo, page links, a theme toggle button, and a hamburger menu for mobile
- Designed the hero section with a library bookshelf photo in the background, smooth zoom animation, and glowing blobs floating around
- Made the search bar with a glow effect when clicked, a dropdown showing trending topics, and stat badges below it
- Built the paper cards that show title, authors, a short preview of the abstract, citation count, and buttons to save or summarize
- Added loading skeleton cards that appear while papers are being fetched so the page does not look broken

## Week 2 — Pages, Modal & JavaScript Logic (frontend)

- Built the My Library page where users can see all the papers they saved, with a message shown when the library is empty
- Built the Search History page that shows past searches with timestamps and a button to search again quickly
- Designed the AI Summary popup with a blurred background, loading animation while the summary generates, and a list of key points
- Connected all the buttons and interactions in JavaScript — search on click or Enter key, dropdown open and close, switching between pages
- Made the save button actually work by storing saved papers in localStorage so they stay saved even after refreshing the page
- Fetched real academic papers from the Semantic Scholar API and displayed the actual data inside the cards
- Added a full footer with company links, social media icons, and a small badge at the bottom

## Week 3 — Light & Dark Theme Struggle + Font Visibility + Bug Fixes (frontend)

- Added a light mode to the site but ran into many problems because colors designed for dark mode looked broken on a white background
- The bookshelf background image was almost invisible in light mode because the dark filter was still being applied — fixed by turning the brightness fully up and making the overlay much more transparent
- White text on the hero became hard to read against the bright image — instead of changing the text color, added a dark shadow behind each letter so it stays readable no matter what is behind it
- The colorful gradient on the word "Knowledge" disappeared in light mode — turned off the gradient there and just kept it plain white so it still looks clean
- The navbar looked like a dark floating bar in light mode — changed it to white with a light border and fixed the link colors so they are visible on the white background
- Fixed a Safari bug where the frosted glass blur effect on the search bar, modal, and pills was not showing — Safari needs an extra `-webkit-` version of the property
- Cleaned up all 26 warnings and errors from the code checker — including missing button labels, leftover empty style blocks, and styles that were written directly in the HTML instead of the CSS file