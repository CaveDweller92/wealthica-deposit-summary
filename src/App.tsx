import { Addon } from '@wealthica/wealthica.js/index';
import _ from 'lodash';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import { initTracking, trackEvent } from './analytics';
import { DEFAULT_BASE_CURRENCY, TRANSACTIONS_FROM_DATE } from './constants';
import { Account, AccountTransaction, CashFlow, Portfolio, Position, Transaction } from './types';
import { Currencies } from './context/CurrencyContext';

type State = {
  securityTransactions: Transaction[];
  accountTransactions: AccountTransaction[];
  portfolios: Portfolio[];
  allPortfolios: Portfolio[];
  positions: Position[];
  accounts: Account[];
  cashflows: CashFlow[];
  newChangeLogsCount?: number;
  xirr: number;
  isLoaded: boolean;
};
type Record = { [K: string]: any };

export default function App() {
  const currencyRef = useRef<Currencies>(new Currencies(DEFAULT_BASE_CURRENCY, {}));
  const addOnOptionsRef = useRef<Record>({
    currency: DEFAULT_BASE_CURRENCY,
    privateMode: false,
    fromDate: TRANSACTIONS_FROM_DATE,
    toDate: moment().format('YYYY-MM-DD'),
  });
  const addOnOptions = addOnOptionsRef.current;

  const [state, setState] = useState<State>({
    securityTransactions: [],
    accountTransactions: [],
    portfolios: [],
    allPortfolios: [],
    positions: [],
    accounts: [],
    cashflows: [],
    xirr: 0,
    isLoaded: false,
  });

  function updateState(_state: Partial<State>) {
    console.debug('[DEBUG] Update state', { newState: _state, state });
    setState({ ...state, ..._state });
  }
  const [isLoadingOnUpdate, setLoadingOnUpdate] = useState<boolean>(false);
  const getAddon = (addOnOptionsRef: React.RefObject<Record>): any => {
    function updateOptions(_addOnOptions: Record | null, options: Record) {
      if (!_addOnOptions) return;

      Object.keys(options).forEach((option) => {
        _addOnOptions[option] = options[option];
      });
    }

    try {
      debugger;
      const addon = new Addon( 
      );

      addon.on('init', (options: { [x: string]: any; authUser?: any }) => {
        debugger;
        console.debug('Addon initialization', options);
        updateOptions(addOnOptionsRef.current, options);
        load();
        initTracking(options.authUser && options.authUser.id);
      });

      addon.on('reload', () => {
        // Start reloading
        console.debug('Reload invoked!');
      });

      addon.on('update', (options: Record) => {
        // Update according to the received options
        console.debug('Addon update - options: ', options);
        setLoadingOnUpdate(true);
        updateOptions(addOnOptionsRef.current, options);
        load();
        trackEvent('update');
      });

      return addon;
    } catch (error) {
      console.warn('Falied to load the addon -- ', error);
    }

    return null;
  };

  const addon = useRef(getAddon(addOnOptionsRef));
  const load = _.debounce(() => loadData(), 100, { leading: true });

  async function loadData() {
    console.debug('[DEBUG] Load data begin --', { addOnOptions });
    currencyRef.current.setBaseCurrency(addOnOptions.currency);
    const [transactions] = await Promise.all([
      // loadPositions(addOnOptions),
      // loadPortfolioData(addOnOptions),
      loadTransactions(addOnOptions),
      // loadInstitutionsData(addOnOptions),
    ]);

    // const currencyCache = await loadCurrenciesCache(
    //   addOnOptions.currency,
    //   Array.from(new Set(accounts.map((account) => account.currency))),
    // );
    console.debug('Loaded data', {
      // positions,
      // portfolioByDate,
      transactions,
      // accounts,
      // currencyCache,
    });

    console.log('Loaded data', {
      // positions,
      // portfolioByDate,
      transactions,
      // accounts,
      // currencyCache,
    });
    // computePortfolios(positions, portfolioByDate, transactions, accounts, currencyCache);
  }

  function loadTransactions(options: {
    [x: string]: any;
    fromDate?: any;
    groupsFilter?: any;
    institutionsFilter?: any;
    investmentsFilter?: any;
  }) {
    console.debug('Loading transactions data.');
    const fromDate = options.fromDate;
    const query = {
      assets: false,
      from: fromDate && fromDate < TRANSACTIONS_FROM_DATE ? fromDate : TRANSACTIONS_FROM_DATE,
      groups: options.groupsFilter,
      institutions: options.institutionsFilter,
      investments: options.investmentsFilter === 'all' ? null : options.investmentsFilter,
    };
    return addon.current
      .request({
        query,
        method: 'GET',
        endpoint: 'transactions',
      })
      .then((response: any) => response)
      .catch((error: any) => {
        console.error('Failed to load transactions data.', error);
      });
  }

  useEffect(() => {
    debugger;
    if (!addon.current) {
      setTimeout(() => loadStaticPortfolioData(), 0);
    }
 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addon.current]);
    
  async function loadStaticPortfolioData() {
    let institutionsData, portfolioData, positionsData, transactionsData;
    debugger;
    if (process.env.NODE_ENV === 'development') {
      [institutionsData, portfolioData, positionsData, transactionsData] = await Promise.all([
        import('./mocks/prod/institutions-prod.json').then((response) => response.default),
        import('./mocks/prod/portfolio-prod.json').then((response) => response.default),
        import('./mocks/prod/positions-prod.json').then((response) => response.default),
        import('./mocks/prod/transactions-prod.json').then((response) => response.default),
      ]);
    }

    if (!institutionsData || !institutionsData.length) {
      [institutionsData, portfolioData, positionsData, transactionsData] = await Promise.all([
        import('./mocks/institutions').then((response) => response.DATA),
        import('./mocks/portfolio').then((response) => response.DATA),
        import('./mocks/positions').then((response) => response.DATA),
        import('./mocks/transactions').then((response) => response.DATA),
      ]);
    }
 
 console.log('transactionsData',transactionsData);
  }

  if (state.isLoaded) {
    console.debug('[DEBUG] Loaded State', {
      state,
      addOnOptions,
      isLoadingOnUpdate,
    });
  }

  
  return ( 
    <div>
    <h1>Welcome to my appeeeeee</h1>
  </div>
  );
}
