// GitHub User Finder Application
class GitHubUserFinder {
    constructor() {
        this.currentUser = null;
        this.currentRepos = [];
        this.searchTimeout = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Form elements
        this.searchForm = document.getElementById('searchForm');
        this.usernameInput = document.getElementById('usernameInput');
        this.searchButton = document.getElementById('searchButton');
        this.searchButtonText = document.querySelector('.search-button-text');
        this.searchButtonLoading = document.querySelector('.search-button-loading');

        // Section elements
        this.errorSection = document.getElementById('errorSection');
        this.loadingSection = document.getElementById('loadingSection');
        this.resultsSection = document.getElementById('resultsSection');

        // Error elements
        this.errorTitle = document.getElementById('errorTitle');
        this.errorText = document.getElementById('errorText');

        // User profile elements
        this.userAvatar = document.getElementById('userAvatar');
        this.userName = document.getElementById('userName');
        this.userLogin = document.getElementById('userLogin');
        this.userBio = document.getElementById('userBio');
        this.followersCount = document.getElementById('followersCount');
        this.followingCount = document.getElementById('followingCount');
        this.reposCount = document.getElementById('reposCount');
        this.userLocation = document.getElementById('userLocation');
        this.userCompany = document.getElementById('userCompany');
        this.userBlog = document.getElementById('userBlog');
        this.userJoined = document.getElementById('userJoined');
        this.profileLink = document.getElementById('profileLink');

        // Detail containers
        this.locationDetail = document.getElementById('locationDetail');
        this.companyDetail = document.getElementById('companyDetail');
        this.blogDetail = document.getElementById('blogDetail');

        // Repository elements
        this.sortSelect = document.getElementById('sortSelect');
        this.repositoriesList = document.getElementById('repositoriesList');
        this.noRepositories = document.getElementById('noRepositories');
    }

    bindEvents() {
        this.searchForm.addEventListener('submit', this.handleSearch.bind(this));
        this.usernameInput.addEventListener('input', this.handleInputChange.bind(this));
        this.sortSelect.addEventListener('change', this.handleSortChange.bind(this));
    }

    handleInputChange() {
        // Clear any existing timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Hide previous results and errors when user starts typing
        if (this.usernameInput.value.trim() === '') {
            this.hideAllSections();
        }
    }

    handleSearch(event) {
        event.preventDefault();
        
        const username = this.usernameInput.value.trim();
        if (!username) {
            this.showError('Validation Error', 'Please enter a GitHub username.');
            return;
        }

        this.searchUser(username);
    }

    handleSortChange() {
        const sortBy = this.sortSelect.value;
        this.sortRepositories(sortBy);
        this.renderRepositories();
    }

    async searchUser(username) {
        this.setLoadingState(true);
        this.hideAllSections();
        this.showLoadingSection();

        // When search starts
        document.querySelector('.search-button-loading').classList.remove('hidden');

        try {
            // Fetch user data and repositories concurrently
            const [userData, reposData] = await Promise.all([
                this.fetchUserData(username),
                this.fetchUserRepositories(username)
            ]);

            this.currentUser = userData;
            this.currentRepos = reposData;

            this.hideAllSections();
            this.renderUserProfile();
            this.renderRepositories();
            this.resultsSection.classList.remove('hidden');

        } catch (error) {
            this.hideAllSections();
            this.handleError(error);
        } finally {
            this.setLoadingState(false);

            // When search ends
            document.querySelector('.search-button-loading').classList.add('hidden');
        }
    }

