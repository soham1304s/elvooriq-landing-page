const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const crypto = require('crypto');

// Enforce AES-256 decryption keys for GITHUB token security
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'default_encryption_key_32_bytes!';
const IV_LENGTH = 16;

function encryptToken(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptToken(text) {
  if (!text) return null;
  try {
    const textParts = text.split(':');
    if (textParts.length < 2) return null;
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error('Error decrypting token:', err.message);
    return null;
  }
}

const calculateWRII = (stars = 0, forks = 0, openIssues = 0, commits = 0, watchers = 0) => {
  const starsFactor = (stars || 0) * 4.5;
  const forksFactor = (forks || 0) * 2.5;
  const watchersFactor = (watchers || 0) * 1.5;
  const commitsFactor = Math.log((commits || 0) + 1);
  const issuesPenalty = (openIssues || 0) * -0.5;
  return Math.max(0, parseFloat((starsFactor + forksFactor + watchersFactor + commitsFactor + issuesPenalty).toFixed(2)));
};

/**
 * Get GitHub portfolio and ranked repositories by user ID
 */
const getPortfolioByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await prisma.githubProfile.findUnique({
      where: { userId },
      include: {
        repositories: {
          orderBy: { wriiScore: 'desc' }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'No GitHub profile linked to this account.' });
    }

    return res.status(200).json({
      success: true,
      profile: {
        id: profile.id,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        publicReposCount: profile.publicReposCount,
        totalStars: profile.totalStars,
        totalForks: profile.totalForks,
        primaryLanguages: profile.primaryLanguages,
        lastSyncedAt: profile.lastSyncedAt
      },
      repositories: profile.repositories
    });
  } catch (error) {
    console.error('Error getting portfolio:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve portfolio data.', error: error.message });
  }
};

/**
 * Link GitHub username and optional access token
 */
const linkGithubProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, accessToken } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: 'GitHub username is required.' });
    }

    // Verify user exists on GitHub
    const userRes = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ELVOORIQ-Enterprise-Engine'
      }
    }).catch(err => {
      if (err.response && err.response.status === 404) {
        throw new Error(`GitHub user '${username}' not found.`);
      }
      throw err;
    });

    const ghUser = userRes.data;
    const encryptedToken = accessToken ? encryptToken(accessToken) : null;

    const profile = await prisma.githubProfile.upsert({
      where: { userId },
      update: {
        username: ghUser.login,
        avatarUrl: ghUser.avatar_url || '',
        publicReposCount: ghUser.public_repos || 0,
        accessToken: encryptedToken || undefined
      },
      create: {
        userId,
        username: ghUser.login,
        avatarUrl: ghUser.avatar_url || '',
        publicReposCount: ghUser.public_repos || 0,
        primaryLanguages: JSON.stringify([]),
        accessToken: encryptedToken
      }
    });

    return res.status(200).json({
      success: true,
      message: 'GitHub profile linked successfully.',
      profile
    });
  } catch (error) {
    console.error('Error linking GitHub profile:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Handshake failed.' });
  }
};

/**
 * Live GitHub repository synchronization and WRII score calculation
 */
const syncGithubPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    let githubProfile = await prisma.githubProfile.findUnique({
      where: { userId },
    });

    // If username is provided in body and no profile exists, link automatically
    if (!githubProfile && req.body && req.body.username) {
      const userRes = await axios.get(`https://api.github.com/users/${encodeURIComponent(req.body.username)}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'ELVOORIQ-Enterprise-Engine' }
      });
      githubProfile = await prisma.githubProfile.create({
        data: {
          userId,
          username: userRes.data.login,
          avatarUrl: userRes.data.avatar_url,
          publicReposCount: userRes.data.public_repos || 0,
          primaryLanguages: JSON.stringify([]),
          accessToken: req.body.accessToken ? encryptToken(req.body.accessToken) : null
        }
      });
    }

    if (!githubProfile) {
      return res.status(404).json({ success: false, message: 'No GitHub profile linked to this account.' });
    }

    const decryptedToken = decryptToken(githubProfile.accessToken);
    let rawRepos = [];

    // Authenticated vs Public repository fetching
    if (decryptedToken) {
      try {
        const response = await axios.get('https://api.github.com/user/repos', {
          headers: {
            'Authorization': `token ${decryptedToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'ELVOORIQ-Enterprise-Engine'
          },
          params: { per_page: 50, sort: 'updated', type: 'all' }
        });
        rawRepos = response.data || [];
      } catch (authErr) {
        console.warn('OAuth token fetch failed, attempting public fallback:', authErr.message);
      }
    }

    // Fallback to public repos if token is missing or expired
    if (rawRepos.length === 0) {
      const response = await axios.get(`https://api.github.com/users/${encodeURIComponent(githubProfile.username)}/repos`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'ELVOORIQ-Enterprise-Engine'
        },
        params: { per_page: 50, sort: 'updated' }
      });
      rawRepos = response.data || [];
    }

    if (!rawRepos || rawRepos.length === 0) {
      return res.status(200).json({ success: true, message: 'Sync complete. No repositories found.', count: 0, repositories: [] });
    }

    const syncedRepos = [];
    let cumulativeStars = 0;
    let cumulativeForks = 0;
    const languagesCount = {};

    await prisma.$transaction(async (tx) => {
      await tx.githubRepository.deleteMany({
        where: { profileId: githubProfile.id }
      });

      for (const repo of rawRepos) {
        if (repo.fork && (repo.stargazers_count === 0 && repo.forks_count === 0)) continue;

        const score = calculateWRII(repo.stargazers_count, repo.forks_count, repo.open_issues_count, 0, repo.watchers_count);
        cumulativeStars += (repo.stargazers_count || 0);
        cumulativeForks += (repo.forks_count || 0);

        if (repo.language) {
          languagesCount[repo.language] = (languagesCount[repo.language] || 0) + 1;
        }

        const repoRecord = await tx.githubRepository.create({
          data: {
            profileId: githubProfile.id,
            name: repo.name,
            description: repo.description || 'Interactive, high-end digital portfolio repository',
            repoUrl: repo.html_url,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            watchers: repo.watchers_count || 0,
            language: repo.language || 'Unknown',
            openIssues: repo.open_issues_count || 0,
            wriiScore: score,
            lastUpdated: new Date(repo.updated_at),
            isFeatured: score > 15.0
          }
        });
        syncedRepos.push(repoRecord);
      }

      await tx.githubProfile.update({
        where: { id: githubProfile.id },
        data: {
          publicReposCount: rawRepos.length,
          totalStars: cumulativeStars,
          totalForks: cumulativeForks,
          primaryLanguages: JSON.stringify(languagesCount),
          lastSyncedAt: new Date()
        }
      });
    });

    const topRepositories = syncedRepos.sort((a, b) => b.wriiScore - a.wriiScore).slice(0, 10);

    return res.status(200).json({
      success: true,
      message: 'GitHub Repository profile successfully synced.',
      metrics: {
        repositoriesProcessed: rawRepos.length,
        totalStarsAccumulated: cumulativeStars,
        totalForksAccumulated: cumulativeForks
      },
      repositories: topRepositories
    });
  } catch (error) {
    console.error('Synchronization handshake failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Synchronization handshake failed.',
      error: error.message
    });
  }
};

module.exports = {
  getPortfolioByUserId,
  linkGithubProfile,
  syncGithubPortfolio,
  calculateWRII,
  encryptToken,
  decryptToken
};
