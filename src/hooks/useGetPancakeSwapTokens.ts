import { getPancakeSwapTokens } from 'packages/tokens';
import { useMemo } from 'react';

import { useAuth } from 'context/AuthContext';

function useGetPancakeSwapTokens() {
  const { chainId } = useAuth();

  return useMemo(
    () =>
      getPancakeSwapTokens({
        chainId,
      }),
    [chainId],
  );
}

export default useGetPancakeSwapTokens;