import { React, localized, AccountStore } from 'mailspring-exports';

import {
  getExcludedAccountIds,
  setExcludedAccountIds,
  onExcludedAccountIdsChange,
  getDefaultToFiltered,
  setDefaultToFiltered,
} from './unified-inbox-config';

export default class PreferencesUnifiedInbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = this._getStateFromStores();
  }

  componentDidMount() {
    this._unlistenAccounts = AccountStore.listen(() => {
      this.setState(this._getStateFromStores());
    });
    this._configSubscription = onExcludedAccountIdsChange(() => {
      this.setState(this._getStateFromStores());
    });
  }

  componentWillUnmount() {
    if (this._unlistenAccounts) {
      this._unlistenAccounts();
    }
    if (this._configSubscription && this._configSubscription.dispose) {
      this._configSubscription.dispose();
    }
  }

  _getStateFromStores() {
    return {
      accounts: AccountStore.accounts(),
      excludedAccountIds: getExcludedAccountIds(),
      defaultToFiltered: getDefaultToFiltered(),
    };
  }

  _toggleAccount = accountId => {
    const { excludedAccountIds } = this.state;
    const isExcluded = excludedAccountIds.includes(accountId);
    const nextExcluded = isExcluded
      ? excludedAccountIds.filter(id => id !== accountId)
      : excludedAccountIds.concat(accountId);
    setExcludedAccountIds(nextExcluded);
  };

  _renderAccountRow = account => {
    const isExcluded = this.state.excludedAccountIds.includes(account.id);
    return (
      <label key={account.id} className="unified-inbox-account-row">
        <input
          type="checkbox"
          checked={isExcluded}
          onChange={() => this._toggleAccount(account.id)}
        />
        <span>{account.label}</span>
      </label>
    );
  };

  _onDefaultToFilteredChange = event => {
    setDefaultToFiltered(event.target.checked);
  };

  render() {
    const { accounts, defaultToFiltered } = this.state;
    return (
      <div className="unified-inbox-preferences">
        <h6>{localized('Unified Inbox Filters')}</h6>
        <label className="unified-inbox-default-toggle">
          <input
            type="checkbox"
            checked={defaultToFiltered}
            onChange={this._onDefaultToFilteredChange}
          />
          <span>{localized('Default to Inbox (Filtered) in unified view')}</span>
        </label>
        <p>
          {localized(
            'Select accounts to exclude from unified views (Inbox, Unread, Starred, Drafts). Excluded accounts still sync and remain accessible in the sidebar.'
          )}
        </p>
        <p>{localized('Check an account to exclude it from unified views.')}</p>
        <label className="unified-account-list-box">
          <span>Accounts</span>
          <div className="unified-inbox-account-list">
            {accounts.map(account => this._renderAccountRow(account))}
          </div>
        </label>
      </div>
    );
  }
}
