# GitHub User Finder

A simple web application that allows you to search for GitHub users and explore their profiles and repositories using the GitHub REST API.

---

## 🚀 Features

- Search for any GitHub username.
- View user details:
  - Avatar, name, username, bio
  - Followers, following, public repositories count
  - Location, company, blog link, join date
- View up to 5 repositories with:
  - Repository name and description
  - Primary language
  - Stars and forks
  - Created and updated dates
- Sort repositories by:
  - Recently updated
  - Most stars
  - Recently created
  - Alphabetical order
- Handles errors gracefully (invalid username, API rate limits, network errors).
- Responsive design (works on desktop and mobile).

---

## 📸 Screenshots

### Home Screen
![Home Screen](images/screenshot-home.png)

### Search Results
![Search Results](images/screenshot-results.png)

---

## ⚙️ Setup & Usage

1. Clone or download this repository.
2. Open `index.html` in your browser.
3. Enter a GitHub username (e.g., `octocat`) in the search box.
4. Explore the profile and repositories!

> ⚠️ This project uses the **public GitHub API**.  
> If you search too often, you may hit the rate limit (60 requests per hour without authentication).

---

## 🛠️ Technologies Used

- **HTML5** – Structure and layout  
- **CSS3** – Styling and responsiveness  
- **JavaScript (ES6+)** – API calls, DOM manipulation, logic  
- **GitHub REST API** – Fetching user and repository data  

---
