import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { DefoldApp, DefoldAppContextProvider, useDefoldAppContext } from 'react-defold';

import { Switch, Case } from '../components/Switch';
import { Box } from '../components/radix/Box';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { Heading } from '../components/radix/Heading';
import { Text } from '../components/radix/Text';
import { Flex } from '../components/radix/Flex';
import { Image } from '../components/radix/Image';
import { Card } from '../components/radix/Card';
import { Link } from '../components/radix/Link';

import { WalletConnectButton, WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { SymbolIcon } from '@radix-ui/react-icons';
import { keyframes } from '@stitches/react';
import { callbackify } from 'util';

require('@solana/wallet-adapter-react-ui/styles.css');

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

const FetchNFTs: React.FC<{ connected: boolean; onTokens: (address: string, tokens: Array<Token>) => void }> = memo(
  function ConnectWallet({ connected, onTokens }) {
    const creatorAddress = '9doSyLpnDtAB4R1CVmKjwqUWP6oJ8huB1SSJksthYPS'; // Sol Souls

    const rotate = keyframes({
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    });

    const [loading, setLoading] = useState(false);
    const { publicKey } = useWallet();

    const connectWallet = useCallback(() => {}, [publicKey]);

    // Attempt auto connection to trusted wallet
    useEffect(() => {
      console.log(connected, publicKey?.toString());
      if (publicKey) {
        if (!loading) setLoading(true);
        fetch(`/api/tokens?address=${publicKey.toString()}&creator=${creatorAddress}`)
          .then((res) => res.json())
          .then((tokens) => {
            setLoading(false);
            onTokens(publicKey.toString(), tokens);
          });
      }
    }, [onTokens, publicKey, connected]);

    return (
      <>
        {publicKey ? (
          <Card variant="interactive" css={{ margin: '$4', padding: '$3' }}>
            <SymbolIcon style={{ width: '50px', height: '50px', animation: `${rotate} 3s linear infinite` }} />
          </Card>
        ) : (
          <Card variant="interactive" css={{ margin: '$4', padding: '$3' }}>
            <Text size="3">
              <a href="#connect" onClick={connectWallet} style={{ color: '#0070f3' }}>
                Connect your phantom wallet
              </a>{' '}
              to bind your wallet address.
            </Text>
          </Card>
        )}
      </>
    );
  }
);

const SelectNFT: React.FC<{
  address: string;
  tokens: Array<Token>;
  onSelect: (address: string, token: Token) => void;
}> = memo(function SelectNFT({ address, tokens, onSelect }) {
  return (
    <Flex justify="center" align="center" wrap="wrap" css={{ maxWidth: '1200px' }}>
      {tokens.map((token) => (
        <Card
          variant="interactive"
          css={{ margin: '$1', padding: '$3' }}
          key={token.address}
          onClick={() => onSelect(address, token)}
        >
          <Text as="h3" size="3" css={{ mb: '$1' }}>
            {token.metadata.name}
          </Text>
          <Image
            css={{ borderRadius: '$3' }}
            src={token.metadata.image}
            alt={token.metadata.name}
            width={200}
            height={200}
          />
        </Card>
      ))}
    </Flex>
  );
});

const GameLoop: React.FC<{ user?: string; token?: Token }> = memo(function GameLoop({ user, token }) {
  const onReceive = useCallback((command: string, payload: Record<string, unknown>) => {
    console.log(command, payload);
  }, []);

  const { send, data } = useDefoldAppContext({ onReceive });

  useEffect(() => {
    if (token) {
      const payload: Record<string, unknown> = {};
      token.metadata.attributes.forEach(({ trait_type, value }) => {
        const key = trait_type.split('/')[0].toLowerCase();
        payload[key] = trait_type.split('/')[0].toLowerCase() + '_' + value.replaceAll(' ', '_').toLowerCase();
      });
      console.log(payload);
      send('spawn', { id: user, name: token.metadata.name, token: token.address, traits: payload });
    }
  }, [send, token]);

  return (
    <Flex direction="column" justify="center" align="center" css={{ padding: '$4' }}>
      {token &&
        token.metadata.attributes.map(({ trait_type, value }) => (
          <Box css={{ padding: '$1' }} key={trait_type}>
            <Text size="3">{}</Text>
          </Box>
        ))}
    </Flex>
  );
});

const Home: NextPage = () => {
  const [step, setStep] = useState<'' | 'select-nft' | 'game-loop'>('');
  const [address, setAddress] = useState('');
  const [tokens, setTokens] = useState<Array<Token>>([]);
  const [selectedToken, setSelectedToken] = useState<Token>();
  const [userId, setUserId] = useState('');
  const { connected } = useWallet();

  useEffect(() => {
    if (!connected) setStep('');
  }, [connected]);

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

  const handleTokens = useCallback((address, tokens) => {
    setAddress(address);
    setTokens(tokens);
  }, []);

  const handleSelectToken = useCallback((address: string, token: Token) => {
    fetch(`/api/challenge?address=${address}&token=${token.address}`)
      .then((res) => res.json())
      .then(({ signature: challenge }) => {
        window.solana
          .request({
            method: 'signMessage',
            params: {
              message: new TextEncoder().encode(challenge),
              display: 'utf8',
            },
          })
          .then((signature: { publicKey: string; signature: string }) => {
            fetch(`/api/challenge`, {
              method: 'POST',
              body: JSON.stringify({ challenge, signature }, undefined, 0),
            })
              .then((res) => res.json())
              .then(({ id }) => {
                setUserId(id);
                setSelectedToken(token);
              });
          });
      });
  }, []);

  return (
    <Box css={{ backgroundColor: '$loContrast' }}>
      <Head>
        <title>Sol Souls Afterlife</title>
        <meta name="description" content="GM/GN Sol Souls Lounge" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <Flex direction="row" justify="end" gap="2" css={{ position: 'sticky', zIndex: 999, top: '$2' }}>
        <WalletMultiButton />
        <ThemeToggleButton />
        <span />
      </Flex>
      <Flex direction="column" justify="center" align="center">
        <Box css={{ margin: '$4' }}>
          <Heading as="h1" size="4">
            Sol Souls Afterlife
          </Heading>
        </Box>

        <Flex
          direction="column"
          justify="center"
          align="center"
          css={{ position: 'relative', pt: '$3', boxSizing: 'content-box', minWidth: '800px', minHeight: '640px' }}
        >
          <Flex css={{ borderRadius: '$3', overflow: 'hidden', position: 'absolute', zIndex: 0 }}>
            <DefoldApp
              root="./package/bundle/js-web/sol-souls-afterlife"
              app="solsoulsafterlife"
              width={800}
              height={640}
            />
          </Flex>

          <Flex direction="column" justify="center" align="center" css={{ position: 'absolute', zIndex: 1 }}>
            <Switch on={step}>
              <Case where="">
                <FetchNFTs connected={connected} onTokens={handleTokens} />
              </Case>
              <Case where="select-nft">
                <SelectNFT address={address} tokens={tokens} onSelect={handleSelectToken} />
              </Case>
              <Case where="game-loop">
                <DefoldAppContextProvider namespace="DefoldApp" data={{}}>
                  <GameLoop user={userId} token={selectedToken} />
                </DefoldAppContextProvider>
              </Case>
            </Switch>
          </Flex>
        </Flex>
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
