const CONFIG_KEY = 'plugins.unified-inbox.excludedAccountIds';
const DEFAULT_FILTERED_KEY = 'plugins.unified-inbox.defaultToFiltered';

export function getExcludedAccountIds() {
  return AppEnv.config.get(CONFIG_KEY) || [];
}

export function setExcludedAccountIds(accountIds) {
  AppEnv.config.set(CONFIG_KEY, accountIds);
}

export function filterAccountIds(accountIds) {
  if (!Array.isArray(accountIds)) {
    return [];
  }
  if (accountIds.length <= 1) {
    return accountIds;
  }
  const excluded = getExcludedAccountIds();
  if (!excluded.length) {
    return accountIds;
  }
  return accountIds.filter(id => !excluded.includes(id));
}

export function onExcludedAccountIdsChange(callback) {
  return AppEnv.config.onDidChange(CONFIG_KEY, callback);
}

export function getDefaultToFiltered() {
  const value = AppEnv.config.get(DEFAULT_FILTERED_KEY);
  return value == null ? true : !!value;
}

export function setDefaultToFiltered(enabled) {
  AppEnv.config.set(DEFAULT_FILTERED_KEY, !!enabled);
}