    async fetchUserData(username) {
        const response = await fetch(`https://api.github.com/users/${username}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('USER_NOT_FOUND');
            } else if (response.status === 403) {
                throw new Error('RATE_LIMIT_EXCEEDED');
            } else {
                throw new Error('API_ERROR');
            }
        }

        return await response.json();
    }

    async fetchUserRepositories(username) {
        const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=30&sort=updated`);
        
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('RATE_LIMIT_EXCEEDED');
            } else {
                throw new Error('API_ERROR');
            }
        }

        return await response.json();
    }

    renderUserProfile() {
        const user = this.currentUser;

        // Basic info
        this.userAvatar.src = user.avatar_url;
        this.userAvatar.alt = `${user.login}'s avatar`;
        this.userName.textContent = user.name || user.login;
        this.userLogin.textContent = `@${user.login}`;
        
        // Bio
        if (user.bio) {
            this.userBio.textContent = user.bio;
            this.userBio.style.display = 'block';
        } else {
            this.userBio.style.display = 'none';
        }

        // Stats
        this.followersCount.textContent = this.formatNumber(user.followers);
        this.followingCount.textContent = this.formatNumber(user.following);
        this.reposCount.textContent = this.formatNumber(user.public_repos);

        // Details
        this.renderUserDetail(this.locationDetail, this.userLocation, user.location);
        this.renderUserDetail(this.companyDetail, this.userCompany, user.company);
        this.renderUserBlog(user.blog);

        // Joined date
        this.userJoined.textContent = this.formatDate(user.created_at);

        // Profile link
        this.profileLink.href = user.html_url;
        this.profileLink.target = '_blank';
        this.profileLink.rel = 'noopener noreferrer';
    }

    renderUserDetail(container, element, value) {
        if (value) {
            element.textContent = value;
            container.style.display = 'flex';
        } else {
            container.style.display = 'none';
        }
    }

    renderUserBlog(blogUrl) {
        if (blogUrl) {
            // Ensure URL has protocol
            const url = blogUrl.startsWith('http') ? blogUrl : `https://${blogUrl}`;
            this.userBlog.href = url;
            this.userBlog.target = '_blank';
            this.userBlog.rel = 'noopener noreferrer';
            this.userBlog.textContent = blogUrl;
            this.blogDetail.style.display = 'flex';
        } else {
            this.blogDetail.style.display = 'none';
        }
    }

    sortRepositories(sortBy) {
        switch (sortBy) {
            case 'stars':
                this.currentRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
                break;
            case 'created':
                this.currentRepos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'name':
                this.currentRepos.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'updated':
            default:
                this.currentRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                break;
        }
    }

    renderRepositories() {
        if (!this.currentRepos || this.currentRepos.length === 0) {
            this.repositoriesList.style.display = 'none';
            this.noRepositories.classList.remove('hidden');
            return;
        }

        this.noRepositories.classList.add('hidden');
        this.repositoriesList.style.display = 'block';

        // Show first 5 repositories
        const reposToShow = this.currentRepos.slice(0, 5);
        
        this.repositoriesList.innerHTML = reposToShow.map(repo => 
            this.createRepositoryCard(repo)
        ).join('');
    }

    createRepositoryCard(repo) {
        const language = repo.language || 'Text';
        const description = repo.description || 'No description available';
        const starsCount = this.formatNumber(repo.stargazers_count);
        const forksCount = this.formatNumber(repo.forks_count);
        const createdDate = this.formatDate(repo.created_at);
        const updatedDate = this.formatDate(repo.updated_at);

        return `
            <div class="card repository-card">
                <div class="card__body">
                    <div class="repository-card__header">
                        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repository-card__title">
                            ${repo.name}
                        </a>
                        <span class="repository-card__language">${language}</span>
                    </div>
                    
                    <p class="repository-card__description">${description}</p>
                    
                    <div class="repository-card__stats">
                        <div class="repository-stat">
                            <span class="repository-stat__icon">⭐</span>
                            <span>${starsCount}</span>
                        </div>
                        <div class="repository-stat">
                            <span class="repository-stat__icon">🍴</span>
                            <span>${forksCount}</span>
                        </div>
                    </div>
                    
                    <div class="repository-card__meta">
                        <span>Created ${createdDate}</span>
                        <span>Updated ${updatedDate}</span>
                    </div>
                </div>
            </div>
        `;
    }

    handleError(error) {
        let title = 'Error';
        let message = 'An unexpected error occurred. Please try again later.';

        if (error.message === 'USER_NOT_FOUND') {
            title = 'User Not Found';
            message = 'The username you entered does not exist on GitHub. Please check the spelling and try again.';
        } else if (error.message === 'RATE_LIMIT_EXCEEDED') {
            title = 'Rate Limit Exceeded';
            message = 'GitHub API rate limit exceeded. Please wait a few minutes before searching again.';
        } else if (error.message === 'API_ERROR') {
            title = 'API Error';
            message = 'There was a problem connecting to GitHub. Please check your internet connection and try again.';
        } else if (!navigator.onLine) {
            title = 'Network Error';
            message = 'No internet connection detected. Please check your network and try again.';
        }

        this.showError(title, message);
    }

    showError(title, message) {
        this.errorTitle.textContent = title;
        this.errorText.textContent = message;
        this.errorSection.classList.remove('hidden');
    }

    setLoadingState(isLoading) {
        this.searchButton.disabled = isLoading;
        
        if (isLoading) {
            this.searchButtonText.classList.add('hidden');
            this.searchButtonLoading.classList.remove('hidden');
        } else {
            this.searchButtonText.classList.remove('hidden');
            this.searchButtonLoading.classList.add('hidden');
        }
    }

    showLoadingSection() {
        this.loadingSection.classList.remove('hidden');
    }

    hideAllSections() {
        this.errorSection.classList.add('hidden');
        this.loadingSection.classList.add('hidden');
        this.resultsSection.classList.add('hidden');
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GitHubUserFinder();
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('Connection restored');
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
});