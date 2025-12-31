import {
  localized,
  PreferencesUIStore,
  ExtensionRegistry,
  FocusedPerspectiveStore,
  Actions,
} from 'mailspring-exports';

import PreferencesUnifiedInbox from './preferences-unified-inbox';
import { getDefaultToFiltered } from './unified-inbox-config';
import {
  FilteredInboxSidebarExtension,
  FilteredUnreadSidebarExtension,
  FilteredStarredSidebarExtension,
  FilteredDraftsSidebarExtension,
  getFilteredInboxPerspective,
} from './filtered-unified-sidebar-extensions';

// Activate is called when the package is loaded. If your package previously
// saved state using `serialize` it is provided.
//
export function activate() {
  this.preferencesTab = new PreferencesUIStore.TabItem({
    tabId: 'Unified Inbox',
    displayName: localized('Unified Inbox'),
    componentClassFn: () => PreferencesUnifiedInbox,
  });
  PreferencesUIStore.registerPreferencesTab(this.preferencesTab);
  this._extensionsRegistered = false;
  this._didSetDefaultInbox = false;

  this._updateSidebarExtensions = () => {
    const sidebarAccountIds = FocusedPerspectiveStore.sidebarAccountIds();
    const shouldShow = Array.isArray(sidebarAccountIds) && sidebarAccountIds.length > 1;
    if (shouldShow && !this._extensionsRegistered) {
      ExtensionRegistry.AccountSidebar.register(FilteredDraftsSidebarExtension);
      ExtensionRegistry.AccountSidebar.register(FilteredStarredSidebarExtension);
      ExtensionRegistry.AccountSidebar.register(FilteredUnreadSidebarExtension);
      ExtensionRegistry.AccountSidebar.register(FilteredInboxSidebarExtension);
      this._extensionsRegistered = true;
    } else if (!shouldShow && this._extensionsRegistered) {
      ExtensionRegistry.AccountSidebar.unregister(FilteredDraftsSidebarExtension);
      ExtensionRegistry.AccountSidebar.unregister(FilteredStarredSidebarExtension);
      ExtensionRegistry.AccountSidebar.unregister(FilteredUnreadSidebarExtension);
      ExtensionRegistry.AccountSidebar.unregister(FilteredInboxSidebarExtension);
      this._extensionsRegistered = false;
    }

    this._maybeSelectFilteredInbox();
  };

  this._maybeSelectFilteredInbox = () => {
    if (this._didSetDefaultInbox || !getDefaultToFiltered()) {
      return;
    }
    const sidebarAccountIds = FocusedPerspectiveStore.sidebarAccountIds();
    if (!Array.isArray(sidebarAccountIds) || sidebarAccountIds.length <= 1) {
      return;
    }
    const current = FocusedPerspectiveStore.current();
    if (!current || !current.isInbox || !current.isInbox()) {
      return;
    }
    const filteredPerspective = getFilteredInboxPerspective(sidebarAccountIds);
    if (filteredPerspective && current.isEqual && current.isEqual(filteredPerspective)) {
      this._didSetDefaultInbox = true;
      return;
    }
    if (filteredPerspective) {
      Actions.focusMailboxPerspective(filteredPerspective);
      this._didSetDefaultInbox = true;
    }
  };

  this._updateSidebarExtensions();
  this._unlistenFocusedPerspective = FocusedPerspectiveStore.listen(
    this._updateSidebarExtensions
  );
}

// Serialize is called when your package is about to be unmounted.
// You can return a state object that will be passed back to your package
// when it is re-activated.
//
export function serialize() {}

// This **optional** method is called when the window is shutting down,
// or when your package is being updated or disabled. If your package is
// watching any files, holding external resources, providing commands or
// subscribing to events, release them here.
//
export function deactivate() {
  if (this._unlistenFocusedPerspective) {
    this._unlistenFocusedPerspective();
  }
  PreferencesUIStore.unregisterPreferencesTab(this.preferencesTab.tabId);
  if (this._extensionsRegistered) {
    ExtensionRegistry.AccountSidebar.unregister(FilteredDraftsSidebarExtension);
    ExtensionRegistry.AccountSidebar.unregister(FilteredStarredSidebarExtension);
    ExtensionRegistry.AccountSidebar.unregister(FilteredUnreadSidebarExtension);
    ExtensionRegistry.AccountSidebar.unregister(FilteredInboxSidebarExtension);
    this._extensionsRegistered = false;
  }
}
