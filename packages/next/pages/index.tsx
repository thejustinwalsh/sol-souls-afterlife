import { memo, useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

import { Switch, Case } from '../components/Switch';
import { Box } from '../components/Box';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { Heading } from '../components/Heading';
import { Text } from '../components/Text';
import { Flex } from '../components/Flex';
import { Image } from '../components/Image';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { TextField } from '../components/TextField';

declare global {
  interface Window {
    solana?: any;
  }
}

interface Token {
  address: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    external_url: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
}

const ConnectWallet: React.FC<{ onTokens: (tokens: Array<Token>) => void }> = memo(function ConnectWallet({
  onTokens,
}) {
  const CREATOR = '9doSyLpnDtAB4R1CVmKjwqUWP6oJ8huB1SSJksthYPS'; // Sol Souls

  const [walletConnected, setWalletConnected] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);

  const handleSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        fetch(`/api/tokens?address=${e.currentTarget.value}&creator=${CREATOR}`)
          .then((res) => res.json())
          .then((tokens) => {
            onTokens(tokens);
          });
      }
    },
    [onTokens]
  );

  const connectWallet = useCallback(() => {
    window.solana.connect().then(({ publicKey }: { publicKey: Symbol }) => {
      setWalletConnected(true);
      fetch(`/api/tokens?address=${publicKey.toString()}&creator=${CREATOR}`)
        .then((res) => res.json())
        .then((tokens) => {
          console.log(tokens);
          onTokens(tokens);
        });
    });
  }, [onTokens]);

  // Attempt auto connection to trusted wallet
  useEffect(() => {
    setHasWallet(window.solana !== undefined);
    if (window.solana !== undefined) {
      window.solana.connect({ onlyIfTrusted: true }).then(({ publicKey }: { publicKey: Symbol }) => {
        setWalletConnected(true);
        fetch(`/api/tokens?address=${publicKey.toString()}&creator=${CREATOR}`)
          .then((res) => res.json())
          .then((tokens) => {
            onTokens(tokens);
          });
      });
    }
  }, [onTokens]);

  return (
    <>
      {hasWallet && !walletConnected && (
        <Text size="3">
          <a href="#connect" onClick={connectWallet} style={{ color: '#0070f3' }}>
            Connect your phantom wallet
          </a>{' '}
          to bind your wallet address.
        </Text>
      )}
      {!hasWallet && (
        <Container size="4" css={{ padding: '$1' }}>
          <TextField
            type="text"
            size="2"
            placeholder="Wallet Address"
            autoComplete="off"
            css={{ mb: '$3' }}
            onKeyDown={handleSubmit}
          />
        </Container>
      )}
    </>
  );
});

const SelectNFT: React.FC<{ tokens: Array<Token>; onSelect: (token: Token) => void }> = memo(function SelectNFT({
  tokens,
  onSelect,
}) {
  return (
    <Flex justify="center" align="center" wrap="wrap" css={{ maxWidth: '1200px' }}>
      {tokens.map((token) => (
        <Card
          variant="interactive"
          css={{ margin: '$4', padding: '$3' }}
          key={token.address}
          onClick={() => onSelect(token)}
        >
          <Text as="h3" size="2" css={{ mb: '$1' }}>
            {token.metadata.name}
          </Text>
          <Image src={token.metadata.image} alt={token.metadata.name} width={200} height={200} />
        </Card>
      ))}
    </Flex>
  );
});

const GameLoop: React.FC<{ token: Token | null }> = memo(function GameLoop({ token }) {
  return (
    <Flex direction="column" justify="center" align="center" css={{ padding: '$4' }}>
      {token &&
        token.metadata.attributes.map(({ trait_type, value }) => (
          <Box css={{ padding: '$1' }} key={trait_type}>
            <Text size="3">
              {trait_type.split('/')[0].toLowerCase() + '_' + value.replaceAll(' ', '_').toLowerCase()}
            </Text>
          </Box>
        ))}
    </Flex>
  );
});

const Home: NextPage = () => {
  const [step, setStep] = useState<'' | 'select-nft' | 'game-loop'>('');
  const [tokens, setTokens] = useState<Array<Token>>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  useEffect(() => {
    if (tokens.length > 0) {
      setStep('select-nft');
    }
  }, [tokens]);

  useEffect(() => {
    if (selectedToken) {
      setStep('game-loop');
    }
  }, [selectedToken]);

  const handleTokens = useCallback((tokens) => setTokens(tokens), []);
  const handleSelectToken = useCallback((token) => setSelectedToken(token), []);

  return (
    <Box css={{ backgroundColor: '$loContrast' }}>
      <Head>
        <title>Sol Souls Afterlife</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeToggleButton />

      <Flex direction="column" justify="center" align="center" css={{ minHeight: '100vh', padding: '4rem 0' }}>
        <Box css={{ margin: '$4' }}>
          <Heading as="h1" size="4">
            Sol Souls Afterlife
          </Heading>
        </Box>

        <Switch on={step}>
          <Case where="">
            <ConnectWallet onTokens={handleTokens} />
          </Case>
          <Case where="select-nft">
            <SelectNFT tokens={tokens} onSelect={handleSelectToken} />
          </Case>
          <Case where="game-loop">
            <GameLoop token={selectedToken} />
          </Case>
        </Switch>
      </Flex>

      <Flex justify="center" align="center" css={{ padding: '$4' }}>
        <Link
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <Box css={{ fill: '$hiContrast', display: 'inline', height: '$6', marginLeft: '$1' }}>
            <svg width="72" height="16" viewBox="0 0 283 64" xmlns="http://www.w3.org/2000/svg">
              <path d="M141.04 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM248.72 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM200.24 34c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9V5h9zM36.95 0L73.9 64H0L36.95 0zm92.38 5l-27.71 48L73.91 5H84.3l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10V51h-9V17h9v9.2c0-5.08 5.91-9.2 13.2-9.2z" />
            </svg>
          </Box>
        </Link>
      </Flex>
    </Box>
  );
};

export default Home;
