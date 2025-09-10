import * as core from '@actions/core';
import * as github from '@actions/github';
import { parseConfig } from './config.js';
import { isMessageConventional } from './utils.js';

export async function run(): Promise<void> {
  const { context } = github;

  if (
    !['pull_request', 'pull_request_target'].includes(github.context.eventName)
  ) {
    throw new Error(
      'This action can only be run against `pull_request` and `pull_request_target` events.',
    );
  }

  if (!context.payload.pull_request) {
    throw new Error('Cannot parse pull request from context');
  }

  const token = core.getInput('token');
  const octokit = github.getOctokit(token);

  const config = parseConfig();
  core.debug(JSON.stringify({ config }));

  const pullRequest = await octokit.rest.pulls
    .get({
      owner: context.repo.owner,
      pull_number: context.payload.pull_request.number,
      repo: context.repo.repo,
    })
    .then(({ data }) => data)
    .catch((cause) => {
      const error = new Error('Failed to get pull request', { cause });
      core.debug(JSON.stringify({ error }));
      core.setFailed(error.message);
      throw error;
    });

  const commits = await octokit.rest.pulls
    .listCommits({
      owner: context.repo.owner,
      pull_number: context.payload.pull_request.number,
      repo: context.repo.repo,
    })
    .then(({ data }) =>
      data.map((commit) => ({
        commit: {
          message: commit.commit.message,
          tree: commit.commit.tree,
        },
        isConventional: isMessageConventional({
          config,
          message: commit.commit.message,
        }),
      })),
    )
    .catch((cause) => {
      const error = new Error('Failed to get commits', { cause });
      core.debug(JSON.stringify({ error }));
      core.setFailed(error.message);
      throw error;
    });

  if (config.targets.includes('title')) {
    if (!isMessageConventional({ config, message: pullRequest.title })) {
      const error = new Error('Pull request title is unconventional', {
        cause: {
          pull_request: {
            title: pullRequest.title,
            number: pullRequest.number,
          },
        },
      });
      core.debug(JSON.stringify({ error }));
      core.setFailed(error.message);
      throw error;
    }
  }

  if (config.targets.includes('commits')) {
    const badCommits = commits.filter(
      (commit) => commit.isConventional === false,
    );
    if (badCommits.length > 0) {
      core.error(
        `Bad commits:\n${badCommits.map(({ commit }) => `${commit.tree.sha}: ${commit.message}`)}`,
      );
      const error = new Error(
        `${badCommits.length}/${commits.length} commits are unconventional`,
        { cause: badCommits },
      );
      core.debug(JSON.stringify({ error }));
      core.setFailed(error.message);
      throw error;
    }
  } else if (config.targets.includes('commit')) {
    const badCommits = commits.filter(
      (commit) => commit.isConventional === false,
    );
    if (badCommits.length === commits.length) {
      core.error(
        `Bad commits:\n${badCommits.map(({ commit }) => `${commit.tree.sha}: ${commit.message}`)}`,
      );
      const error = new Error(
        `${badCommits.length}/${commits.length} commits are unconventional`,
        { cause: badCommits },
      );
      core.debug(JSON.stringify({ error }));
      core.setFailed(error.message);
      throw error;
    }
  }
}
