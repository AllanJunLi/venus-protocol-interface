import { Select, SelectOption } from 'components';
import { useTranslation } from 'translation';
import { ChainId } from 'types';
import { cn } from 'utilities';

import { chains } from 'clients/web3';
import { chainsMetadata } from 'constants/chainsMetadata';
import { useAuth } from 'context/AuthContext';

export interface ChainSelectProps {
  className?: string;
  buttonClassName?: string;
}

const options: SelectOption<ChainId>[] = chains.map(chain => {
  const metadata = chainsMetadata[chain.id as ChainId];

  return {
    label: ({ isRenderedInButton }) => (
      <div className="flex items-center">
        <img src={metadata.logoSrc} alt={metadata.name} className="w-5 max-w-none flex-none" />

        <span
          className={cn(
            'ml-2 grow overflow-hidden text-ellipsis',
            isRenderedInButton && 'hidden lg:block',
          )}
        >
          {metadata.name}
        </span>
      </div>
    ),
    value: chain.id,
  };
});

export const ChainSelect: React.FC<ChainSelectProps> = ({ className, buttonClassName }) => {
  const { t } = useTranslation();
  const { chainId, switchChain } = useAuth();

  return (
    <Select
      value={chainId}
      onChange={newChainId => switchChain({ chainId: newChainId })}
      options={options}
      menuPosition="right"
      menuTitle={t('layout.chainSelect.label')}
      buttonClassName={buttonClassName}
      className={cn('lg:min-w-[200px]', className)}
    />
  );
};