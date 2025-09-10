import * as core from '@actions/core';

export type Config = {
  targets: Target[];
  types: string[];
  scopes: string[];
  allowMergeCommits: boolean;
  allowRevertCommits: boolean;
};

type Target = (typeof TARGETS)[number];
const TARGETS = ['title', 'commits', 'commit'] as const;

export function parseConfig(): Config {
  const allowMergeCommits = core.getBooleanInput('allowMergeCommits');
  const allowRevertCommits = core.getBooleanInput('allowRevertCommits');

  const scopes = core.getInput('scopes', { trimWhitespace: true });

  const targets = core.getInput('targets', { trimWhitespace: true });

  const types = core.getInput('types', { trimWhitespace: true });

  return makeConfig({
    allowMergeCommits,
    allowRevertCommits,
    scopes: scopes.length > 0 ? scopes.split(' ') : undefined,
    targets:
      targets.length > 0 ? targets.split(' ').filter(isTarget) : undefined,
    types: types.length > 0 ? types.split(' ') : undefined,
  });
}

function makeConfig(inputs: Partial<Config>): Config {
  return {
    targets: inputs.targets ?? [],
    types: inputs.types ?? [
      'feat',
      'fix',
      'docs',
      'style',
      'refactor',
      'perf',
      'test',
      'build',
      'ci',
      'chore',
      'revert',
    ],
    scopes: inputs.scopes ?? [],
    allowMergeCommits: inputs.allowMergeCommits ?? false,
    allowRevertCommits: inputs.allowRevertCommits ?? false,
  };
}

function isTarget(string: string): string is Target {
  return TARGETS.includes(string as Target);
}
