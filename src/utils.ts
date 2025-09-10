import {
  parser,
  toConventionalChangelogFormat,
} from '@conventional-commits/parser';
import type { Config } from './config.js';

const REGEX_TYPE = /^.*: [^ ].*$/;

export function isMessageConventional(params: {
  config: Config;
  message: string;
}) {
  const { config, message } = params;

  const isMergeCommit = message.startsWith('Merge');
  if (config.allowMergeCommits && isMergeCommit) {
    return true;
  }

  const isRevertCommit = message.startsWith('Revert');
  if (config.allowRevertCommits && isRevertCommit) {
    return true;
  }

  if (message.startsWith(' ')) {
    return false;
  }

  try {
    const commit = toConventionalChangelogFormat(parser(message));
    const isScopeValid =
      commit.scope === null ||
      commit.scope
        .split(/, ?/)
        .every((scope) =>
          config.scopes.length > 0 ? config.scopes.includes(scope) : true,
        );
    const isTypeValid =
      config.types.includes(commit.type) && REGEX_TYPE.test(message);
    return isScopeValid && isTypeValid;
  } catch {
    return false;
  }
}
