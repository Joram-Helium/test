const { Octokit } = require("@octokit/rest");
const fetch = require('node-fetch');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  request: {
    fetch: fetch
  }
});

async function updatePRBase(repositoryOwner, repositoryName, prNumber, newBase) {
  await octokit.rest.pulls.update({
    owner: repositoryOwner,
    repo: repositoryName,
    pull_number: prNumber,
    base: newBase
  });
}

async function run() {
  const repositoryOwner = process.env.GITHUB_REPOSITORY.split('/')[0];
  const repositoryName = process.env.GITHUB_REPOSITORY.split('/')[1];
  const mergedBranch = process.env.GITHUB_HEAD_REF;

  const { data: pullRequests } = await octokit.rest.pulls.list({
    owner: repositoryOwner,
    repo: repositoryName,
    state: 'open'
  });

  for (const pr of pullRequests) {
    if (pr.base.ref === mergedBranch) {
      await updatePRBase(repositoryOwner, repositoryName, pr.number, process.env.DEFAULT_BRANCH);
      console.log(`Updated base of PR #${pr.number} to ${process.env.DEFAULT_BRANCH}`);
    }
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
