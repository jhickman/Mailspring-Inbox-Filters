import { localized, MailboxPerspective, CategoryStore } from 'mailspring-exports';

import { filterAccountIds } from './unified-inbox-config';

const FILTERED_SUFFIX = localized('Filtered');

const withSuffix = label => `${label} (${FILTERED_SUFFIX})`;

const filteredAccountIds = accountIds => filterAccountIds(accountIds);

export const getFilteredInboxPerspective = accountIds => {
  const categories = filteredAccountIds(accountIds)
    .map(id => CategoryStore.getCategoryByRole(id, 'inbox'))
    .filter(cat => !!cat);
  return MailboxPerspective.forCategories(categories);
};

const filteredUnreadPerspective = accountIds => {
  const categories = filteredAccountIds(accountIds)
    .map(id => CategoryStore.getCategoryByRole(id, 'inbox'))
    .filter(cat => !!cat);
  if (categories.length === 0) {
    return MailboxPerspective.forNothing();
  }
  return MailboxPerspective.forUnread(categories);
};

const filteredStarredPerspective = accountIds => {
  const ids = filteredAccountIds(accountIds);
  return ids.length > 0 ? MailboxPerspective.forStarred(ids) : MailboxPerspective.forNothing();
};

const filteredDraftsPerspective = accountIds => {
  const ids = filteredAccountIds(accountIds);
  return ids.length > 0 ? MailboxPerspective.forDrafts(ids) : MailboxPerspective.forNothing();
};

export const FilteredInboxSidebarExtension = {
  name: 'FilteredInboxSidebarExtension',
  sidebarItem(accountIds) {
    return {
      id: 'filtered-inbox',
      name: withSuffix(localized('Inbox')),
      iconName: 'inbox.png',
      perspective: getFilteredInboxPerspective(accountIds),
      insertAtTop: true,
    };
  },
};

export const FilteredUnreadSidebarExtension = {
  name: 'FilteredUnreadSidebarExtension',
  sidebarItem(accountIds) {
    return {
      id: 'filtered-unread',
      name: withSuffix(localized('Unread')),
      iconName: 'unread.png',
      perspective: filteredUnreadPerspective(accountIds),
      insertAtTop: true,
    };
  },
};

export const FilteredStarredSidebarExtension = {
  name: 'FilteredStarredSidebarExtension',
  sidebarItem(accountIds) {
    return {
      id: 'filtered-starred',
      name: withSuffix(localized('Starred')),
      iconName: 'starred.png',
      perspective: filteredStarredPerspective(accountIds),
      insertAtTop: true,
    };
  },
};

export const FilteredDraftsSidebarExtension = {
  name: 'FilteredDraftsSidebarExtension',
  sidebarItem(accountIds) {
    return {
      id: 'filtered-drafts',
      name: withSuffix(localized('Drafts')),
      iconName: 'drafts.png',
      perspective: filteredDraftsPerspective(accountIds),
      insertAtTop: true,
    };
  },
};
