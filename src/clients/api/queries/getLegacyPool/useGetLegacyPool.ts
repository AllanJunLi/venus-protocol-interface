import { QueryObserverOptions, useQuery } from 'react-query';

import getLegacyPool, {
  GetLegacyPoolInput,
  GetLegacyPoolOutput,
} from 'clients/api/queries/getLegacyPool';
import FunctionKey from 'constants/functionKey';
import { useGetChainMetadata } from 'hooks/useGetChainMetadata';
import { useIsFeatureEnabled } from 'hooks/useIsFeatureEnabled';
import {
  useGetLegacyPoolComptrollerContract,
  useGetPrimeContract,
  useGetResilientOracleContract,
  useGetVaiControllerContract,
  useGetVenusLensContract,
} from 'packages/contracts';
import { useGetToken, useGetTokens } from 'packages/tokens';
import { useTranslation } from 'packages/translations';
import { useChainId } from 'packages/wallet';
import { ChainId } from 'types';
import { callOrThrow, generatePseudoRandomRefetchInterval } from 'utilities';

type TrimmedInput = Omit<
  GetLegacyPoolInput,
  | 'blocksPerDay'
  | 'provider'
  | 'name'
  | 'description'
  | 'venusLensContract'
  | 'legacyPoolComptrollerContract'
  | 'resilientOracleContract'
  | 'vaiControllerContract'
  | 'vai'
  | 'xvs'
  | 'tokens'
>;

export type UseGetLegacyPoolQueryKey = [
  FunctionKey.GET_LEGACY_POOL,
  TrimmedInput & { chainId: ChainId },
  additionalQueryKey?: 'PrimeCalculator',
];

type Options = QueryObserverOptions<
  GetLegacyPoolOutput,
  Error,
  GetLegacyPoolOutput,
  GetLegacyPoolOutput,
  UseGetLegacyPoolQueryKey
>;

const refetchInterval = generatePseudoRandomRefetchInterval();

const useGetLegacyPool = (input?: TrimmedInput, options?: Options) => {
  const { chainId } = useChainId();
  const { blocksPerDay } = useGetChainMetadata();

  const { t } = useTranslation();

  const xvs = useGetToken({ symbol: 'XVS' });
  const vai = useGetToken({ symbol: 'VAI' });
  const tokens = useGetTokens();
  const isPrimeEnabled = useIsFeatureEnabled({
    name: 'prime',
  });

  const legacyPoolComptrollerContract = useGetLegacyPoolComptrollerContract();
  const venusLensContract = useGetVenusLensContract();
  const resilientOracleContract = useGetResilientOracleContract();
  const vaiControllerContract = useGetVaiControllerContract();
  const primeContract = useGetPrimeContract();

  const isQueryEnabled =
    !!legacyPoolComptrollerContract &&
    !!venusLensContract &&
    !!vai &&
    !!vaiControllerContract &&
    (options?.enabled === undefined || options?.enabled);

  return useQuery(
    [FunctionKey.GET_LEGACY_POOL, { ...input, chainId }],
    () =>
      callOrThrow(
        {
          xvs,
          legacyPoolComptrollerContract,
          venusLensContract,
          resilientOracleContract,
          vai,
          vaiControllerContract,
        },
        params =>
          getLegacyPool({
            blocksPerDay,
            name: t('legacyPool.name'),
            description: t('legacyPool.description'),
            tokens,
            primeContract: isPrimeEnabled ? primeContract : undefined,
            ...input,
            ...params,
          }),
      ),
    {
      refetchInterval,
      ...options,
      enabled: isQueryEnabled,
    },
  );
};

export default useGetLegacyPool;
